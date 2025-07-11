// app/api/webhooks/vapi/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailQueue } from '@/lib/queue'
import { z } from 'zod'

// VAPI webhook payload schemas
const vapiCallSchema = z.object({
  type: z.string(),
  call: z.object({
    id: z.string(),
    customer: z.object({
      number: z.string(),
      name: z.string(),
    }),
    duration: z.number().optional(),
  }),
  timestamp: z.string(),
  endedReason: z.string().optional(),
  transcript: z.string().optional(),
  summary: z.string().optional(),
  recordingUrl: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const signature = request.headers.get('x-vapi-signature')
    // TODO: Implement signature verification for security
    
    const body = await request.json()
    console.log('VAPI webhook received:', { type: body.type, callId: body.call?.id })

    switch (body.message?.type || body.type) {
      case 'status-update':
        return handleStatusUpdate(body)
      
      case 'end-of-call-report':
        return handleEndOfCall(body)
      
      case 'transcript':
        return handleTranscript(body)
      
      default:
        console.log('Unknown webhook type:', body.type)
        return NextResponse.json({ received: true })
    }
  } catch (error) {
    console.error('VAPI webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleStatusUpdate(payload: any) {
  try {
    const { call, status } = payload.message || payload

    // Update call status in database
    await db.call.updateMany({
      where: { vapiCallId: call.id },
      data: {
        status: status === 'ended' ? 'COMPLETED' : 'IN_PROGRESS',
        ...(status === 'ended' && { endTime: new Date() })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ error: 'Status update failed' }, { status: 500 })
  }
}

async function handleEndOfCall(payload: any) {
  try {
    const data = vapiCallSchema.parse(payload.message || payload)
    
    // Clean phone number for lookup
    const phoneNumber = data.call.customer.number.replace('+', '')
    
    // Find the call record using VAPI call ID
    const callRecord = await db.call.findFirst({
      where: { vapiCallId: data.call.id },
      include: {
        worker: true,
        company: true
      }
    })

    if (!callRecord) {
      // If no call record found, try to find by phone number and create call record
      const worker = await db.worker.findFirst({
        where: { 
          phoneNumber: { contains: phoneNumber },
          isActive: true 
        },
        include: { company: true }
      })

      if (worker) {
        const newCall = await db.call.create({
          data: {
            vapiCallId: data.call.id,
            phoneNumber: data.call.customer.number,
            workerName: data.call.customer.name,
            jobSite: worker.jobSite,
            industryType: worker.industryType,
            assistantType: getAssistantType(worker.industryType),
            status: 'COMPLETED',
            startTime: new Date(data.timestamp),
            endTime: new Date(),
            duration: data.call.duration,
            endReason: data.endedReason,
            transcript: data.transcript,
            summary: data.summary,
            recordingUrl: data.recordingUrl,
            workerId: worker.id,
            companyId: worker.companyId,
          },
          include: {
            worker: true,
            company: true
          }
        })

        // Update worker status and statistics
        await updateWorkerAfterCall(worker.id, data.call.duration)
        
        // Queue email notification
        await queueEmailNotification(newCall)

        return NextResponse.json({ success: true, callId: newCall.id })
      } else {
        console.warn('No worker found for phone number:', phoneNumber)
        return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
      }
    }

    // Update existing call record
    const updatedCall = await db.call.update({
      where: { id: callRecord.id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        duration: data.call.duration,
        endReason: data.endedReason,
        transcript: data.transcript,
        summary: data.summary,
        recordingUrl: data.recordingUrl,
      },
      include: {
        worker: true,
        company: true
      }
    })

    // Update worker status and statistics
    await updateWorkerAfterCall(callRecord.workerId, data.call.duration)

    // Handle failed calls (reset status for retry)
    if (isFailedCall(data.endedReason)) {
      await db.worker.update({
        where: { id: callRecord.workerId },
        data: { status: 'NOT_CALLED' }
      })
    } else {
      // Queue email notification for successful calls
      await queueEmailNotification(updatedCall)
    }

    return NextResponse.json({ success: true, callId: updatedCall.id })
  } catch (error) {
    console.error('End of call processing error:', error)
    return NextResponse.json({ error: 'End of call processing failed' }, { status: 500 })
  }
}

async function handleTranscript(payload: any) {
  try {
    const { call, transcript } = payload.message || payload

    // Update call with real-time transcript
    await db.call.updateMany({
      where: { vapiCallId: call.id },
      data: { transcript }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Transcript update error:', error)
    return NextResponse.json({ error: 'Transcript update failed' }, { status: 500 })
  }
}

// Helper functions
function getAssistantType(industryType: string): string {
  switch (industryType) {
    case 'CONSTRUCTION': return 'steve-construction'
    case 'AUTOMOTIVE': return 'sarah-automotive'
    case 'HOSPITALITY': return 'mike-hospitality'
    default: return 'steve-construction'
  }
}

function isFailedCall(endReason?: string): boolean {
  if (!endReason) return false
  
  const failureReasons = [
    'customer-did-not-answer',
    'twilio-connection-failed',
    'customer-busy',
    'voicemail'
  ]
  
  return failureReasons.some(reason => 
    endReason.toLowerCase().includes(reason.toLowerCase())
  )
}

async function updateWorkerAfterCall(workerId: string, duration?: number) {
  const worker = await db.worker.findUnique({
    where: { id: workerId },
    select: { totalCalls: true, avgCallDuration: true }
  })

  if (!worker) return

  const newTotalCalls = worker.totalCalls + 1
  const newAvgDuration = duration 
    ? ((worker.avgCallDuration || 0) * worker.totalCalls + duration) / newTotalCalls
    : worker.avgCallDuration

  await db.worker.update({
    where: { id: workerId },
    data: {
      status: 'COMPLETED',
      lastCallDate: new Date(),
      totalCalls: newTotalCalls,
      avgCallDuration: newAvgDuration,
    }
  })
}

async function queueEmailNotification(call: any) {
  // Queue email job
  await emailQueue.add('send-call-report', {
    to: call.worker.supervisorEmail,
    subject: getEmailSubject(call),
    html: generateEmailHTML(call),
    callId: call.id,
  })
}

function getEmailSubject(call: any): string {
  const industryPrefix = {
    'CONSTRUCTION': 'Daily Site Check-in:',
    'AUTOMOTIVE': 'Parts Desk Update:',
    'HOSPITALITY': 'Service Report:',
    'RETAIL': 'Store Update:',
    'OTHER': 'Daily Check-in:'
  }
  
  return `${industryPrefix[call.industryType] || 'Daily Check-in:'} ${call.workerName} - ${call.jobSite}`
}

function generateEmailHTML(call: any): string {
  const industryColors = {
    'CONSTRUCTION': { bg: '#f5f5f5', border: '#ff6b35' },
    'AUTOMOTIVE': { bg: '#e8f4fd', border: '#1976d2' },
    'HOSPITALITY': { bg: '#fff8e1', border: '#f57c00' },
    'RETAIL': { bg: '#f3e5f5', border: '#9c27b0' },
    'OTHER': { bg: '#f5f5f5', border: '#007cba' }
  }
  
  const colors = industryColors[call.industryType] || industryColors['OTHER']
  
  return `
    <h2>${call.industryType === 'CONSTRUCTION' ? 'Daily Site Check-in Report' : 
         call.industryType === 'AUTOMOTIVE' ? 'Parts Desk Daily Report' : 
         call.industryType === 'HOSPITALITY' ? 'Service Team Report' : 
         'Daily Check-in Report'}</h2>
    
    <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-AU')}</p>
    <p><strong>Time:</strong> ${new Date().toLocaleTimeString('en-AU')}</p>
    
    <h3>Worker Details</h3>
    <p><strong>Name:</strong> ${call.workerName}</p>
    <p><strong>Phone:</strong> ${call.phoneNumber}</p>
    <p><strong>${call.industryType === 'CONSTRUCTION' ? 'Job Site' : 
                  call.industryType === 'AUTOMOTIVE' ? 'Dealership' : 
                  call.industryType === 'HOSPITALITY' ? 'Venue' : 'Location'}:</strong> ${call.jobSite}</p>
    <p><strong>Role:</strong> ${call.worker.role}</p>
    <p><strong>Industry:</strong> ${call.industryType}</p>
    
    <h3>Call Summary</h3>
    <p><strong>Call Status:</strong> ${call.endReason}</p>
    <p><strong>Duration:</strong> ${call.duration} seconds</p>
    <p><strong>Assistant:</strong> ${call.assistantType}</p>
    
    <h3>Worker Update</h3>
    <div style="background-color: ${colors.bg}; padding: 15px; border-left: 4px solid ${colors.border}; margin: 10px 0;">
      ${call.summary || 'No summary available'}
    </div>
    
    <h3>Full Transcript</h3>
    <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; font-family: monospace; font-size: 12px; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
      ${call.transcript || 'No transcript available'}
    </div>
    
    ${call.recordingUrl ? `<p><strong>Recording:</strong> <a href="${call.recordingUrl}" style="color: ${colors.border};">Click here to listen</a></p>` : ''}
    
    <hr>
    <p style="font-size: 12px; color: #666;">This is an automated report generated by Projuno's worker check-in system.</p>
  `
}