import { NextApiRequest, NextApiResponse } from 'next'
import { ensureTestCompany } from '../../../lib/seed-company'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const company = await ensureTestCompany()
      
      if (!company) {
        return res.status(500).json({ error: 'Failed to create test company' })
      }
      
      return res.status(200).json({ 
        success: true, 
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug
        }
      })
    } catch (error) {
      console.error('Error creating test company:', error)
      return res.status(500).json({ error: 'Failed to create test company' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}
