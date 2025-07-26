import type { CategoryAttribute } from "@/services/productService";

// API Request types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  business_name: string;
  phone_number: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  turnstile_token?: string;
}

// API Response types
export interface User {
  id: string;
  email: string;
  name: string;
  business_name: string;
  phone_number?: string;
  type?: String;
  status?: Boolean; 
  created_at?: string;
  updated_at?: string;
}

export interface RegisterResponse extends User {
  phone_number: string;
  created_at: string;
  token: string; // Make token required
}

export interface LoginResponse extends User {
  token: string;
}

// Backend API wrapper responses
export interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth state types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // Add this to track if auth state has been initialized
}

// decode JWT token response
export interface DecodeTokenResponse {
  user_id: string;
  tenant_id: string;
  email: string;
  database: string;
  is_human_agent: boolean;
  agent_id: string;
  agent_department: string;
  exp ?: number; // Optional expiration time
  iat ?: number; // Optional issued at time
}

// Platform mapping interface
export interface PlatformMapping {
  id: string;
  id_agent: string;
  id_platform: string;
  agent_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  agent_name: string;
}

// WhatsApp Platform interface based on API response
export interface PlatformInbox {
  id: string;
  name: string;
  type: "whatsapp";
  phone: string;
  description?: string;
  isActive: boolean;
  deviceId: string;
  deviceName: string;
  status: string;
  sessionId: string;
  timestamp: string;
  isConnected: boolean;
  isLoggedIn: boolean;
  // Additional fields for platform configuration
  aiAgent?: string;
  teams?: string[];
  pipeline?: string;
  humanAgent?: string;
  distributionMethod?: string;
  csatEnabled?: boolean;
  // Raw platform mappings data from API
  platformMappings?: PlatformMapping[];
  // Multi-select human agents
  humanAgentsSelected?: string[];
  // All human agent mappings (active and inactive) for tracking
  allHumanAgentMappings?: { id: string; id_agent: string; is_active: boolean }[];
}

// lead card interface
export interface TimelineEvent {
  id: string
  type: 'created' | 'contacted' | 'moved' | 'note' | 'call' | 'email'
  title: string
  description: string
  timestamp: string
  user: string
}

export interface Lead {
  moved_by: string;
  id: string
  name: string
  phone: string
  value: number
  source: string
  daysAgo: number
  status: 'active' | 'new' | 'contacted'
  email?: string
  company?: string
  location?: string
  notes?: string
  createdAt: string
  lastActivity: string
  timeline: TimelineEvent[]
}

export interface Lead {
  id: string
  name: string
  phone: string
  value: number
  source: string
  daysAgo: number
  status: 'active' | 'new' | 'contacted'
  email?: string
  company?: string
  location?: string
  notes?: string
  createdAt: string
  lastActivity: string
  timeline: TimelineEvent[]
}

export interface PipelineStage {
  id: string
  name: string
  count: number
  value: number
  leads: Lead[]
  color: string
  description?: string
  stage_order?: number
  id_agent?: string
  agent_id?: string // AI agent id yang handle stage (optional)
}

// AI Agent interface
export interface AIAgentData {
  // Basic agent info
  id: string;
  name: string;
  description: string;
  id_settings: string;
  created_at: string;
  updated_at: string;
  // Settings data
  behaviour: string;
  welcomeMessage: string;
  transferConditions: string;
  model: string;
  aiHistoryLimit: number;
  aiContextLimit: number;
  messageAwait: number;
  aiMessageLimit: number;
  // RajaOngkir settings
  rajaongkir_enabled?: boolean;
  rajaongkir_origin_district?: string;
  rajaongkir_couriers?: string;
  // UI state
  isActive: boolean;
  stopAIAfterHandoff: boolean;
  timezone: string;
  selectedLabels: string[];
}

export interface AIAgentDetailPageProps {
  agentId?: string;
}

// product page interface
export interface Product {
  id: string;
  sku: string;
  code: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  stock: number;
  image_url: string;
  colors: string[];
  material: string;
  image: string;
  category_name: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  code: string;
  name: string;
  description: string;
  price: string;
  weight: string;
  stock: string;
  colors: string;
  material: string;
  image: string;
  category: string;
}

export interface CategoryFormData {
  name: string;
  description: string;
  attributes: CategoryAttribute[];
}

export interface LeadTransferHistoryItem {
  id: string;
  lead_id: string;
  lead_name: string;
  from_stage_id: string;
  from_stage_name: string;
  to_stage_id: string;
  to_stage_name: string;
  from_pipeline_id: string;
  from_pipeline_name: string;
  to_pipeline_id: string;
  to_pipeline_name: string;
  from_agent_id: string;
  from_agent_name: string;
  to_agent_id: string;
  to_agent_name: string;
  moved_by: string;
  moved_by_agent_id: string;
  created_at: string;
}

export interface LeadTransferHistoryResponse {
  page: number;
  per_page: number;
  page_count: number;
  total_count: number;
  items: LeadTransferHistoryItem[];
}