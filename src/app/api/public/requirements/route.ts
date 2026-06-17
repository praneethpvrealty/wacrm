import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/automations/admin-client";
import { normalizePhoneWithCountryCode } from "@/lib/whatsapp/phone-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      phone, 
      email, 
      categories, // string[]
      locations, // string[]
      minBudget, // number | null
      maxBudget, // number | null
      minRoi, // number | null
      notes, // string
      accountId, 
      referrerContactId 
    } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "Missing required 'accountId' field" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Missing required 'phone' field" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneWithCountryCode(phone, "91");
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const admin = supabaseAdmin();

    // 1. Fetch account owner to use as default user_id
    const { data: account, error: accountError } = await admin
      .from("accounts")
      .select("owner_user_id")
      .eq("id", accountId)
      .maybeSingle();

    if (accountError || !account) {
      console.error("[POST /api/public/requirements] Account lookup failed:", accountError);
      return NextResponse.json(
        { error: "Invalid account ID" },
        { status: 400 }
      );
    }

    const systemUserId = account.owner_user_id;
    let targetAgentUserId = systemUserId;

    // Resolve target agent's user_id from the referrer contact ID
    if (referrerContactId) {
      const { data: refContact } = await admin
        .from("contacts")
        .select("email")
        .eq("id", referrerContactId)
        .maybeSingle();

      if (refContact?.email) {
        const { data: agentProfile } = await admin
          .from("profiles")
          .select("user_id")
          .eq("email", refContact.email)
          .maybeSingle();

        if (agentProfile?.user_id) {
          targetAgentUserId = agentProfile.user_id;
        }
      }
    }

    // 2. Check if contact exists under this account
    const { data: existingContact, error: findError } = await admin
      .from("contacts")
      .select("id, name, email")
      .eq("account_id", accountId)
      .eq("phone", normalizedPhone)
      .maybeSingle();

    if (findError) {
      console.error("[POST /api/public/requirements] Contact lookup failed:", findError);
      return NextResponse.json(
        { error: "Failed to process requirements" },
        { status: 500 }
      );
    }

    let contactId: string;

    const contactFields = {
      name: (name || "Website Lead").trim(),
      email: email ? email.trim().toLowerCase() : null,
      classification: "Buyer" as const,
      status: "pending_review" as const,
      min_budget: minBudget || null,
      max_budget: maxBudget || null,
      areas_of_interest: locations || [],
      property_interests: categories || [],
      min_roi: minRoi || null,
      requirements: notes || null,
      referrer_contact_id: referrerContactId || null,
      updated_at: new Date().toISOString(),
    };

    if (existingContact) {
      contactId = existingContact.id;
      // Update existing contact preferences
      const updates: Record<string, unknown> = {
        ...contactFields,
        name: existingContact.name || contactFields.name,
        email: existingContact.email || contactFields.email,
      };

      await admin
        .from("contacts")
        .update(updates)
        .eq("id", contactId);
    } else {
      // Create new contact
      const { data: newContact, error: createError } = await admin
        .from("contacts")
        .insert([
          {
            account_id: accountId,
            user_id: targetAgentUserId,
            phone: normalizedPhone,
            referrer: "Website Requirements Form",
            ...contactFields,
          },
        ])
        .select("id")
        .single();

      if (createError) {
        console.error("[POST /api/public/requirements] Contact creation failed:", createError);
        return NextResponse.json(
          { error: "Failed to create contact" },
          { status: 500 }
        );
      }

      contactId = newContact.id;
    }

    // 3. Add details as a contact note
    let noteText = `Website Requirements Profile Submitted:\n` +
      `• Budget: ${minBudget ? `₹${minBudget.toLocaleString('en-IN')}` : 'Any'} to ${maxBudget ? `₹${maxBudget.toLocaleString('en-IN')}` : 'Any'}\n` +
      `• Categories: ${(categories && categories.length > 0) ? categories.join(', ') : 'Any'}\n` +
      `• Locations: ${(locations && locations.length > 0) ? locations.join(', ') : 'Any'}\n`;
    if (minRoi) {
      noteText += `• Expected Min ROI/Yield: ${minRoi}%\n`;
    }
    if (notes) {
      noteText += `• Additional Notes: ${notes.trim()}\n`;
    }

    await admin
      .from("contact_notes")
      .insert([
        {
          account_id: accountId,
          contact_id: contactId,
          user_id: targetAgentUserId,
          note_text: noteText,
        },
      ]);

    // 4. Create a Todo task for the team
    await admin
      .from("todos")
      .insert([
        {
          account_id: accountId,
          user_id: targetAgentUserId,
          title: `New Buyer Requirements - @${name || phone}`,
          description: `Visitor ${name || ""} (${phone}) shared their requirements. Budget: ${minBudget || 'Any'}-${maxBudget || 'Any'}. Locations: ${locations ? locations.join(', ') : 'Any'}. Follow up.`,
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: "high",
          completed: false,
          contact_id: contactId,
        },
      ]);

    // 5. Route the inquiry as an inbox message
    try {
      const { data: existingConv, error: findConvError } = await admin
        .from("conversations")
        .select("*")
        .eq("account_id", accountId)
        .eq("contact_id", contactId)
        .maybeSingle();

      let conversationId: string | undefined;
      let currentUnreadCount = 0;

      if (!findConvError && existingConv) {
        conversationId = existingConv.id;
        currentUnreadCount = existingConv.unread_count || 0;
      } else {
        const { data: newConv } = await admin
          .from("conversations")
          .insert({
            account_id: accountId,
            user_id: targetAgentUserId,
            contact_id: contactId,
            unread_count: 0,
          })
          .select()
          .single();
        conversationId = newConv?.id;
      }

      if (conversationId) {
        const inboxText = `📋 *Property Requirements Submitted*\n\n` +
          ResolvedRequirementsInboxText(name, normalizedPhone, email, categories, locations, minBudget, maxBudget, minRoi, notes);

        const { error: msgInsertError } = await admin.from("messages").insert({
          conversation_id: conversationId,
          sender_type: "customer",
          content_type: "text",
          content_text: inboxText,
          message_id: `web-requirements-${Date.now()}`,
          status: "delivered",
          created_at: new Date().toISOString(),
        });

        if (!msgInsertError) {
          await admin
            .from("conversations")
            .update({
              last_message_text: inboxText,
              last_message_at: new Date().toISOString(),
              unread_count: currentUnreadCount + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", conversationId);
        }
      }
    } catch (inboxErr) {
      console.error("[POST /api/public/requirements] Failed to route to inbox:", inboxErr);
    }

    return NextResponse.json({ success: true, contactId });
  } catch (err) {
    console.error("[POST /api/public/requirements] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function ResolvedRequirementsInboxText(
  name: string,
  phone: string,
  email: string | undefined,
  categories: string[] | undefined,
  locations: string[] | undefined,
  minBudget: number | undefined,
  maxBudget: number | undefined,
  minRoi: number | undefined,
  notes: string | undefined
) {
  let text = `👤 *Name*: ${name || "Website Lead"}\n` +
    `📞 *Phone*: ${phone}\n`;
  if (email) text += `📧 *Email*: ${email.trim().toLowerCase()}\n`;
  text += `\n*Preferences*:\n` +
    `• Budget: ${minBudget ? `₹${minBudget.toLocaleString('en-IN')}` : 'Any'} - ${maxBudget ? `₹${maxBudget.toLocaleString('en-IN')}` : 'Any'}\n` +
    `• Categories: ${(categories && categories.length > 0) ? categories.join(', ') : 'Any'}\n` +
    `• Locations: ${(locations && locations.length > 0) ? locations.join(', ') : 'Any'}\n`;
  if (minRoi) {
    text += `• Min Yield ROI: ${minRoi}%\n`;
  }
  if (notes) {
    text += `💬 *Additional Notes*: ${notes.trim()}\n`;
  }
  return text;
}
