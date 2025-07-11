import { useState } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Clock, Building, Briefcase } from "lucide-react"
import Link from "next/link"
import AdminLayout from '@/components/ui/AdminLayout'
import { GetServerSideProps } from 'next'
import { ensureTestCompany } from '../../../../lib/seed-company'

interface NewWorkerPageProps {
  companyId: string;
}

export default function NewWorkerPage({ companyId }: NewWorkerPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    jobSite: '',
    role: '',
    industryType: '',
    supervisorEmail: '',
    timezone: 'Australia/Sydney',
    preferredCallTime: '09:00'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          companyId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to create worker')
      }

      router.push('/admin/workers')
    } catch (error) {
      console.error('Error creating worker:', error)
      alert('Failed to create worker. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-2 text-gray-500 hover:text-gray-700 h-8 px-2">
            <Link href="/admin/workers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-medium">Add New Worker</h1>
        </div>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-orange-500 mr-2" />
              <CardTitle className="text-base font-medium">Worker Information</CardTitle>
            </div>
            <CardDescription className="text-gray-500 text-sm">
              Enter the worker's details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+61 412 345 678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    className="border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jobSite" className="text-sm font-medium text-gray-700">Job Site / Location</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="jobSite"
                      placeholder="CBD Construction Site"
                      value={formData.jobSite}
                      onChange={(e) => setFormData({...formData, jobSite: e.target.value})}
                      className="pl-9 border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role / Position</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="role"
                      placeholder="Electrician, Parts Advisor, etc."
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="pl-9 border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industryType" className="text-sm font-medium text-gray-700">Industry Type</Label>
                <Select 
                  value={formData.industryType} 
                  onValueChange={(value) => setFormData({...formData, industryType: value})}
                >
                  <SelectTrigger className="border-gray-200 focus:ring-orange-500 focus:border-orange-500">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CONSTRUCTION">Construction</SelectItem>
                    <SelectItem value="AUTOMOTIVE">Automotive</SelectItem>
                    <SelectItem value="HOSPITALITY">Hospitality</SelectItem>
                    <SelectItem value="RETAIL">Retail</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisorEmail" className="text-sm font-medium text-gray-700">Supervisor Email</Label>
                <Input
                  id="supervisorEmail"
                  type="email"
                  placeholder="supervisor@company.com"
                  value={formData.supervisorEmail}
                  onChange={(e) => setFormData({...formData, supervisorEmail: e.target.value})}
                  className="border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">Timezone</Label>
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(value) => setFormData({...formData, timezone: value})}
                  >
                    <SelectTrigger className="border-gray-200 focus:ring-orange-500 focus:border-orange-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Australia/Sydney">Sydney</SelectItem>
                      <SelectItem value="Australia/Melbourne">Melbourne</SelectItem>
                      <SelectItem value="Australia/Brisbane">Brisbane</SelectItem>
                      <SelectItem value="Australia/Perth">Perth</SelectItem>
                      <SelectItem value="Australia/Adelaide">Adelaide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferredCallTime" className="text-sm font-medium text-gray-700">Preferred Call Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="preferredCallTime"
                      type="time"
                      value={formData.preferredCallTime}
                      onChange={(e) => setFormData({...formData, preferredCallTime: e.target.value})}
                      className="pl-9 border-gray-200 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white h-9"
                >
                  {loading ? 'Creating...' : 'Create Worker'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  asChild
                  className="border-gray-200 hover:bg-gray-50 text-gray-700 h-9"
                >
                  <Link href="/admin/workers">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const company = await ensureTestCompany();
    
    if (!company) {
      throw new Error('Failed to get company');
    }
    
    return {
      props: {
        companyId: company.id,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        companyId: '',
        error: 'Failed to load company data',
      },
    };
  }
}