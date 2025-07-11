import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { sendEmail, generateCallSummaryEmail } from '../../../lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    // Get the call ID from the query parameters
    const { callId } = req.query
    
    if (!callId || typeof callId !== 'string') {
      return res.status(400).json({ error: 'Call ID is required' })
    }

    // Get the webhook data from the request body
    const webhookData = req.body
    
    console.log('VAPI Webhook received:', JSON.stringify(webhookData, null, 2))
    
    // Verify webhook secret if configured
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = req.headers['x-vapi-signature']
      if (!signature || signature !== webhookSecret) {
        return res.status(401).json({ error: 'Invalid webhook signature' })
      }
    }

    // Find the call in the database
    const call = await db.call.findUnique({
      where: { id: callId },
      include: { worker: true }
    })

    if (!call) {
      return res.status(404).json({ error: 'Call not found' })
    }

    // Update the call based on the webhook event
    switch (webhookData.event) {
      case 'call.started':
        await db.call.update({
          where: { id: callId },
          data: {
            status: 'IN_PROGRESS',
            vapiCallId: webhookData.call_id || null
          }
        })
        break
        
      case 'call.completed':
        // Update the call with completion data
        const updatedCall = await db.call.update({
          where: { id: callId },
          data: {
            status: 'COMPLETED',
            endTime: new Date(),
            duration: webhookData.duration || null,
            endReason: webhookData.end_reason || null,
            transcript: webhookData.transcript || null,
            summary: webhookData.summary || null,
            recordingUrl: webhookData.recording_url || null,
          }
        })
        
        // Update worker status to COMPLETED
        await db.worker.update({
          where: { id: call.workerId },
          data: { status: 'COMPLETED' }
        })
        
        // Send email to supervisor if supervisor email is available
        try {
          if (call.worker.supervisorEmail) {
            // Generate and send the email
            const emailHtml = generateCallSummaryEmail({
              workerName: call.worker.name,
              phoneNumber: call.phoneNumber,
              jobSite: call.worker.jobSite,
              workerRole: call.worker.role,
              industryType: call.worker.industryType,
              summary: updatedCall.summary || '',
              transcript: updatedCall.transcript || '',
              recordingUrl: updatedCall.recordingUrl || '',
              duration: updatedCall.duration || 0,
              endReason: updatedCall.endReason || '',
              startTime: call.startTime,
              endTime: updatedCall.endTime || new Date()
            })
            
            await sendEmail({
              to: call.worker.supervisorEmail,
              subject: `Call Summary for ${call.worker.name}`,
              html: emailHtml
            })
            
            console.log(`Email sent to supervisor: ${call.worker.supervisorEmail}`)
          } else {
            console.log('Email not sent: Missing supervisor email')
          }
        } catch (emailError) {
          // Log the error but don't fail the webhook processing
          console.error('Error sending supervisor email:', emailError)
        }
        break
        
      case 'call.failed':
        await db.call.update({
          where: { id: callId },
          data: {
            status: 'FAILED',
            endTime: new Date(),
            endReason: webhookData.error || 'Unknown error'
          }
        })
        break
        
      default:
        // Log other events but don't take action
        console.log(`Unhandled webhook event: ${webhookData.event}`)
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return res.status(500).json({ error: 'Failed to process webhook' })
  }
}
