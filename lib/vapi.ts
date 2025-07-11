/**
 * VAPI API client for making outbound calls
 */

// Get environment variables
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID;
const VAPI_CONSTRUCTION_ASSISTANT_ID = process.env.VAPI_CONSTRUCTION_ASSISTANT_ID;
const VAPI_AUTOMOTIVE_ASSISTANT_ID = process.env.VAPI_AUTOMOTIVE_ASSISTANT_ID;
const VAPI_HOSPITALITY_ASSISTANT_ID = process.env.VAPI_HOSPITALITY_ASSISTANT_ID;

// Base URL for VAPI API
const VAPI_API_URL = 'https://api.vapi.ai';

/**
 * Get the assistant ID based on industry type
 */
export function getAssistantIdForIndustry(industryType: string): string {
  console.log(`Getting assistant ID for industry: ${industryType}`);
  console.log(`Available assistant IDs:`, {
    CONSTRUCTION: VAPI_CONSTRUCTION_ASSISTANT_ID ? '***' : 'undefined',
    AUTOMOTIVE: VAPI_AUTOMOTIVE_ASSISTANT_ID ? '***' : 'undefined',
    HOSPITALITY: VAPI_HOSPITALITY_ASSISTANT_ID ? '***' : 'undefined'
  });
  
  let assistantId = '';
  
  switch (industryType) {
    case 'CONSTRUCTION':
      assistantId = VAPI_CONSTRUCTION_ASSISTANT_ID || '';
      break;
    case 'AUTOMOTIVE':
      assistantId = VAPI_AUTOMOTIVE_ASSISTANT_ID || '';
      break;
    case 'HOSPITALITY':
      assistantId = VAPI_HOSPITALITY_ASSISTANT_ID || '';
      break;
    default:
      assistantId = VAPI_CONSTRUCTION_ASSISTANT_ID || ''; // Default to construction
      break;
  }
  
  console.log(`Selected assistant ID for ${industryType}: ${assistantId ? '***' : 'undefined'}`);
  return assistantId;
}

/**
 * Make an outbound call using VAPI
 */
export async function makeOutboundCall(params: {
  phoneNumber: string;
  workerId: string;
  workerName: string;
  industryType: string;
  jobSite: string;
  callId: string;
  workerRole?: string;
  supervisorEmail?: string;
}) {
  console.log('VAPI makeOutboundCall called with params:', {
    phoneNumber: params.phoneNumber,
    workerId: params.workerId,
    workerName: params.workerName,
    industryType: params.industryType,
    jobSite: params.jobSite,
    callId: params.callId
  });

  // Validate environment variables
  if (!VAPI_API_KEY) {
    console.error('VAPI_API_KEY is missing');
    throw new Error('VAPI API key is missing');
  }

  if (!VAPI_PHONE_NUMBER_ID) {
    console.error('VAPI_PHONE_NUMBER_ID is missing');
    throw new Error('VAPI phone number ID is missing');
  }

  // Get assistant ID for the industry
  const assistantId = getAssistantIdForIndustry(params.industryType);
  
  if (!assistantId) {
    console.error(`No assistant ID configured for industry: ${params.industryType}`);
    throw new Error(`No assistant ID configured for industry: ${params.industryType}`);
  }

  // Validate app URL
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    console.error('NEXT_PUBLIC_APP_URL environment variable is not set');
    throw new Error('App URL is not configured. Set NEXT_PUBLIC_APP_URL environment variable.');
  }

  // Prepare the webhook URL with the call ID for callbacks
  // Get the app URL from environment variables
  let appUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  // If using localhost, make sure we're using the correct port
  if (appUrl.includes('localhost:3000')) {
    appUrl = appUrl.replace('localhost:3000', 'localhost:3004');
    console.log(`Adjusted app URL to use actual server port: ${appUrl}`);
  }
  
  // Log the app URL being used for webhooks
  console.log(`Using app URL for webhooks: ${appUrl}`);
  
  // If using ngrok, make sure we're using the correct URL format
  if (appUrl.includes('ngrok-free.app')) {
    console.log('Using ngrok URL for webhooks');
  }
  
  const webhookUrl = `${appUrl}/api/vapi-webhook?callId=${params.callId}`;

  console.log('Making outbound call with VAPI:', {
    phoneNumber: params.phoneNumber,
    assistantId: assistantId ? '***' : undefined,
    phoneNumberId: VAPI_PHONE_NUMBER_ID ? '***' : undefined,
    webhookUrl,
    apiKey: VAPI_API_KEY ? '***' : undefined
  });

  // Format phone number to ensure it's in E.164 format
  let formattedPhoneNumber = params.phoneNumber;
  if (!formattedPhoneNumber.startsWith('+')) {
    // If it doesn't start with +, assume it's a US number
    formattedPhoneNumber = `+1${formattedPhoneNumber.replace(/\D/g, '')}`;
    console.log(`Formatted phone number to E.164 format: ${formattedPhoneNumber}`);
  }

  // Prepare the request payload using the correct format from the VAPI documentation
  const payload: any = {
    assistantId: assistantId,
    phoneNumberId: VAPI_PHONE_NUMBER_ID,
    customer: {
      number: formattedPhoneNumber,
      name: params.workerName
    },
    assistantOverrides: {
      variableValues: {
        workerName: params.workerName,
        jobSite: params.jobSite,
        workerRole: params.workerRole || '',
        supervisorEmail: params.supervisorEmail || '',
        industryType: params.industryType || ''
      }
    }
  };
  
  // Add webhook URL to the metadata field only (not as a top-level property)
  if (webhookUrl) {
    payload.metadata = {
      callId: params.callId,
      webhookUrl: webhookUrl
    };
  }

  console.log('VAPI request payload:', {
    ...payload,
    assistantId: '***',
    phoneNumberId: '***'
  });

  try {
    // Make the API call
    const response = await fetch(`${VAPI_API_URL}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VAPI_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    // Get response as text first
    const responseText = await response.text();
    console.log('VAPI raw response:', responseText);
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse VAPI response as JSON:', responseText);
      throw new Error(`Invalid JSON response from VAPI: ${responseText}`);
    }

    console.log('VAPI API response parsed:', responseData);

    // Handle error responses
    if (!response.ok) {
      console.error('VAPI API error details:', {
        status: response.status,
        statusText: response.statusText,
        responseData,
        requestPayload: {
          ...payload,
          assistantId: '***',
          phoneNumberId: '***'
        }
      });
      throw new Error(`VAPI API error: ${response.status} ${response.statusText} - ${responseData.error || JSON.stringify(responseData)}`);
    }

    // Return successful response
    return responseData;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error making outbound call:', errorMessage);
    throw error;
  }
}
