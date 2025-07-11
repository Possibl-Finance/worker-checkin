// src/pages/admin/calls/[id].tsx
import { GetServerSideProps } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Phone, User, Calendar, Clock, FileText, Mail } from "lucide-react"
import Link from "next/link"
import DarkAdminLayout from '@/components/ui/DarkAdminLayout'
import { db } from '../../../../lib/db'
import { format } from 'date-fns'
import { useState } from 'react'
import { sendEmail, generateCallSummaryEmail } from '../../../../lib/email'

interface CallDetailsProps {
  call: any
  worker: any
}

export default function CallDetailsPage({ call, worker }: CallDetailsProps) {
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleSendEmail = async () => {
    if (!worker.supervisorEmail) {
      alert('No supervisor email available')
      return
    }

    setIsSendingEmail(true)
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId: call.id,
          supervisorEmail: worker.supervisorEmail
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.status} ${response.statusText}`)
      }

      setEmailSent(true)
      alert('Email sent successfully!')
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <DarkAdminLayout>
      <div className="mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Call Details</h1>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-500">{call.workerName}</span>
        </div>
        <div className="flex items-center mt-2">
          <Link href="/admin/calls" className="text-orange-500 hover:text-orange-600 flex items-center text-sm font-medium">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Calls
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Call Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Call Information</h2>
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${call.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : call.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : call.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                {call.status.replace('_', ' ')}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Start Time</span>
                </div>
                <span className="text-sm font-medium">{format(new Date(call.startTime), 'PPp')}</span>
              </div>
              
              {call.endTime && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">End Time</span>
                  </div>
                  <span className="text-sm font-medium">{format(new Date(call.endTime), 'PPp')}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Duration</span>
                </div>
                <span className="text-sm font-medium">{formatDuration(call.duration)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Phone Number</span>
                </div>
                <span className="text-sm font-medium">{call.phoneNumber}</span>
              </div>
              
              {call.recordingUrl && (
                <div className="mt-4">
                  <a 
                    href={call.recordingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-orange-500 bg-white border border-orange-200 rounded-md hover:bg-orange-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Listen to Recording
                  </a>
                </div>
              )}
              
              {worker.supervisorEmail && (
                <div className="mt-2">
                  <Button 
                    className={`w-full ${emailSent ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'} text-white`}
                    onClick={handleSendEmail}
                    disabled={isSendingEmail || emailSent}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {emailSent ? 'Email Sent' : isSendingEmail ? 'Sending...' : 'Send Summary to Supervisor'}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Worker Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Worker Information</h2>
              <div className={`px-2 py-1 text-xs font-medium rounded-full ${worker.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : worker.status === 'CALLED' ? 'bg-amber-100 text-amber-800' : worker.status === 'INACTIVE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                {worker.status.replace('_', ' ')}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Name</span>
                </div>
                <span className="text-sm font-medium">{worker.name}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Phone</span>
                </div>
                <span className="text-sm font-medium">{worker.phoneNumber}</span>
              </div>
                
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Supervisor Email</span>
                </div>
                <span className="text-sm font-medium">{worker.supervisorEmail || 'N/A'}</span>
              </div>
              
              <div className="mt-4">
                <Link 
                  href={`/admin/workers/${worker.id}`}
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-orange-500 bg-white border border-orange-200 rounded-md hover:bg-orange-50"
                >
                  View Worker Profile
                </Link>
              </div>
            </div>

          {/* Call Content */}
          <div className="md:col-span-3 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-medium">Call Content</h2>
            </div>
            <div className="p-6">
              <Tabs defaultValue="summary">
                <TabsList className="inline-flex p-1 bg-gray-100 rounded-md mb-6">
                  <TabsTrigger 
                    value="summary" 
                    className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
                  >
                    Summary
                  </TabsTrigger>
                  <TabsTrigger 
                    value="transcript" 
                    className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
                  >
                    Transcript
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary">
                  {call.summary ? (
                    <div>
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-6 mb-6">
                        <h3 className="text-lg font-medium mb-4">Call Summary</h3>
                        <p className="text-gray-700">{call.summary}</p>
                      </div>
                      
                      {call.keyTopics && call.keyTopics.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-md font-medium mb-3">Key Topics</h4>
                          <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            {call.keyTopics.map((topic: string, index: number) => (
                              <li key={index}>{topic}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {call.actionItems && call.actionItems.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium mb-3">Action Items</h4>
                          <ul className="list-disc pl-5 space-y-2 text-gray-700">
                            {call.actionItems.map((item: string, index: number) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No summary available for this call</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="transcript">
                  {call.transcript ? (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Call Transcript</h3>
                      <div className="bg-gray-50 border border-gray-200 p-6 rounded-md overflow-auto whitespace-pre-wrap text-sm text-gray-700">
                        {call.transcript}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No transcript available for this call</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </DarkAdminLayout>
  )
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

function getCallStatusClass(status: string) {
  switch (status) {
    case 'INITIATED': return 'bg-gray-100 text-gray-800'
    case 'IN_PROGRESS': return 'bg-amber-100 text-amber-800'
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'FAILED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { id } = context.params || {}
    
    if (!id || typeof id !== 'string') {
      return {
        notFound: true
      }
    }

    const call = await db.call.findUnique({
      where: { id }
    })

    if (!call) {
      return {
        notFound: true
      }
    }

    const worker = await db.worker.findUnique({
      where: { id: call.workerId }
    })

    if (!worker) {
      return {
        notFound: true
      }
    }

    return {
      props: {
        call: JSON.parse(JSON.stringify(call)), // Serialize dates
        worker: JSON.parse(JSON.stringify(worker))
      }
    }
  } catch (error) {
    console.error('Failed to fetch call details:', error)
    return {
      notFound: true
    }
  }
}
