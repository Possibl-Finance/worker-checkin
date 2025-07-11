// src/pages/admin/workers/index.tsx
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Phone, Mail, Filter, ChevronDown, MoreHorizontal, User, Calendar, Share2, Download, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import SimpleAdminLayout from '@/components/ui/SimpleAdminLayout'
import { db } from '../../../../lib/db'

interface WorkersPageProps {
  workers: any[]
}

export default function WorkersPage({ workers: initialWorkers }: WorkersPageProps) {
  const [workers, setWorkers] = useState(initialWorkers)
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const handleStartCall = async (workerId: string) => {
    if (loading[workerId]) return

    setLoading(prev => ({ ...prev, [workerId]: true }))

    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API error response:', errorData)
        throw new Error(`Failed to start call: ${response.status} ${response.statusText}`)
      }

      // Update the worker status in the UI only if it wasn't already CALLED
      setWorkers(prev => 
        prev.map(worker => 
          worker.id === workerId 
            ? { 
                ...worker, 
                // Only update status if not already CALLED
                ...(worker.status !== 'CALLED' ? { status: 'CALLED' } : {}),
                // Always increment totalCalls if available
                ...(worker.totalCalls !== undefined ? { totalCalls: worker.totalCalls + 1 } : {})
              } 
            : worker
        )
      )

      // Check if there was a VAPI error
      if (data.vapiError) {
        console.error('VAPI error:', data.vapiError)
        alert(`Call record created but actual call failed: ${data.vapiError}`)
      } else {
        alert(`Call initiated successfully! Call ID: ${data.vapiCallId || data.call.id}`)
      }
    } catch (error: unknown) {
      console.error('Error starting call:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to start call: ${errorMessage}`)
    } finally {
      setLoading(prev => ({ ...prev, [workerId]: false }))
    }
  }

  const handleStartAllCalls = async () => {
    const notCalledWorkers = workers.filter(w => w.status === 'NOT_CALLED')
    
    if (notCalledWorkers.length === 0) {
      alert('No workers available to call')
      return
    }
    
    if (!confirm(`Start calls for ${notCalledWorkers.length} workers?`)) {
      return
    }
    
    for (const worker of notCalledWorkers) {
      await handleStartCall(worker.id)
    }
  }

  return (
    <SimpleAdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Workers</h1>
          <p className="text-gray-500 mt-1">Manage and contact your workforce</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-9 px-4">
            <Share2 className="h-4 w-4 mr-2 text-gray-500" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-9 px-4">
            <Download className="h-4 w-4 mr-2 text-gray-500" />
            Export
          </Button>
          <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white h-9 px-4">
            <Link href="/admin/workers/new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Worker
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search workers..." 
            className="w-full pl-10 pr-4 py-2 h-10 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-10 px-4">
          <Filter className="h-4 w-4 mr-2 text-gray-500" />
          Filter
          <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
        </Button>
        <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-10 px-4">
          <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
          Sort
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-8">
          <span className="text-sm">Status</span>
          <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
        </Button>
        
        <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-8">
          <span className="text-sm">Industry</span>
          <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
        </Button>
        
        <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-8">
          <span className="text-sm">Date</span>
          <Calendar className="h-4 w-4 ml-2 text-gray-500" />
        </Button>
        
        <div className="ml-auto">
          <Button onClick={handleStartAllCalls} className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 text-sm">
            <Phone className="h-4 w-4 mr-2" />
            Call All Workers
          </Button>
        </div>
      </div>

      {/* Workers List */}
      <Card className="border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr,auto] gap-4 p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
            <span className="text-sm font-medium text-gray-700">Select All</span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStartAllCalls}
              className="border-gray-200 hover:bg-gray-50 text-gray-700 h-8"
            >
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              Call Selected
            </Button>
          </div>
        </div>
        
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">All Workers</h2>
              <p className="text-sm text-gray-500">
                {workers.length} workers across all job sites
              </p>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {workers.map(worker => (
            <div key={worker.id} className="p-5 hover:bg-gray-50 transition-colors duration-150">
              <div className="grid grid-cols-[auto,1fr,auto] gap-4 items-center">
                <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/workers/${worker.id}`} className="text-base font-medium text-gray-900 hover:text-orange-600 transition-colors duration-150">
                      {worker.name}
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {worker.phoneNumber}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {worker.supervisorEmail}
                    </div>
                    {worker.company && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {worker.company.name}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`px-2.5 py-1 text-xs font-medium rounded-full ${getIndustryBadgeClass(worker.industryType)}`}>
                      {worker.industryType}
                    </div>
                    <div className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(worker.status)}`}>
                      {worker.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleStartCall(worker.id)}
                    disabled={loading[worker.id]}
                    className="text-gray-500 hover:text-gray-700 h-9 w-9 p-0 rounded-full"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-500 hover:text-gray-700 h-9 w-9 p-0 rounded-full"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    asChild 
                    className="text-gray-500 hover:text-gray-700 h-9 w-9 p-0 rounded-full"
                  >
                    <Link href={`/admin/workers/${worker.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {workers.length === 0 && (
            <div className="text-center py-16 border border-dashed border-gray-200 rounded-md bg-gray-50">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-6 text-lg">No workers found</p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white h-10 px-6" asChild>
                <Link href="/admin/workers/new" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add your first worker
                </Link>
              </Button>
            </div>
          )}
        </div>
      </Card>
    </SimpleAdminLayout>
  )
}

function getIndustryBadgeClass(industry: string) {
  switch (industry) {
    case 'CONSTRUCTION': return 'bg-amber-100 text-amber-800'
    case 'AUTOMOTIVE': return 'bg-blue-100 text-blue-800'
    case 'HOSPITALITY': return 'bg-purple-100 text-purple-800'
    case 'RETAIL': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'NOT_CALLED': return 'bg-gray-100 text-gray-800'
    case 'CALLED': return 'bg-amber-100 text-amber-800'
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'INACTIVE': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const workers = await db.worker.findMany({
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

    return {
      props: {
        workers: JSON.parse(JSON.stringify(workers)) // Serialize dates
      }
    }
  } catch (error) {
    console.error('Failed to fetch workers:', error)
    return {
      props: {
        workers: []
      }
    }
  }
}