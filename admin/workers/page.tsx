// app/admin/workers/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"

// Get workers data
async function getWorkers() {
  return await db.worker.findMany({
    include: {
      company: {
        select: { name: true, slug: true }
      },
      calls: {
        select: { id: true, status: true, startTime: true },
        orderBy: { startTime: 'desc' },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

export default async function WorkersPage() {
  const workers = await getWorkers()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Workers</h1>
          <p className="text-muted-foreground">
            Manage your worker database and check-in status
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/workers/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Worker
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input 
                placeholder="Search workers..." 
                className="w-full"
                // TODO: Add search functionality
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button>
              <Phone className="h-4 w-4 mr-2" />
              Start Calls
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Workers</CardDescription>
            <CardTitle className="text-2xl">{workers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not Called</CardDescription>
            <CardTitle className="text-2xl">
              {workers.filter(w => w.status === 'NOT_CALLED').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Called Today</CardDescription>
            <CardTitle className="text-2xl">
              {workers.filter(w => w.status === 'CALLED').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">
              {workers.filter(w => w.status === 'COMPLETED').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Workers List */}
      <Card>
        <CardHeader>
          <CardTitle>All Workers</CardTitle>
          <CardDescription>
            {workers.length} workers across all job sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workers.map((worker) => (
              <div key={worker.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium">{worker.name}</h3>
                    <p className="text-sm text-muted-foreground">{worker.jobSite}</p>
                    <p className="text-sm text-muted-foreground">{worker.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{worker.phoneNumber}</p>
                    <p className="text-sm text-muted-foreground">{worker.supervisorEmail}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={getIndustryBadgeVariant(worker.industryType)}>
                      {worker.industryType}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(worker.status)}>
                      {worker.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/workers/${worker.id}`}>
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {workers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No workers found</p>
              <Button asChild>
                <Link href="/admin/workers/new">Add your first worker</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getIndustryBadgeVariant(industry: string) {
  switch (industry) {
    case 'CONSTRUCTION': return 'warning'
    case 'AUTOMOTIVE': return 'default'
    case 'HOSPITALITY': return 'secondary'
    case 'RETAIL': return 'outline'
    default: return 'outline'
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'NOT_CALLED': return 'outline'
    case 'CALLED': return 'warning'
    case 'COMPLETED': return 'success'
    case 'INACTIVE': return 'destructive'
    default: return 'outline'
  }
}

// app/admin/workers/new/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewWorkerPage() {
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
      // TODO: Get company ID from auth context
      const companyId = 'temp-company-id' // Replace with actual company ID

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
        throw new Error('Failed to create worker')
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
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/workers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Worker</h1>
          <p className="text-muted-foreground">
            Add a worker to your check-in system
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Worker Information</CardTitle>
          <CardDescription>
            Enter the worker's details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+61 412 345 678"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jobSite">Job Site / Location</Label>
                <Input
                  id="jobSite"
                  placeholder="CBD Construction Site"
                  value={formData.jobSite}
                  onChange={(e) => setFormData({...formData, jobSite: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="Electrician, Parts Advisor, etc."
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industryType">Industry Type</Label>
              <Select 
                value={formData.industryType} 
                onValueChange={(value) => setFormData({...formData, industryType: value})}
              >
                <SelectTrigger>
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
              <Label htmlFor="supervisorEmail">Supervisor Email</Label>
              <Input
                id="supervisorEmail"
                type="email"
                placeholder="supervisor@company.com"
                value={formData.supervisorEmail}
                onChange={(e) => setFormData({...formData, supervisorEmail: e.target.value})}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={(value) => setFormData({...formData, timezone: value})}
                >
                  <SelectTrigger>
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
                <Label htmlFor="preferredCallTime">Preferred Call Time</Label>
                <Input
                  id="preferredCallTime"
                  type="time"
                  value={formData.preferredCallTime}
                  onChange={(e) => setFormData({...formData, preferredCallTime: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Worker'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/workers">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}