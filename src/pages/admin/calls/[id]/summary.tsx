import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { useRouter } from 'next/router';
import SimpleAdminLayout from '@/components/ui/SimpleAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Download, Phone } from 'lucide-react';
import Link from 'next/link';
import { db } from '../../../../../lib/db';
import { format } from 'date-fns';

interface CallSummaryProps {
  call: any;
}

export default function CallSummary({ call }: CallSummaryProps) {
  const router = useRouter();
  const [emailRecipient, setEmailRecipient] = useState(call.worker?.supervisorEmail || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Format duration in minutes and seconds
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Function to send email summary
  const sendEmailSummary = async () => {
    if (!emailRecipient) {
      setEmailStatus({ type: 'error', message: 'Please enter an email address' });
      return;
    }
    
    try {
      setSendingEmail(true);
      setEmailStatus(null);
      
      const response = await fetch('/api/calls/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: call.id, recipientEmail: emailRecipient })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }
      
      setEmailStatus({ type: 'success', message: 'Summary email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailStatus({ type: 'error', message: String(error) });
    } finally {
      setSendingEmail(false);
    }
  };

  // Function to get status badge variant
  const getCallStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'INITIATED': return 'secondary';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <SimpleAdminLayout>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/admin/calls" className="text-gray-500 hover:text-gray-700 mr-2">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-2xl font-semibold">Call Summary</h1>
        </div>
        <div className="text-gray-500">
          {call.workerName} - {format(new Date(call.startTime), 'PPP p')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Call Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <Badge variant={getCallStatusBadgeVariant(call.status)}>{call.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span>{formatDuration(call.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span>{format(new Date(call.startTime), 'PPP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span>{format(new Date(call.startTime), 'p')}</span>
              </div>
              {call.endTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">End Time</span>
                  <span>{format(new Date(call.endTime), 'p')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Worker Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span>{call.workerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span>{call.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Job Site</span>
                <span>{call.jobSite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Industry</span>
                <span>{call.industryType}</span>
              </div>
              {call.worker?.role && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Role</span>
                  <span>{call.worker.role}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Email Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Recipient Email</label>
                <Input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="Email address"
                  className="w-full"
                />
              </div>
              <Button 
                onClick={sendEmailSummary}
                disabled={sendingEmail || !emailRecipient}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                {sendingEmail ? 'Sending...' : 'Send Summary Email'}
              </Button>
              {emailStatus && (
                <div className={`text-sm ${emailStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {emailStatus.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Call Summary</CardTitle>
            <CardDescription>
              Summary generated from the call transcript
            </CardDescription>
          </CardHeader>
          <CardContent>
            {call.summary ? (
              <div className="prose max-w-none">
                <p>{call.summary}</p>
              </div>
            ) : (
              <div className="text-gray-500 italic">
                No summary available for this call.
              </div>
            )}
          </CardContent>
        </Card>

        {call.keyTopics && call.keyTopics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Key Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {call.keyTopics.map((topic: string, index: number) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {call.actionItems && call.actionItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {call.actionItems.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {call.transcript && (
          <Card>
            <CardHeader>
              <CardTitle>Transcript</CardTitle>
              <CardDescription>
                Full transcript of the call conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none whitespace-pre-wrap">
                {call.transcript}
              </div>
            </CardContent>
          </Card>
        )}

        {call.recordingUrl && (
          <Card>
            <CardHeader>
              <CardTitle>Recording</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <audio controls className="w-full">
                  <source src={call.recordingUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
                <Button variant="outline" className="flex items-center" asChild>
                  <a href={call.recordingUrl} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download Recording
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SimpleAdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const callId = context.params?.id as string;
    
    const call = await db.call.findUnique({
      where: { id: callId },
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
      }
    });

    if (!call) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        call: JSON.parse(JSON.stringify(call)) // Serialize dates
      }
    };
  } catch (error) {
    console.error('Failed to fetch call:', error);
    return {
      notFound: true
    };
  }
};
