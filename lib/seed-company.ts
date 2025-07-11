import { db } from './db'

export async function ensureTestCompany() {
  try {
    let company = await db.company.findFirst({
      where: { slug: 'test-company' }
    })

    if (!company) {
      company = await db.company.create({
        data: {
          name: 'Test Company',
          slug: 'test-company',
          fromEmail: 'test@projuno.com',
        }
      })
    }

    return company
  } catch (error) {
    console.error('Failed to create test company:', error)
    return null
  }
}