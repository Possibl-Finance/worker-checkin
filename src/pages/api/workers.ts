import { NextApiRequest, NextApiResponse } from 'next'
import { WorkerStatus, Prisma } from '@prisma/client'
import { db } from '../../../lib/db'
import { ensureTestCompany } from '../../../lib/seed-company'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { 
        name, 
        phoneNumber, 
        jobSite, 
        role, 
        industryType, 
        supervisorEmail, 
        timezone, 
        preferredCallTime,
        companyId 
      } = req.body

      // Validate required fields
      if (!name || !phoneNumber) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      // Get or create company
      let company;
      
      if (companyId) {
        // Try to find the company by ID
        company = await db.company.findUnique({
          where: { id: companyId }
        });
      }
      
      // If no company found or no companyId provided, use the test company
      if (!company) {
        console.log('Company not found with ID:', companyId, 'Using test company instead');
        company = await ensureTestCompany();
        
        if (!company) {
          return res.status(500).json({ error: 'Failed to create or find company' });
        }
      }
      
      // We now allow multiple workers with the same phone number in the same company
      // No need to check for existing workers

      // Create the worker
      const worker = await db.worker.create({
        data: {
          name,
          phoneNumber,
          jobSite: jobSite || '',
          role: role || '',
          industryType: industryType || 'CONSTRUCTION',
          supervisorEmail: supervisorEmail || '',
          timezone: timezone || 'Australia/Sydney',
          preferredCallTime: preferredCallTime || '09:00',
          status: WorkerStatus.ACTIVE,
          company: {
            connect: {
              id: company.id
            }
          }
        }
      })

      return res.status(201).json(worker)
    } catch (error) {
      console.error('Error creating worker:', error)
      
      // Log the specific error for debugging
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error code:', error.code);
      }
      
      return res.status(500).json({ error: 'Failed to create worker', details: error.message })
    }
  } else {
    // Handle GET request to fetch all workers
    if (req.method === 'GET') {
      try {
        const workers = await db.worker.findMany()
        return res.status(200).json(workers)
      } catch (error) {
        console.error('Error fetching workers:', error)
        return res.status(500).json({ error: 'Failed to fetch workers' })
      }
    }
    
    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}
