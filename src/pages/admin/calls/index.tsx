// src/pages/admin/calls/index.tsx
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Phone, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import SimpleAdminLayout from '@/components/ui/SimpleAdminLayout'
import { db } from '../../../../lib/db'
import { format } from 'date-fns'

interface CallsPageProps {
  calls: any[]
}

export default function CallsPage({ calls: initialCalls }: CallsPageProps) {
  const [calls, setCalls] = useState(initialCalls)
  const [searchTerm, setSearchTerm] = useState('')
  const [emailRecipient, setEmailRecipient] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  
  // Filter calls based on search term
  const filteredCalls = calls.filter(call => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      call.workerName?.toLowerCase().includes(searchLower) ||
      call.phoneNumber?.toLowerCase().includes(searchLower) ||
      call.jobSite?.toLowerCase().includes(searchLower) ||
      call.status?.toLowerCase().includes(searchLower)
    )
  })

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Function to send email summary
  const sendEmailSummary = async (callId: string) => {
    if (!emailRecipient) {
      setEmailStatus({ type: 'error', message: 'Please enter an email address' })
      return
    }
    
    try {
      setSendingEmail(true)
      setEmailStatus(null)
      
      const response = await fetch('/api/calls/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, recipientEmail: emailRecipient })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email')
      }
      
      setEmailStatus({ type: 'success', message: 'Summary email sent successfully' })
    } catch (error) {
      console.error('Error sending email:', error)
      setEmailStatus({ type: 'error', message: String(error) })
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <SimpleAdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold">Calls</h1>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search calls..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Calls List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
          <CardDescription>View and manage all worker check-in calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Worker</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Job Site</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Duration</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCalls.length > 0 ? (
                  filteredCalls.map((call) => (
                    <tr key={call.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{call.workerName}</div>
                        <div className="text-sm text-gray-500">{call.phoneNumber}</div>
                      </td>
                      <td className="py-3 px-4">{call.jobSite}</td>
                      <td className="py-3 px-4">
                        <div>{format(new Date(call.startTime), 'MMM d, yyyy')}</div>
                        <div className="text-sm text-gray-500">{format(new Date(call.startTime), 'h:mm a')}</div>
                      </td>
                      <td className="py-3 px-4">{formatDuration(call.duration)}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getCallStatusBadgeVariant(call.status)}>{call.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/admin/calls/${call.id}/summary`}>
                          <Button variant="outline" size="sm">
                            View Summary
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      {searchTerm ? 'No calls matching your search' : 'No calls found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Recipient</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Name</label>
              <Input 
                placeholder="Name" 
                className="w-full bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Phone</label>
              <Input 
                placeholder="Phone" 
                className="w-full bg-gray-50 border-gray-200"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm text-gray-500">Status</label>
                <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600 p-0 h-auto font-medium">
                  Pause
                </Button>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-green-600">Running</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <div>Created: 12-07-2025, 14:44</div>
                  <div>Fired: 5 times</div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-600 p-0 h-auto font-medium">
              Add new recipient
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Choose starting date, time & repeat options</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Input 
                type="date" 
                className="w-full bg-gray-50 border-gray-200"
                defaultValue="2025-07-09"
              />
            </div>
            <div>
              <Input 
                type="time" 
                className="w-full bg-gray-50 border-gray-200"
                defaultValue="09:00"
              />
            </div>
            <div>
              <select className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200">
                <option>Doesn't repeat</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Choose persona</h2>
          <select className="w-full h-10 px-3 rounded-md bg-gray-50 border border-gray-200">
            <option>Steve (upbeat young professional with Aussie accent)</option>
            <option>Sarah (friendly and professional)</option>
            <option>Michael (calm and authoritative)</option>
          </select>
          <div className="mt-3 flex items-center">
            <Button variant="outline" size="sm" className="rounded-full flex items-center justify-center w-8 h-8 p-0 mr-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor"/>
                <path d="M3 12C3 12 6 5 12 5C18 5 21 12 21 12C21 12 18 19 12 19C6 19 3 12 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
            <span className="text-sm text-orange-500 font-medium">Preview</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">What do you want Juno AI to ask? Use our default questions or edit as needed:</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>What was completed?</li>
              <li>What wasn't completed that should have been completed?</li>
              <li>What is still left to do?</li>
              <li>How much more time will you need to complete your task?</li>
              <li>Any blockers or concerns you're seeing?</li>
              <li>Any help you need or anything that needs to be clarified?</li>
              <li>Any other comments - add them here</li>
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-medium mb-4">Email summary to:</h2>
          <div className="flex space-x-3">
            <Input 
              type="email" 
              placeholder="Your email here" 
              className="w-full bg-gray-50 border-gray-200"
              value={emailRecipient}
              onChange={(e) => setEmailRecipient(e.target.value)}
            />
            <Button 
              onClick={() => {
                // Find the first completed call to send as a summary
                const completedCall = calls.find(call => call.status === 'COMPLETED')
                if (completedCall) {
                  sendEmailSummary(completedCall.id)
                } else {
                  setEmailStatus({ type: 'error', message: 'No completed calls found to summarize' })
                }
              }}
              disabled={sendingEmail || !emailRecipient}
              className="whitespace-nowrap"
            >
              {sendingEmail ? 'Sending...' : 'Send Summary'}
            </Button>
          </div>
          {emailStatus && (
            <div className={`mt-2 text-sm ${emailStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {emailStatus.message}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Save and run
          </Button>
          <Button variant="outline">
            Preview call
          </Button>
          <Button variant="outline">
            Run a test call
          </Button>
        </div>
      </div>
    </SimpleAdminLayout>
  )
}

function getCallStatusBadgeVariant(status: string) {
  switch (status) {
    case 'INITIATED': return 'secondary'
    case 'IN_PROGRESS': return 'warning'
    case 'COMPLETED': return 'success'
    case 'FAILED': return 'destructive'
    default: return 'outline'
  }
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const calls = await db.call.findMany({
      include: {
        worker: {
          select: { 
            id: true, 
            name: true, 
            phoneNumber: true,
            jobSite: true,
            role: true,
            supervisorEmail: true
          }
        }
      },
      orderBy: { startTime: 'desc' }
    })

    return {
      props: {
        calls: JSON.parse(JSON.stringify(calls)) // Serialize dates
      }
    }
  } catch (error) {
    console.error('Failed to fetch calls:', error)
    return {
      props: {
        calls: []
      }
    }
  }
}
