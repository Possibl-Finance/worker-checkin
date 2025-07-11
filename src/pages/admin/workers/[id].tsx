// src/pages/admin/workers/[id].tsx
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Phone, Mail, Building2, Calendar, Clock, ArrowLeft, FileText, Edit, Trash, MapPin, User, ChevronRight, Download, PlayCircle } from "lucide-react"
import Link from "next/link"
import DarkAdminLayout from '@/components/ui/DarkAdminLayout'
import { db } from '../../../../lib/db'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Helper functions for badge styling
const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    case 'CALLED':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
}

const getCallStatusClass = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 'FAILED':
      return 'bg-red-100 text-red-800 hover:bg-red-100'
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case 'SCHEDULED':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
}

const getIndustryBadgeClass = (industry: string) => {
  switch (industry) {
    case 'CONSTRUCTION':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
    case 'HEALTHCARE':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
    case 'HOSPITALITY':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
    case 'MANUFACTURING':
      return 'bg-green-100 text-green-800 hover:bg-green-100'
    case 'RETAIL':
      return 'bg-pink-100 text-pink-800 hover:bg-pink-100'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }
}

interface WorkerDetailsProps {
  worker: any
  calls: any[]
}

export default function WorkerDetailsPage({ worker, calls }: WorkerDetailsProps) {
  const [loading, setLoading] = useState(false)

  const handleStartCall = async () => {
    if (loading) return
    setLoading(true)

    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workerId: worker.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(`Failed to start call: ${response.status} ${response.statusText}`)
      }

      // Check if there was a VAPI error
      if (data.vapiError) {
        console.error('VAPI error:', data.vapiError)
        alert(`Call record created but actual call failed: ${data.vapiError}`)
      } else {
        alert(`Call initiated successfully! Call ID: ${data.vapiCallId || data.call.id}`)
        // Reload the page to show the new call
        window.location.reload()
      }
    } catch (error: unknown) {
      console.error('Error starting call:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to start call: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <DarkAdminLayout>
      {/* Breadcrumb navigation */}
      <div className="mb-8">
        <div className="flex items-center">
          <Link href="/admin/workers" className="text-orange-500 hover:text-orange-600 flex items-center text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Workers
          </Link>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mr-4">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{worker.name}</h1>
              <div className="flex items-center mt-1">
                <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(worker.status)}`}>
                  {worker.status.replace('_', ' ')}
                </div>
                <div className="mx-2 h-1 w-1 rounded-full bg-gray-300"></div>
                <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${getIndustryBadgeClass(worker.industryType || worker.industry || 'OTHER')}`}>
                  {worker.industryType || worker.industry || 'Other'}
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleStartCall} 
            disabled={loading} 
            className="bg-orange-500 hover:bg-orange-600 text-white h-10"
          >
            <Phone className="h-4 w-4 mr-2" />
            {loading ? 'Initiating Call...' : 'Start New Call'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Worker Info Card */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center py-3 border-b border-gray-100">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-sm font-medium mt-0.5">{worker.phoneNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center py-3 border-b border-gray-100">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-sm font-medium mt-0.5">{worker.email || worker.supervisorEmail || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center py-3 border-b border-gray-100">
                <Building2 className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Company</p>
                  <p className="text-sm font-medium mt-0.5">{worker.company?.name || worker.jobSite || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center py-3 border-b border-gray-100">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Job Site</p>
                  <p className="text-sm font-medium mt-0.5">{worker.jobSite || worker.company?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex items-center py-3">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Last Contact</p>
                  <p className="text-sm font-medium mt-0.5">{worker.lastCallDate ? format(new Date(worker.lastCallDate), 'PPp') : calls.length > 0 ? format(new Date(calls[0].startTime), 'PPp') : 'Never'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" asChild className="flex-1 border-gray-200 hover:bg-gray-50 py-2 h-auto">
                  <Link href={`/admin/workers/edit/${worker.id}`} className="flex items-center justify-center">
                    <Edit className="h-4 w-4 mr-2 text-gray-500" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-gray-200 hover:bg-gray-50 py-2 h-auto text-red-500 hover:text-red-600 hover:border-red-200">
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call History */}
        <Card className="md:col-span-2 bg-white shadow-sm border border-gray-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-medium">Call History</CardTitle>
              <CardDescription className="text-sm text-gray-500 mt-1">
                {calls.length} calls made to this worker
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-9">
              <Download className="h-4 w-4 mr-2 text-gray-500" />
              Export
            </Button>
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="mb-6">
              <div className="flex space-x-8 border-b">
                <button className="px-1 py-2 text-sm font-medium text-orange-500 border-b-2 border-orange-500">
                  All Calls
                </button>
                <button className="px-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Completed
                </button>
                <button className="px-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                  Failed
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {calls.length > 0 ? calls.map((call) => (
                <div key={call.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white">
                  <div className="flex">
                    <div className="mr-4 mt-1">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${call.status === 'COMPLETED' ? 'bg-green-100 text-green-500' : call.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-500' : call.status === 'FAILED' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                        <Phone className="h-5 w-5" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCallStatusClass(call.status)}`}>
                          {call.status}
                        </div>
                        <span className="text-sm font-medium ml-2">{format(new Date(call.startTime), 'PPp')}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Duration: {formatDuration(call.duration)}
                      </p>
                      {call.endReason && (
                        <p className="text-sm text-gray-500 mt-1">
                          End Reason: {call.endReason}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {call.recordingUrl && (
                      <Button variant="ghost" size="sm" asChild className="text-gray-500 hover:text-gray-700 h-8 px-2">
                        <a 
                          href={call.recordingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Play
                        </a>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild className="text-orange-500 hover:text-orange-600 h-8 px-2">
                      <Link href={`/admin/calls/${call.id}`} className="flex items-center">
                        View
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">No calls have been made to this worker yet</p>
                  <Button 
                    onClick={handleStartCall} 
                    disabled={loading} 
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 h-auto"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Make First Call
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Summary Card - Show only if there are completed calls with summaries */}
      {calls.some(call => call.status === 'COMPLETED' && call.summary) && (
        <Card className="bg-white shadow-sm border border-gray-200 mb-8">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                <FileText className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">Latest Call Summary</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1">
                  From {format(new Date(calls.find(call => call.status === 'COMPLETED' && call.summary)?.startTime || new Date()), 'PPp')}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600 h-8 px-2">
              View Full Transcript
            </Button>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p>{calls.find(call => call.status === 'COMPLETED' && call.summary)?.summary || 'No summary available'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </DarkAdminLayout>
  )
}

// These helper functions are already defined above
// Removed duplicate functions

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { id } = context.params || {}
    
    if (!id || typeof id !== 'string') {
      return {
        notFound: true
      }
    }

    const worker = await db.worker.findUnique({
      where: { id },
      include: {
        company: {
          select: { name: true, slug: true }
        }
      }
    })

    if (!worker) {
      return {
        notFound: true
      }
    }

    const calls = await db.call.findMany({
      where: { workerId: id },
      orderBy: { startTime: 'desc' }
    })

    return {
      props: {
        worker: JSON.parse(JSON.stringify(worker)), // Serialize dates
        calls: JSON.parse(JSON.stringify(calls))
      }
    }
  } catch (error) {
    console.error('Failed to fetch worker details:', error)
    return {
      notFound: true
    }
  }
}
