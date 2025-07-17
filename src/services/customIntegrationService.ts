import axios from './axios'

export interface CustomIntegrationField {
  field_name: string;
  field_type: 'text' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'enum';
  description: string;
  enum_values?: string;
  is_required: boolean;
}

export interface CustomIntegrationPayload {
  name: string;
  description: string;
  webhook_url: string;
  http_method: 'POST' | 'GET';
  max_tool_calls: number;
  api_key: string;
  trigger_condition: string;
  fields: CustomIntegrationField[];
}

export async function createCustomIntegration(
  payload: CustomIntegrationPayload
) {
  const baseGo = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseGo}/v1/custom-integrations`;
  return axios.post(url, payload);
} 