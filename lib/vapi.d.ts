/**
 * Type declarations for VAPI API client
 */

export interface OutboundCallParams {
  phoneNumber: string;
  workerId: string;
  workerName: string;
  industryType: string;
  jobSite: string;
  callId: string;
}

export interface VapiResponse {
  call_id: string;
  [key: string]: any;
}

export function getAssistantIdForIndustry(industryType: string): string;
export function makeOutboundCall(params: OutboundCallParams): Promise<VapiResponse>;
