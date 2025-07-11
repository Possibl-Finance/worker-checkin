import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Company ID is required' })
  }

  // Handle GET request to fetch company details
  if (req.method === 'GET') {
    try {
      const company = await db.company.findUnique({
        where: { id }
      })

      if (!company) {
        return res.status(404).json({ error: 'Company not found' })
      }

      return res.status(200).json(company)
    } catch (error) {
      console.error('Error fetching company:', error)
      return res.status(500).json({ error: 'Failed to fetch company' })
    }
  }
  
  // Handle PUT request to update company settings
  else if (req.method === 'PUT') {
    try {
      const {
        name,
        slug,
        website,
        contactEmail,
        contactPhone,
        address,
        defaultSupervisorEmail,
        emailNotificationsEnabled,
        // We don't update these directly as they're environment variables
        vapiApiKey,
        vapiPhoneNumberId,
        vapiConstructionAssistantId,
        vapiAutomotiveAssistantId,
        vapiHospitalityAssistantId,
        gmailUser,
        gmailAppPassword,
        ...otherFields
      } = req.body

      // Only update fields that are stored in the database
      const company = await db.company.update({
        where: { id },
        data: {
          name,
          slug,
          website,
          contactEmail,
          contactPhone,
          address,
          defaultSupervisorEmail,
          emailNotificationsEnabled,
          ...otherFields
        }
      })

      // Note: For a production app, you would want to update environment variables
      // or a secure configuration store here for the VAPI and Gmail settings
      // This would require server-side code outside of the API route

      return res.status(200).json({ success: true, company })
    } catch (error) {
      console.error('Error updating company settings:', error)
      return res.status(500).json({ error: 'Failed to update company settings' })
    }
  }
  
  // Handle unsupported methods
  else {
    res.setHeader('Allow', ['GET', 'PUT'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }
}
