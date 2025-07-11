import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { sendEmail, generateCallSummaryEmail } from '../../../lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const { callId, supervisorEmail } = req.body

    if (!callId) {
      return res.status(400).json({ error: 'Call ID is required' })
    }

    if (!supervisorEmail) {
      return res.status(400).json({ error: 'Supervisor email is required' })
    }

    // Find the call in the database
    const call = await db.call.findUnique({
      where: { id: callId },
      include: { worker: true }
    })

    if (!call) {
      return res.status(404).json({ error: 'Call not found' })
    }

    // Generate and send the email
    const emailHtml = generateCallSummaryEmail({
      workerName: call.worker.name,
      phoneNumber: call.phoneNumber,
      jobSite: call.worker.jobSite,
      workerRole: call.worker.role || '',
      industryType: call.worker.industryType,
      summary: call.summary || '',
      transcript: call.transcript || '',
      recordingUrl: call.recordingUrl || '',
      duration: call.duration || 0,
      endReason: call.endReason || '',
      startTime: call.startTime,
      endTime: call.endTime || new Date()
    })
    
    const emailResult = await sendEmail({
      to: supervisorEmail,
      subject: `Call Summary for ${call.worker.name}`,
      html: emailHtml
    })
    
    if (!emailResult) {
      return res.status(500).json({ error: 'Failed to send email' })
    }
    
    console.log(`Email sent to supervisor: ${supervisorEmail}`)
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return res.status(500).json({ error: 'Failed to send email' })
  }
}
