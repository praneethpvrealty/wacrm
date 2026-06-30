import { NextRequest, NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// POST /api/contacts/merge
// Body: { sourceId: string, targetId: string }
//
// Merges `source` into `target`:
//   1. Re-points conversations, notes, tags, custom values, inquiries → target
//   2. Fills any gaps on target from source (name, email, budget, etc.)
//   3. Marks source as is_merged = true, sets merged_into_id = target
//   4. Writes a merge log entry
//
// Requires agent+ role. Both contacts must belong to the caller's account.

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireRole('agent');
    const body = await request.json() as { sourceId?: string; targetId?: string };

    const { sourceId, targetId } = body;
    if (!sourceId || !targetId) {
      return NextResponse.json({ error: 'sourceId and targetId are required' }, { status: 400 });
    }
    if (sourceId === targetId) {
      return NextResponse.json({ error: 'Source and target must be different contacts' }, { status: 400 });
    }

    const admin = adminClient();

    // Verify both contacts belong to the caller's account and are not already merged
    const { data: contacts, error: fetchErr } = await admin
      .from('contacts')
      .select('id, account_id, name, email, phone, max_budget, areas_of_interest, property_interests, source, classification, referrer, referrer_contact_id, is_merged')
      .in('id', [sourceId, targetId])
      .eq('account_id', ctx.accountId);

    if (fetchErr) throw fetchErr;
    if (!contacts || contacts.length !== 2) {
      return NextResponse.json({ error: 'One or both contacts not found in your account' }, { status: 404 });
    }

    const source = contacts.find((c) => c.id === sourceId)!;
    const target = contacts.find((c) => c.id === targetId)!;

    if (source.is_merged) {
      return NextResponse.json({ error: 'Source contact is already merged' }, { status: 400 });
    }

    // ── 1. Re-point child rows from source → target ────────────────────────

    // Conversations — use upsert logic: only re-point if target doesn't already
    // have a conversation (to avoid duplicate conversations per contact)
    const { data: targetConvs } = await admin
      .from('conversations')
      .select('id')
      .eq('contact_id', targetId)
      .limit(1);

    if (!targetConvs || targetConvs.length === 0) {
      // Target has no conversations — move source's to target
      await admin
        .from('conversations')
        .update({ contact_id: targetId })
        .eq('contact_id', sourceId)
        .eq('account_id', ctx.accountId);
    }
    // If target already has conversations, source conversations become orphaned
    // (source will be soft-deleted, they remain readable via merged_into_id path)

    // Notes, tags, custom values, inquiries — always re-point
    await Promise.all([
      admin.from('contact_notes')
        .update({ contact_id: targetId })
        .eq('contact_id', sourceId),

      admin.from('contact_tags')
        .update({ contact_id: targetId })
        .eq('contact_id', sourceId),

      admin.from('contact_custom_values')
        .update({ contact_id: targetId })
        .eq('contact_id', sourceId),

      admin.from('contact_property_inquiries')
        .update({ contact_id: targetId })
        .eq('contact_id', sourceId),
    ]);

    // ── 2. Fill gaps on target ─────────────────────────────────────────────
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (!target.name && source.name) patch.name = source.name;
    if (!target.email && source.email) patch.email = source.email;
    if (!target.max_budget && source.max_budget) patch.max_budget = source.max_budget;
    if ((!target.areas_of_interest || target.areas_of_interest.length === 0) && source.areas_of_interest?.length) {
      patch.areas_of_interest = source.areas_of_interest;
    }
    if ((!target.property_interests || target.property_interests.length === 0) && source.property_interests?.length) {
      patch.property_interests = source.property_interests;
    }
    if (!target.source && source.source) patch.source = source.source;

    if (Object.keys(patch).length > 1) {
      await admin.from('contacts').update(patch).eq('id', targetId);
    }

    // ── 3. Soft-delete source ──────────────────────────────────────────────
    await admin.from('contacts').update({
      is_merged: true,
      merged_into_id: targetId,
      updated_at: new Date().toISOString(),
    }).eq('id', sourceId);

    // ── 4. Write merge log ────────────────────────────────────────────────
    await admin.from('contact_merge_log').insert({
      account_id: ctx.accountId,
      merged_by: ctx.userId,
      source_id: sourceId,
      target_id: targetId,
      source_snapshot: source,
    });

    return NextResponse.json({ success: true, targetId });
  } catch (err) {
    return toErrorResponse(err);
  }
}
