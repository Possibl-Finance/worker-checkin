import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { db } from '../../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { callId, recipientEmail } = req.body;

    if (!callId || !recipientEmail) {
      return res.status(400).json({ message: 'Call ID and recipient email are required' });
    }

    // Get call data with worker information
    const call = await db.call.findUnique({
      where: { id: callId },
      include: {
        worker: true,
        company: true
      }
    });

    if (!call) {
      return res.status(404).json({ message: 'Call not found' });
    }

    // Generate summary if it doesn't exist
    let summary = call.summary;
    if (!summary) {
      summary = generateCallSummary(call);
      
      // Update the call with the generated summary
      await db.call.update({
        where: { id: callId },
        data: { summary }
      });
    }

    // Get company email settings
    const { fromEmail, smtpHost, smtpPort, smtpUsername, smtpPassword } = call.company;
    
    if (!fromEmail || !smtpHost || !smtpPort || !smtpUsername || !smtpPassword) {
      return res.status(400).json({ message: 'Company email settings are not configured' });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUsername,
        pass: smtpPassword
      }
    });

    // Format date for email
    const callDate = new Date(call.startTime).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Create email content
    const emailContent = `
      <h2>Call Summary for ${call.workerName}</h2>
      <p><strong>Date:</strong> ${callDate}</p>
      <p><strong>Job Site:</strong> ${call.jobSite}</p>
      <p><strong>Role:</strong> ${call.worker.role}</p>
      <p><strong>Duration:</strong> ${formatDuration(call.duration)}</p>
      
      <h3>Summary</h3>
      <p>${summary}</p>
      
      ${call.keyTopics && call.keyTopics.length > 0 ? `
        <h3>Key Topics</h3>
        <ul>
          ${call.keyTopics.map(topic => `<li>${topic}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${call.actionItems && call.actionItems.length > 0 ? `
        <h3>Action Items</h3>
        <ul>
          ${call.actionItems.map(item => `<li>${item}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${call.recordingUrl ? `
        <p><a href="${call.recordingUrl}">Listen to Recording</a></p>
      ` : ''}
    `;

    // Send email
    await transporter.sendMail({
      from: fromEmail,
      to: recipientEmail,
      subject: `Call Summary: ${call.workerName} - ${call.jobSite}`,
      html: emailContent
    });

    return res.status(200).json({ message: 'Summary email sent successfully' });
  } catch (error) {
    console.error('Error sending summary email:', error);
    return res.status(500).json({ message: 'Failed to send summary email', error: String(error) });
  }
}

// Helper function to format duration
function formatDuration(seconds: number | null): string {
  if (!seconds) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

// Helper function to generate a summary if one doesn't exist
function generateCallSummary(call: any): string {
  if (call.transcript) {
    // Simple summary generation based on transcript
    // In a real application, this would use more sophisticated NLP
    const summary = `This call with ${call.workerName} from ${call.jobSite} covered their current work status.`;
    return summary;
  } else {
    return `Call with ${call.workerName} from ${call.jobSite}. No transcript available for detailed summary.`;
  }
}
