// lib/workers.ts
import { Worker } from 'bullmq'
import { redis } from './redis'
import { db } from './db'
import { vapi, getAssistantIdForIndustry, formatPhoneNumber } from './utils'
import { Resend } from 'resend'
import type { CallJobData, EmailJobData } from './queue'

const resend = new Resend(process.env.RESEND_API_KEY!)

// Call Worker - Handles making VAPI calls
export const callWorker = new Worker('worker-calls', async (job) => {
  const { workerId, companyId } = job.data as CallJobData
  
  console.log(`Processing call job for worker: ${workerId}`)
  
  try {
    // Get worker and company data
    const worker = await db.worker.findUnique({
      where: { id: workerId },
      include: { company: true }
    })
    
    if (!worker || !worker.isActive) {
      throw new Error(`Worker ${workerId} not found or inactive`)
    }
    
    // Create call record
    const call = await db.call.create({
      data: {
        phoneNumber: worker.phoneNumber,
        workerName: worker.name,
        jobSite: worker.jobSite,
        industryType: worker.industryType,
        assistantType: getAssistantType(worker.industryType),
        status: 'INITIATED',
        workerId: worker.id,
        companyId: worker.companyId,
      }
    })
    
    // Get assistant ID for this industry
    const assistantId = getAssistantIdForIndustry(worker.industryType, worker.company)
    
    // Make VAPI call
    const vapiResponse = await vapi.makeCall({
      phoneNumberId: worker.company.vapiPhoneNumberId || process.env.VAPI_PHONE_NUMBER_ID!,
      customer: {
        number: worker.phoneNumber,
        name: worker.name,
      },
      assistantId,
      assistantOverrides: {
        variableValues: {
          workerName: worker.name,
          jobSite: worker.jobSite,
          workerRole: worker.role,
          supervisorEmail: worker.supervisorEmail,
          industryType: worker.industryType,
        }
      }
    })
    
    // Update call record with VAPI call ID
    await db.call.update({
      where: { id: call.id },
      data: {
        vapiCallId: vapiResponse.id,
        status: 'IN_PROGRESS',
      }
    })
    
    // Update worker status
    await db.worker.update({
      where: { id: worker.id },
      data: { status: 'CALLED' }
    })
    
    console.log(`✅ Call initiated for ${worker.name} (${worker.phoneNumber})`)
    
    return {
      success: true,
      callId: call.id,
      vapiCallId: vapiResponse.id,
    }
    
  } catch (error) {
    console.error(`❌ Call job failed for worker ${workerId}:`, error)
    
    // Update worker status back to not called for retry
    await db.worker.update({
      where: { id: workerId },
      data: { status: 'NOT_CALLED' }
    }).catch(console.error)
    
    throw error
  }
}, {
  connection: redis,
  concurrency: 5, // Process up to 5 calls simultaneously
})

// Email Worker - Handles sending email reports
export const emailWorker = new Worker('emails', async (job) => {
  const { to, subject, html, callId } = job.data as EmailJobData
  
  console.log(`Sending email to: ${to}`)
  
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'steve@projuno.com',
      to,
      subject,
      html,
    })
    
    console.log(`✅ Email sent successfully to ${to}`)
    
    // Optional: Log email sent in database
    if (callId) {
      await db.call.update({
        where: { id: callId },
        data: {
          // Could add emailSent: true field if needed
        }
      }).catch(console.error)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error)
    throw error
  }
}, {
  connection: redis,
  concurrency: 10, // Process up to 10 emails simultaneously
})

// Helper function to get assistant type string
function getAssistantType(industryType: string): string {
  switch (industryType) {
    case 'CONSTRUCTION': return 'steve-construction'
    case 'AUTOMOTIVE': return 'sarah-automotive'
    case 'HOSPITALITY': return 'mike-hospitality'
    default: return 'steve-construction'
  }
}

// Error handling
callWorker.on('completed', (job) => {
  console.log(`✅ Call job ${job.id} completed`)
})

callWorker.on('failed', (job, err) => {
  console.error(`❌ Call job ${job?.id} failed:`, err.message)
})

emailWorker.on('completed', (job) => {
  console.log(`✅ Email job ${job.id} completed`)
})

emailWorker.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id} failed:`, err.message)
})

console.log('🚀 Job workers started')

// lib/scheduler.ts
import { callQueue } from './queue'
import { db } from './db'

export async function scheduleWorkerCalls(companyId?: string) {
  try {
    console.log('🕐 Scheduling worker calls...')
    
    // Find workers that need to be called
    const workers = await db.worker.findMany({
      where: {
        status: 'NOT_CALLED',
        isActive: true,
        ...(companyId && { companyId }),
      },
      include: {
        company: true
      },
      take: 50, // Limit to prevent overwhelming the system
    })
    
    console.log(`Found ${workers.length} workers to call`)
    
    // Queue calls for each worker
    for (const worker of workers) {
      await callQueue.add('make-call', {
        workerId: worker.id,
        companyId: worker.companyId,
      }, {
        delay: Math.random() * 30000, // Random delay 0-30 seconds to spread calls
      })
    }
    
    console.log(`✅ Queued ${workers.length} calls`)
    
    return { queued: workers.length }
    
  } catch (error) {
    console.error('❌ Failed to schedule calls:', error)
    throw error
  }
}

// Schedule calls every weekday at 9 AM
export function setupDailySchedule() {
  callQueue.add('daily-calls', {}, {
    repeat: { 
      pattern: '0 9 * * 1-5', // 9 AM Monday-Friday
      tz: 'Australia/Sydney'
    },
    removeOnComplete: 10,
    removeOnFail: 5,
  })
  
  console.log('📅 Daily call schedule setup complete')
}

// Process the daily call schedule
callQueue.process('daily-calls', async (job) => {
  console.log('🌅 Running daily call schedule')
  return await scheduleWorkerCalls()
})