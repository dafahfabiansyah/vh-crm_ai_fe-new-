// Export API types
export * from './types/interface';

// Import Contact type for use in other interfaces
import type { Contact } from './services/contactsService';

// register type 
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  businessName?: string;
  phoneNumber?: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  businessName?: string;
  phoneNumber?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
}

export interface PasswordStrength {
  score: number;
  feedback: string[];
}
// register type end

// login type
export interface LoginFormData {
  email: string
  password: string
}

export interface FormErrors {
  email?: string
  password?: string
  general?: string
}
// login type end

// dashboard conversation types
export interface ChatSession {
  id: string
  customerName: string
  lastMessage: string
  timestamp: string
  status: "active" | "pending" | "resolved"
  agent: string
  isOnline: boolean
}

export interface Message {
  id: string
  content: string
  sender: "customer" | "agent" | "system"
  timestamp: string
  isSystem: boolean
}

// Chat logs types for dynamic chat conversation
export interface ChatLogMessage {
  id: string
  id_contact: string
  message: string
  type: string
  media: string
  from_me: boolean
  sent_at: string
}

export interface ChatInfo {
  customerName: string
  customerId: string
  agent: string
  status: string
  labels: string[]
  handledBy: string
  collaborators: string[]
  notes: string
  assignedBy: string
  resolvedBy: string
  aiHandoffAt: string
  assignedAt: string
  createdAt: string
  resolvedAt: string
  openUntil: string
}
// dashboard conversation types end

// chat information types
export interface ChatInformationProps {
  chatInfo: ChatInfo
}
// chat information types end

// chat history list types - moved to component file
// chat history list types end

// chat conversation types
export interface ChatConversationProps {
  selectedContactId: string | null
  selectedContact?: Contact | null
  onToggleMobileMenu?: () => void
  showBackButton?: boolean
  onToggleInfo?: () => void
  showInfo?: boolean
}
// chat conversation types end

//navigation sidebar types
export interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  badge?: string | number
  children?: NavigationItem[]
}
// navigation sidebar types end

// topbar types

export interface TopbarProps {
  user?: {
    name: string
    email: string
    plan: string
    avatar?: string
  }
}
// topbar types end

// main layout types

export interface MainLayoutProps {
  children: React.ReactNode
}

export interface MainLayoutProps {
  children: React.ReactNode
}
// main layout types end

// connected platforms types
export interface Platform {
  id: string;
  name: string;
  type: "whatsapp" | "instagram" | "facebook" | "email" | "website";
  phone?: string;
  description?: string;
  isActive: boolean;
  aiAgent: string;
  teams: string[];
  humanAgent: string;
  distributionMethod: string;
  csatEnabled: boolean;
}
// connected platforms types end

// billing types
export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: string;
  period: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ComponentType<{ className?: string }>;
  features: PricingFeature[];
  popular?: boolean;
}
// billing types end

// AI Agents types
export interface AgentRole {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  id_settings: string;
  created_at: string;
  updated_at: string;
}

export interface AgentsResponse {
  data: AIAgent[];
  meta: {
    limit: number;
    offset: number;
    count: number;
  };
}

export interface CreateAgentRequest {
  name: string;
  role_id: string;
  is_active?: boolean;
}

// AI Agents types end

// WhatsApp QR Code types
export interface WhatsAppQRCodeRequest {
  device_id: string;
}

export interface WhatsAppQRCodeData {
  qr_code: string;
  qr_code_image: string;
  session_id: string;
  device_id: string;
  expires_at: string;
  instructions: string;
}

export interface WhatsAppQRCodeResponse {
  success: boolean;
  message: string;
  data: WhatsAppQRCodeData;
}

export interface WhatsAppQRCodeProps {
  onDeviceConnected?: (deviceId: string) => void;
  onError?: (error: string) => void;
}
// WhatsApp QR Code types end