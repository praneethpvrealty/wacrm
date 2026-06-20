import { supabaseAdmin } from '@/lib/automations/admin-client'
import { sanitizePhoneForMeta, isValidE164 } from '@/lib/whatsapp/phone-utils'
import { sendWhatsAppMessageAndPersist } from '@/lib/whatsapp/meta-api-dispatcher'

export async function checkAndSendAppointmentReminders(): Promise<void> {
  const admin = supabaseAdmin()
  const now = new Date()
  const target24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  
  // Query scheduled appointments starting in the next 24 hours that haven't sent at least one reminder
  const { data: appointments, error } = await admin
    .from('appointments')
    .select('*, contact:contacts(*), property:properties(id, title, location, sublocality), account:accounts(name)')
    .eq('status', 'scheduled')
    .gt('start_time', now.toISOString())
    .lte('start_time', target24h.toISOString())
    .or('reminder_24h_sent.eq.false,reminder_2h_sent.eq.false')

  if (error) {
    console.error('[Reminder Cron] Error fetching appointments:', error)
    return
  }

  if (!appointments || appointments.length === 0) {
    return
  }

  const target2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)

  for (const appt of appointments) {
    const startTimeDate = new Date(appt.start_time)
    const isDue2h = startTimeDate <= target2h && !appt.reminder_2h_sent
    // Send 24h reminder if start_time is between 2h and 24h, and 24h reminder is not sent
    const isDue24h = startTimeDate <= target24h && startTimeDate > target2h && !appt.reminder_24h_sent

    // If neither is due, skip
    if (!isDue2h && !isDue24h) continue

    const reminderType = isDue2h ? '2h' : '24h'
    console.log(`[Reminder Cron] Sending ${reminderType} reminder for appointment "${appt.title}" (ID: ${appt.id})`)

    // Verify contact has a valid phone
    const contact = appt.contact
    if (!contact || !contact.phone) {
      console.warn(`[Reminder Cron] Contact missing or has no phone for appointment: ${appt.id}`)
      // Mark as sent so we don't keep checking it
      await admin
        .from('appointments')
        .update(isDue2h ? { reminder_2h_sent: true } : { reminder_24h_sent: true })
        .eq('id', appt.id)
      continue
    }

    const sanitizedPhone = sanitizePhoneForMeta(contact.phone)
    if (!isValidE164(sanitizedPhone)) {
      console.warn(`[Reminder Cron] Invalid phone format: ${contact.phone}`)
      // Mark as sent to prevent infinite loops
      await admin
        .from('appointments')
        .update(isDue2h ? { reminder_2h_sent: true } : { reminder_24h_sent: true })
        .eq('id', appt.id)
      continue
    }

    const accountName = (appt.account as { name: string } | null)?.name || 'our team'

    // Format the time parameter nicely in IST timezone
    const formattedTime = startTimeDate.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    const bodyText = `Hi ${contact.name || 'Client'}, this is a friendly reminder for your scheduled property visit for "${appt.property?.title || appt.title || 'Property visit'}" on ${formattedTime}. Location: ${appt.location || 'Scheduled Location'}. Regards, ${accountName}.`

    const result = await sendWhatsAppMessageAndPersist({
      accountId: appt.account_id,
      userId: appt.user_id || null,
      contactId: contact.id,
      kind: 'template',
      senderType: 'agent', // reminders logged as sent by agent
      templateName: 'property_visit_reminder',
      templateLanguage: 'en_US',
      templateParams: [
        contact.name || 'Client',
        appt.property?.title || appt.title || 'Property visit',
        formattedTime,
        appt.location || 'Scheduled Location',
        accountName
      ],
      text: bodyText, // Store formatted preview text in DB
      customDbClient: admin
    })

    if (result.success) {
      console.log(`[Reminder Cron] Successfully sent reminder. Msg ID: ${result.messageId}`)
      
      // Update appointment reminder status
      await admin
        .from('appointments')
        .update(isDue2h ? { reminder_2h_sent: true } : { reminder_24h_sent: true })
        .eq('id', appt.id)
    } else {
      console.error(`[Reminder Cron] Failed to send reminder to ${contact.phone}. Error:`, result.error)
      // Note: we don't mark as sent here so that we can retry on next cron tick if it was a transient error.
    }
  }
}

