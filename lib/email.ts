/**
 * Email utility for sending emails
 */
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email using Gmail
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Get Gmail credentials from environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailAppPassword) {
      console.error('Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
      return false;
    }
    
    // Create a transporter with Gmail configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: options.from || `Worker Check-in <${gmailUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Generate HTML for a call summary email
 */
export function generateCallSummaryEmail(callData: {
  workerName: string;
  phoneNumber: string;
  jobSite: string;
  workerRole: string;
  industryType: string;
  summary: string;
  transcript: string;
  recordingUrl: string;
  duration: number;
  endReason: string;
  startTime: Date;
  endTime: Date;
}): string {
  // Format duration in minutes and seconds
  const durationMinutes = Math.floor(callData.duration / 60);
  const durationSeconds = callData.duration % 60;
  const formattedDuration = `${durationMinutes}m ${durationSeconds}s`;
  
  // Format dates
  const startTime = new Date(callData.startTime).toLocaleString();
  const endTime = new Date(callData.endTime).toLocaleString();

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          background-color: #f5f5f5;
          padding: 20px;
          border-bottom: 2px solid #ddd;
        }
        .content {
          padding: 20px;
        }
        .worker-info {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-left: 4px solid #4CAF50;
        }
        .call-details {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-left: 4px solid #2196F3;
        }
        .summary {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-left: 4px solid #FF9800;
        }
        .transcript {
          margin-top: 30px;
          padding: 15px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          max-height: 300px;
          overflow-y: auto;
        }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #777;
        }
        h2 {
          color: #444;
        }
        .btn {
          display: inline-block;
          padding: 10px 15px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Worker Call Summary</h1>
      </div>
      
      <div class="content">
        <div class="worker-info">
          <h2>Worker Information</h2>
          <p><strong>Name:</strong> ${callData.workerName}</p>
          <p><strong>Phone:</strong> ${callData.phoneNumber}</p>
          <p><strong>Job Site:</strong> ${callData.jobSite}</p>
          <p><strong>Role:</strong> ${callData.workerRole}</p>
          <p><strong>Industry:</strong> ${callData.industryType}</p>
        </div>
        
        <div class="call-details">
          <h2>Call Details</h2>
          <p><strong>Start Time:</strong> ${startTime}</p>
          <p><strong>End Time:</strong> ${endTime}</p>
          <p><strong>Duration:</strong> ${formattedDuration}</p>
          <p><strong>End Reason:</strong> ${callData.endReason}</p>
          ${callData.recordingUrl ? `<p><a href="${callData.recordingUrl}" class="btn" target="_blank">Listen to Recording</a></p>` : ''}
        </div>
        
        <div class="summary">
          <h2>Call Summary</h2>
          <p>${callData.summary || 'No summary available.'}</p>
        </div>
        
        <div class="transcript">
          <h2>Call Transcript</h2>
          <pre>${callData.transcript || 'No transcript available.'}</pre>
        </div>
        
        <div class="footer">
          <p>This is an automated email sent by the Worker Check-in System.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
