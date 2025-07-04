import type {
  AIAgent,
  ChatInfo,
  ChatSession,
  Message,
  NavigationItem,
  Platform,
  PricingPlan,
  WhatsAppPlatform,
} from "@/types";
import {
  Bot,
  CreditCard,
  Crown,
  GitBranch,
  LayoutDashboard,
  MessageSquare,
  Settings,
  SquarePlus,
  User,
  Users,
  Zap,
  Tickets,
  Instagram,
  Facebook,
  Mail,
  Globe,
  Twitter,
} from "lucide-react";

export const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "pipeline",
    label: "Pipeline",
    icon: GitBranch,
    children: [
      {
        id: "create-pipeline",
        label: "Create Pipeline",
        icon: SquarePlus,
        href: "/pipeline/create",
      },
    ],
  },
  {
    id: "ai-agents",
    label: "AI Agents",
    icon: Bot,
    href: "/ai-agents",
  },
  {
    id: "human-agent",
    label: "Human Agent",
    icon: User,
    href: "/human-agents",
  },
  {
    id: "platforms",
    label: "Platforms",
    icon: MessageSquare,
    href: "/connected-platforms",
  },
  {
    id: "contacts",
    label: "Contacts",
    icon: Users,
    href: "/contacts",
  },
  {
    id: "tickets",
    label: "Tickets",
    icon: Tickets,
    href: "/tickets",
  },
];

export const bottomNavigationItems: NavigationItem[] = [
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    href: "/billing",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export const mockChatSessions: ChatSession[] = [
  {
    id: "1",
    customerName: "Ibu Vina Tangerang",
    lastMessage: "This conversation reso...",
    timestamp: "Yesterday 17:24",
    status: "resolved",
    agent: "CS DISTCCTV ex. Aulia",
    isOnline: true,
  },
  {
    id: "2",
    customerName: "Alif",
    lastMessage: "AI Summary",
    timestamp: "Yesterday 16:10",
    status: "resolved",
    agent: "Sales Distcctv",
    isOnline: false,
  },
  {
    id: "3",
    customerName: "G",
    lastMessage: "This conversation reso...",
    timestamp: "Yesterday 12:31",
    status: "resolved",
    agent: "Sales Distcctv",
    isOnline: false,
  },
  {
    id: "4",
    customerName: "Aldi Arismawan",
    lastMessage: "This conversation reso...",
    timestamp: "Yesterday 12:09",
    status: "resolved",
    agent: "Sales Distcctv",
    isOnline: false,
  },
  {
    id: "5",
    customerName: "Yoga Arif Pambudi",
    lastMessage: "This conversation reso...",
    timestamp: "Yesterday 12:09",
    status: "resolved",
    agent: "Sales Distcctv",
    isOnline: false,
  },
];

export const mockMessages: Message[] = [
  {
    id: "1",
    content:
      "Kakak butuh informasi mengenai layanan maintenance untuk mesin absen.",
    sender: "customer",
    timestamp: "Wednesday 17:07",
    isSystem: false,
  },
  {
    id: "2",
    content:
      "Masalah yang dihadapi kakak adalah laporan dari mesin absen yang tidak akurat.",
    sender: "customer",
    timestamp: "Wednesday 17:07",
    isSystem: false,
  },
  {
    id: "3",
    content:
      "Kakak memberikan detail informasi untuk maintenance mesin absen dan menekankan masalah adalah laporan yang tidak akurat.",
    sender: "customer",
    timestamp: "Wednesday 17:07",
    isSystem: false,
  },
  {
    id: "4",
    content: "Selamat sore Ibu Vina, perkenalkan saya tria dari Distcctv",
    sender: "agent",
    timestamp: "Wednesday 17:07",
    isSystem: false,
  },
  {
    id: "5",
    content: "Ibu izin sales kami ibu ini kontak ibu ya bu",
    sender: "agent",
    timestamp: "Wednesday 17:07",
    isSystem: false,
  },
  {
    id: "6",
    content: "mohon tunggu ya ibu",
    sender: "agent",
    timestamp: "Wednesday 17:07",
    isSystem: false,
  },
  {
    id: "7",
    content: "This conversation resolved by Sales DISTCCTV",
    sender: "system",
    timestamp: "Wednesday 17:54",
    isSystem: true,
  },
  {
    id: "8",
    content:
      "Halo 👋\nSelamat datang di DISTCCTV The Biggest E-Commerce CCTV In Indonesia, Perusahaan Security System Terlengkap dan Terpercaya.\n\nBoleh saya bantu? Kira-kira kebutuhan utamanya lebih ke:",
    sender: "agent",
    timestamp: "Wednesday 18:58",
    isSystem: false,
  },
];

export const mockChatInfo: ChatInfo = {
  customerName: "Ibu Vina Tangerang",
  customerId: "628217328523",
  agent: "CS DISTCCTV ex. Aulia",
  status: "resolved",
  labels: [],
  handledBy: "Sales DISTCCTV",
  collaborators: [],
  notes: "whatsapp sync",
  assignedBy: "Sales DISTCCTV",
  resolvedBy: "SPV DISTCCTV",
  aiHandoffAt: "June 18th 2025, 5:05 pm",
  assignedAt: "June 19th 2025, 5:24 pm",
  createdAt: "June 18th 2025, 4:58 pm",
  resolvedAt: "June 19th 2025, 5:24 pm",
  openUntil: "00:00:00",
};

export const aiAgents = [
  {
    id: "1",
    name: "HIHI",
    type: "Customer Service AI",
    description: "AI agent for customer support",
    avatar: "H",
    created: "19/06/2025",
  },
];

export const humanAgents = [
  {
    id: "1",
    name: "kapanpulang@gmail.com",
    email: "kapanpulang@gmail.com",
    role: "Super Admin",
    department: "management",
    status: "Active",
  },
];

export const mockPlatforms: Platform[] = [
  {
    id: "1",
    name: "Sales Distcctv",
    type: "whatsapp",
    phone: "628212200543",
    isActive: true,
    aiAgent: "DISTCCTV AI",
    teams: ["DISTCCTV"],
    humanAgent: "SPV DISTCCTV",
    distributionMethod: "least-assigned",
    csatEnabled: true,
  },
  {
    id: "2",
    name: "abangbenerin",
    type: "instagram",
    isActive: true,
    aiAgent: "Abang Benerin AI",
    teams: ["Support Team"],
    humanAgent: "Support Agent",
    distributionMethod: "round-robin",
    csatEnabled: false,
  },
  {
    id: "3",
    name: "Abang Benerin Support",
    type: "whatsapp",
    phone: "628157418790",
    description: "Penjadwalan Aktif",
    isActive: true,
    aiAgent: "Abang Benerin AI",
    teams: ["Support Team"],
    humanAgent: "Support Agent",
    distributionMethod: "least-assigned",
    csatEnabled: true,
  },
  {
    id: "4",
    name: "Abang Benerin",
    type: "whatsapp",
    phone: "628158634601",
    description: "Transaksi Aktif",
    isActive: true,
    aiAgent: "Abang Benerin AI",
    teams: ["Sales Team"],
    humanAgent: "Sales Agent",
    distributionMethod: "manual",
    csatEnabled: false,
  },
  {
    id: "5",
    name: "Abang Benerin Ops",
    type: "whatsapp",
    phone: "628168187727",
    description: "Ops Aktif",
    isActive: true,
    aiAgent: "Abang Benerin AI",
    teams: ["Operations"],
    humanAgent: "Ops Agent",
    distributionMethod: "least-assigned",
    csatEnabled: true,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "trial",
    name: "14-Day Trial",
    description: "Coba semua fitur premium secara gratis selama 14 hari",
    price: "Gratis",
    period: "14 hari",
    badge: "Trial",
    badgeColor: "bg-green-100 text-green-800 border-green-200",
    icon: Zap,
    features: [
      { text: "Unlimited AI Conversations", included: true },
      { text: "Multi-Platform Integration", included: true },
      { text: "Basic Analytics", included: true },
      { text: "Email Support", included: true },
      { text: "Team Collaboration (up to 3 users)", included: true },
      { text: "Advanced Analytics", included: false },
      { text: "Priority Support", included: false },
      { text: "Custom Integrations", included: false },
    ],
  },
  {
    id: "subscription",
    name: "30-Day Subscription",
    description: "Akses penuh ke semua fitur premium dengan dukungan prioritas",
    price: "Rp 299.000",
    period: "per bulan",
    badge: "Popular",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    icon: Crown,
    popular: true,
    features: [
      { text: "Unlimited AI Conversations", included: true },
      { text: "Multi-Platform Integration", included: true },
      { text: "Advanced Analytics & Reports", included: true },
      { text: "Priority Support 24/7", included: true },
      { text: "Team Collaboration (unlimited users)", included: true },
      { text: "Custom Integrations", included: true },
      { text: "White-label Solution", included: true },
      { text: "API Access", included: true },
    ],
  },
];

// Mock data untuk AI Agents
export const mockAIAgents: AIAgent[] = [
  {
    id: "1",
    name: "DISTCCTV AI",
    role_id: "1",
    is_active: true,
    role: {
      id: "1",
      name: "Customer Support",
      description: "Handles customer inquiries and support requests",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    },
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Sales Assistant AI",
    role_id: "2",
    is_active: true,
    role: {
      id: "2",
      name: "Sales Assistant",
      description: "Assists with sales inquiries and product information",
      created_at: "2024-02-20T14:45:00Z",
      updated_at: "2024-02-20T14:45:00Z",
    },
    created_at: "2024-02-20T14:45:00Z",
    updated_at: "2024-02-20T14:45:00Z",
  },
  {
    id: "3",
    name: "Technical Support AI",
    role_id: "3",
    is_active: true,
    role: {
      id: "3",
      name: "Technical Support",
      description: "Provides technical assistance and troubleshooting",
      created_at: "2024-03-10T09:15:00Z",
      updated_at: "2024-03-10T09:15:00Z",
    },
    created_at: "2024-03-10T09:15:00Z",
    updated_at: "2024-03-10T09:15:00Z",
  },
];

// Mock data untuk Human Agents
export const mockHumanAgents = [
  {
    id: "1",
    name: "SPV DISTCCTV",
    user_email: "spv@distcctv.com",
    role: "manager",
    department: "Supervision",
    is_active: true,
  },
  {
    id: "2",
    name: "Customer Service 1",
    user_email: "cs1@distcctv.com",
    role: "human-agent",
    department: "Customer Service",
    is_active: true,
  },
  {
    id: "3",
    name: "Sales Agent 1",
    user_email: "sales1@distcctv.com",
    role: "human-agent",
    department: "Sales",
    is_active: true,
  },
  {
    id: "4",
    name: "Technical Support",
    user_email: "tech@distcctv.com",
    role: "human-agent",
    department: "Technical",
    is_active: true,
  },
];

// Mock data untuk WhatsApp Platform
export const mockWhatsAppPlatform: WhatsAppPlatform = {
  id: "1082fe3c_device_1750494274779_67xmoijuo",
  name: "WhatsApp Business DISTCCTV",
  type: "whatsapp",
  phone: "+628526000993731",
  description: "WhatsApp Business - Connected",
  isActive: true,
  deviceId: "1082fe3c_device_1750494274779_67xmoijuo",
  deviceName: "DISTCCTV Business",
  status: "Connected",
  sessionId: "session_mock_123",
  timestamp: new Date().toISOString(),
  isConnected: true,
  isLoggedIn: true,
  aiAgent: "DISTCCTV AI",
  teams: ["DISTCCTV", "Support Team"],
  humanAgent: "SPV DISTCCTV",
  distributionMethod: "least-assigned",
  csatEnabled: true,
};

export const platformIcons = {
  whatsapp: MessageSquare,
  instagram: Instagram,
  facebook: Facebook,
  email: Mail,
  website: Globe,
  twitter: Twitter,
};

export const distributionMethods = [
  { value: "least-assigned", label: "Least Assigned First" },
  { value: "round-robin", label: "Round Robin" },
];
