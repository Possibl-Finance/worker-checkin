// src/pages/admin/settings/index.tsx
import { GetServerSideProps } from 'next'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Save, Mail, Phone, Building } from "lucide-react"
import AdminLayout from '@/components/ui/AdminLayout'
import { db } from '../../../../lib/db'

interface SettingsPageProps {
  company: any
}

export default function SettingsPage({ company }: SettingsPageProps) {
  const [companySettings, setCompanySettings] = useState(company)
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCompanySettings((prev: any) => ({
      ...prev,
      [name]: value
    }))
    setSaveSuccess(false)
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setCompanySettings((prev: any) => ({
      ...prev,
      [name]: checked
    }))
    setSaveSuccess(false)
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setSaveSuccess(false)

    try {
      const response = await fetch(`/api/company/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companySettings),
      })

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.status} ${response.statusText}`)
      }

      setSaveSuccess(true)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          Settings saved successfully!
        </div>
      )}

        <Tabs defaultValue="company" className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <TabsList className="inline-flex p-1 bg-gray-100 rounded-md">
              <TabsTrigger 
                value="company" 
                className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
              >
                Company
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
              >
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="vapi" 
                className="data-[state=active]:bg-white data-[state=active]:text-orange-500 data-[state=active]:shadow-sm"
              >
                VAPI Integration
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="company">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your company details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={companySettings.name || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">Company Slug</Label>
                    <Input 
                      id="slug" 
                      name="slug" 
                      value={companySettings.slug || ''} 
                      onChange={handleInputChange} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for your company URL: example.com/{companySettings.slug}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      name="website" 
                      value={companySettings.website || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Update your company contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input 
                      id="contactEmail" 
                      name="contactEmail" 
                      type="email"
                      value={companySettings.contactEmail || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input 
                      id="contactPhone" 
                      name="contactPhone" 
                      value={companySettings.contactPhone || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={companySettings.address || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Configure email notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable email notifications for call summaries
                      </p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={companySettings.emailNotificationsEnabled || false}
                      onCheckedChange={(checked) => handleSwitchChange('emailNotificationsEnabled', checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultSupervisorEmail">Default Supervisor Email</Label>
                    <Input 
                      id="defaultSupervisorEmail" 
                      name="defaultSupervisorEmail" 
                      type="email"
                      value={companySettings.defaultSupervisorEmail || ''} 
                      onChange={handleInputChange} 
                    />
                    <p className="text-xs text-muted-foreground">
                      Used when a worker doesn't have a specific supervisor email
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Gmail SMTP Settings</CardTitle>
                  <CardDescription>
                    Configure Gmail SMTP for sending emails
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gmailUser">Gmail User</Label>
                    <Input 
                      id="gmailUser" 
                      name="gmailUser" 
                      type="email"
                      value={companySettings.gmailUser || ''} 
                      onChange={handleInputChange} 
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gmailAppPassword">Gmail App Password</Label>
                    <Input 
                      id="gmailAppPassword" 
                      name="gmailAppPassword" 
                      type="password"
                      value={companySettings.gmailAppPassword || ''} 
                      onChange={handleInputChange} 
                      placeholder="••••••••••••••••"
                    />
                    <p className="text-xs text-muted-foreground">
                      <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        How to generate an app password
                      </a>
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Test Email Connection
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="vapi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>VAPI Configuration</CardTitle>
                  <CardDescription>
                    Configure your VAPI integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vapiApiKey">VAPI API Key</Label>
                    <Input 
                      id="vapiApiKey" 
                      name="vapiApiKey" 
                      type="password"
                      value={companySettings.vapiApiKey || ''} 
                      onChange={handleInputChange} 
                      placeholder="••••••••••••••••"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vapiPhoneNumberId">VAPI Phone Number ID</Label>
                    <Input 
                      id="vapiPhoneNumberId" 
                      name="vapiPhoneNumberId" 
                      value={companySettings.vapiPhoneNumberId || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Assistant Configuration</CardTitle>
                  <CardDescription>
                    Configure industry-specific VAPI assistants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vapiConstructionAssistantId">Construction Assistant ID</Label>
                    <Input 
                      id="vapiConstructionAssistantId" 
                      name="vapiConstructionAssistantId" 
                      value={companySettings.vapiConstructionAssistantId || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vapiAutomotiveAssistantId">Automotive Assistant ID</Label>
                    <Input 
                      id="vapiAutomotiveAssistantId" 
                      name="vapiAutomotiveAssistantId" 
                      value={companySettings.vapiAutomotiveAssistantId || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="vapiHospitalityAssistantId">Hospitality Assistant ID</Label>
                    <Input 
                      id="vapiHospitalityAssistantId" 
                      name="vapiHospitalityAssistantId" 
                      value={companySettings.vapiHospitalityAssistantId || ''} 
                      onChange={handleInputChange} 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Test VAPI Connection
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Get the first company (assuming single-tenant for now)
    const company = await db.company.findFirst()

    if (!company) {
      return {
        redirect: {
          destination: '/admin/setup',
          permanent: false,
        },
      }
    }

    // Get environment variables for VAPI and Gmail settings
    const vapiApiKey = process.env.VAPI_API_KEY || ''
    const vapiPhoneNumberId = process.env.VAPI_PHONE_NUMBER_ID || ''
    const vapiConstructionAssistantId = process.env.VAPI_CONSTRUCTION_ASSISTANT_ID || ''
    const vapiAutomotiveAssistantId = process.env.VAPI_AUTOMOTIVE_ASSISTANT_ID || ''
    const vapiHospitalityAssistantId = process.env.VAPI_HOSPITALITY_ASSISTANT_ID || ''
    const gmailUser = process.env.GMAIL_USER || ''
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD ? '••••••••••••••••' : ''

    // Merge company data with environment variables
    const companyWithEnvVars = {
      ...JSON.parse(JSON.stringify(company)), // Serialize dates
      vapiApiKey,
      vapiPhoneNumberId,
      vapiConstructionAssistantId,
      vapiAutomotiveAssistantId,
      vapiHospitalityAssistantId,
      gmailUser,
      gmailAppPassword,
      emailNotificationsEnabled: true, // Default to true if not set
    }

    return {
      props: {
        company: companyWithEnvVars
      }
    }
  } catch (error) {
    console.error('Failed to fetch company settings:', error)
    return {
      props: {
        company: {}
      }
    }
  }
}
