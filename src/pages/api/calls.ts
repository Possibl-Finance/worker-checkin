import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
// Import the makeOutboundCall function from the lib directory
import { makeOutboundCall } from '../../../lib/vapi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { workerId } = req.body

      if (!workerId) {
        return res.status(400).json({ error: 'Worker ID is required' })
      }

      // Check if worker exists and get worker details
      const worker = await db.worker.findUnique({
        where: { id: workerId },
        include: {
          company: true
        }
      })

      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' })
      }

      // Determine assistant type based on industry
      let assistantType = 'DEFAULT'
      switch (worker.industryType) {
        case 'CONSTRUCTION':
          assistantType = 'CONSTRUCTION'
          break
        case 'AUTOMOTIVE':
          assistantType = 'AUTOMOTIVE'
          break
        case 'HOSPITALITY':
          assistantType = 'HOSPITALITY'
          break
        default:
          assistantType = 'DEFAULT'
      }

      // Create a new call with all required fields
      const call = await db.call.create({
        data: {
          workerId,
          companyId: worker.companyId,
          phoneNumber: worker.phoneNumber,
          workerName: worker.name,
          jobSite: worker.jobSite,
          industryType: worker.industryType,
          assistantType,
          status: 'INITIATED',
          startTime: new Date(),
        }
      })

      // Get current worker status
      const currentWorker = await db.worker.findUnique({
        where: { id: workerId },
        select: { status: true }
      });
      
      // Update worker - only change status if not already CALLED
      await db.worker.update({
        where: { id: workerId },
        data: { 
          // Only update status if not already CALLED
          ...(currentWorker?.status !== 'CALLED' ? { status: 'CALLED' } : {}),
          lastCallDate: new Date(),
          totalCalls: {
            increment: 1
          }
        }
      })

      // Initiate the actual phone call using VAPI
      let vapiCallId = null
      let vapiError = null
      
      try {
        // Check if required environment variables are set
        if (!process.env.VAPI_API_KEY) {
          throw new Error('VAPI_API_KEY environment variable is not set');
        }
        
        if (!process.env.VAPI_PHONE_NUMBER_ID) {
          throw new Error('VAPI_PHONE_NUMBER_ID environment variable is not set');
        }
        
        // Log the environment variables (masked for security)
        console.log('VAPI environment variables:', {
          VAPI_API_KEY: process.env.VAPI_API_KEY ? '***' : undefined,
          VAPI_PHONE_NUMBER_ID: process.env.VAPI_PHONE_NUMBER_ID ? '***' : undefined,
          VAPI_CONSTRUCTION_ASSISTANT_ID: process.env.VAPI_CONSTRUCTION_ASSISTANT_ID ? '***' : undefined,
          VAPI_AUTOMOTIVE_ASSISTANT_ID: process.env.VAPI_AUTOMOTIVE_ASSISTANT_ID ? '***' : undefined,
          VAPI_HOSPITALITY_ASSISTANT_ID: process.env.VAPI_HOSPITALITY_ASSISTANT_ID ? '***' : undefined,
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
        });
        
        console.log('Initiating VAPI call for worker:', {
          workerId: worker.id,
          phoneNumber: worker.phoneNumber,
          name: worker.name,
          callId: call.id,
          industryType: worker.industryType
        })
        
        const vapiResponse = await makeOutboundCall({
          phoneNumber: worker.phoneNumber,
          workerId: worker.id,
          workerName: worker.name,
          industryType: worker.industryType,
          jobSite: worker.jobSite,
          callId: call.id,
          workerRole: worker.role || '',
          supervisorEmail: worker.supervisorEmail || ''
        })
        
        // Update the call with the VAPI call ID
        if (vapiResponse && vapiResponse.call_id) {
          vapiCallId = vapiResponse.call_id
          await db.call.update({
            where: { id: call.id },
            data: { vapiCallId: vapiResponse.call_id }
          })
        }
        
        console.log('VAPI call initiated successfully:', vapiResponse)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        vapiError = errorMessage;
        console.error('Failed to initiate VAPI call:', error)
        
        // Update the call with the error information
        await db.call.update({
          where: { id: call.id },
          data: { 
            status: 'FAILED',
            endTime: new Date(),
            endReason: vapiError
          }
        })
        
        // We don't want to fail the API response if VAPI call fails
        // Just log the error and continue
      }

      return res.status(201).json({ 
        success: true, 
        call,
        vapiCallId,
        vapiError
      })
    } catch (error: unknown) {
      console.error('Error creating call:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: 'Failed to create call', details: errorMessage })
    }
  } else if (req.method === 'GET') {
    try {
      const calls = await db.call.findMany({
        include: {
          worker: {
            select: {
              id: true,
              name: true,
              phoneNumber: true
            }
          }
        },
        orderBy: { startTime: 'desc' }
      })

      return res.status(200).json({ calls })
    } catch (error) {
      console.error('Error fetching calls:', error)
      return res.status(500).json({ error: 'Failed to fetch calls' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}
