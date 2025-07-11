import { GetServerSideProps } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import SimpleAdminLayout from '@/components/ui/SimpleAdminLayout'
import { Users, Phone, BarChart3, Plus, History, Settings, Share, Upload, Search, ChevronRight, FileText, Calendar, Clock, ArrowRight } from 'lucide-react'

interface DashboardProps {
  stats: {
    totalWorkers: number
    callsToday: number
  }
}

export default function AdminDashboard({ stats }: DashboardProps) {
  return (
    <SimpleAdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back to your worker check-in system</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 h-9">
            <Share className="h-4 w-4 mr-2 text-gray-500" />
            Share
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white h-9">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Workers</p>
                <h3 className="text-2xl font-semibold mt-1">24</h3>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Projects</p>
                <h3 className="text-2xl font-semibold mt-1">3</h3>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Calls Today</p>
                <h3 className="text-2xl font-semibold mt-1">12</h3>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Project Cards */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Active Projects</h2>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 px-2 flex items-center">
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-orange-500 w-full"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Blackwood Project</h3>
                <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">Active</div>
              </div>
              <p className="text-sm text-gray-500 mb-4">Construction site with 8 workers assigned</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Due Jul 28</span>
                </div>
                <Link href="/admin/projects/1" className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
                  View details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-blue-500 w-full"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Eastside Construction</h3>
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">In Progress</div>
              </div>
              <p className="text-sm text-gray-500 mb-4">Renovation project with 12 workers assigned</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Due Aug 15</span>
                </div>
                <Link href="/admin/projects/2" className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
                  View details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
            <div className="h-2 bg-green-500 w-full"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Financial Analysis</h3>
                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Completed</div>
              </div>
              <p className="text-sm text-gray-500 mb-4">Q2 2025 projections and reporting</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  <span>Jul 10, 2025</span>
                </div>
                <Link href="/admin/projects/3" className="text-orange-500 hover:text-orange-600 font-medium flex items-center">
                  View details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 px-2 flex items-center">
            View all
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              <div className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mr-4">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">New call completed</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Call with <span className="font-medium">John Doe</span> completed successfully (4m 32s)
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-4">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">New worker added</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Anna Smith</span> was added to the Eastside Construction project
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-green-100 text-green-500 rounded-full flex items-center justify-center mr-4">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Report generated</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Financial analysis report for Q2 2025 has been completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/admin/workers" className="block p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-medium mb-1">Workers</h3>
                <p className="text-sm text-gray-500">Manage all workers</p>
              </div>
            </Link>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/admin/workers/new" className="block p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-medium mb-1">Add Worker</h3>
                <p className="text-sm text-gray-500">Create new worker</p>
              </div>
            </Link>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/admin/calls" className="block p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium mb-1">Call History</h3>
                <p className="text-sm text-gray-500">View recent calls</p>
              </div>
            </Link>
          </Card>
          
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Link href="/admin/reports" className="block p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-medium mb-1">Reports</h3>
                <p className="text-sm text-gray-500">View analytics</p>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </SimpleAdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // For now, return mock data to avoid database errors
    return {
      props: {
        stats: {
          totalWorkers: 24,
          callsToday: 12,
        }
      }
    }
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return {
      props: {
        stats: { totalWorkers: 0, callsToday: 0 }
      }
    }
  }
}