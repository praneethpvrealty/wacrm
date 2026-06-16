import { NextResponse } from 'next/server'
import { checkAndSendAppointmentReminders } from '@/lib/appointments/reminder'

export async function GET(request: Request) {
  const expected = process.env.AUTOMATION_CRON_SECRET
  if (!expected) {
    return NextResponse.json({ error: 'cron not configured' }, { status: 503 })
  }
  const supplied = request.headers.get('x-cron-secret')
  if (supplied !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await checkAndSendAppointmentReminders()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Appointments Cron] Check failed:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
