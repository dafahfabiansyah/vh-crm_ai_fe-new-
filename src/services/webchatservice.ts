import axios, { type AxiosResponse } from 'axios';
import { getCookie, setCookie } from '@/utils/cookies';

// Constants for cookie management
const WEBCHAT_SESSION_COOKIE = 'webchat_session';
const WEBCHAT_CONTACT_COOKIE = 'webchat_contact';
const WEBCHAT_PLATFORM_COOKIE = 'webchat_platform';
const WEBCHAT_AUTH_COOKIE = 'webchat_auth';
const WEBCHAT_CONTACT_IDENTIFIER_COOKIE = 'webchat_contact_identifier';

// Interfaces
export interface WebchatRequest {
  message: string;
  name?: string;
  phone?: string;
  agentId?: string;
  sessionId?: string;
  containerId?: string;
  platformId?: string;
  contactIdentifier?: string;
}

// AI Request interface matching Go struct
export interface AIWebchatRequest {
  message: string;
  session_id?: string;
  customer_name?: string;
  customer_phone?: string;
  id_platform: string;
  webchat: WebchatDetails;
}

export interface WebchatDetails {
  session: string;
  customer_identifier: string;
  platform_identifier: string;
}

export interface WebchatResponse {
  success: boolean;
  data?: any;
  error?: string;
  sessionId?: string;
  contactId?: string;
  assignedTo?: string | null;
  agentIdentifier?: string | null;
  shouldRespondWithAI?: boolean;
}

export interface WebchatDetailedResponse {
  success: boolean;
  message: string;
  data?: {
    lead: Lead;
    contact: Contact;
    sessionId: string;
    message: string;
    assignedTo?: string | null;
    agentIdentifier?: string | null;
    shouldRespondWithAI?: boolean;
  };
}

export interface Contact {
  id: string;
  contact_identifier: string;
  platform_id: string;
  name?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Interface for contact API response (nested structure)
export interface ContactApiResponse {
  contact: Contact;
  message: string;
}

export interface Lead {
  id: string;
  contact_id: string;
  session_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  lead_id: string;
  message: string;
  sender_type: 'user' | 'ai' | 'agent';
  timestamp: string;
}

class WebchatService {
  private static baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  // Helper method to generate session ID
  private static generateSessionId(): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${randomString}`;
  }

  // Helper method to get auth token
  private static getAuthToken(): string {
    return getCookie(WEBCHAT_AUTH_COOKIE) || '';
  }

  // Helper method to set auth token
  private static setAuthToken(token: string): void {
    setCookie(WEBCHAT_AUTH_COOKIE, token, 7); // 7 days expiry
  }

  // Create or get contact (matching WhatsApp gateway syncContact structure)
  static async createOrGetContact(
    contactIdentifier: string,
    platformId: string,
    authToken: string,
    pushName?: string,
    message?: string,
    fromMe: boolean = false,
    phone?: string
  ): Promise<Contact> {
    try {
      // Create contact payload first (matching WhatsApp gateway structure)
      const payload = {
        id_platform: platformId,
        contact_identifier: contactIdentifier,
        push_name: fromMe ? undefined : (pushName || this.getOrCreateLeadName() || 'FriendlyGuest-A'),
        message: message || '',
        timestamp: new Date().toISOString(),
        unread_messages: fromMe ? 0 : 1,
        fromMe: fromMe,
        phone: phone || undefined,
      };

      console.log(`👤 Creating/updating contact: ${contactIdentifier} on platform ${platformId}`);

      // Create or update contact - backend will handle existing contact logic
      const response: AxiosResponse<ContactApiResponse | Contact> = await axios.post(
        `${this.baseURL}/v1/contacts`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          validateStatus: () => true,
        }
      );

      // Extract contact data for logging
      let contactForLogging: Contact;
      if ('contact' in response.data && response.data.contact) {
        contactForLogging = (response.data as ContactApiResponse).contact;
      } else {
        contactForLogging = response.data as Contact;
      }

      console.log('📋 Contact API Response:', {
        status: response.status,
        data: response.data,
        hasId: !!contactForLogging?.id,
        dataKeys: response.data ? Object.keys(response.data) : [],
        fullResponse: JSON.stringify(response.data, null, 2)
      });

      if (response.status === 200 || response.status === 201) {
        // Handle nested response structure - backend returns {contact: {...}, message: "..."}
        let contactData: Contact;
        
        // Check if response has nested structure with 'contact' property
        if ('contact' in response.data && response.data.contact) {
          contactData = (response.data as ContactApiResponse).contact;
        } else {
          contactData = response.data as Contact;
        }
        
        if (contactData?.id) {
          // Store contact info in cookies
          setCookie(WEBCHAT_CONTACT_COOKIE, contactData.id, 1);
          setCookie(WEBCHAT_PLATFORM_COOKIE, platformId, 1);
          return contactData;
        } else {
          console.error('❌ Contact data missing ID field:', contactData);
          console.error('❌ Full response:', response.data);
          throw new Error('Contact response missing ID field');
        }
      }

      console.warn('⚠️ Failed to sync contact:', response.status, response.data);
      throw new Error('Failed to create or update contact');
    } catch (error: any) {
      console.error('Error in createOrGetContact:', error);
      throw new Error(`Failed to create or get contact: ${error.message}`);
    }
  }

  // Get contact ID by identifier
  static async getContactIdByIdentifier(
    contactIdentifier: string,
    platformId: string,
    authToken: string
  ): Promise<Contact> {
    try {
      const response: AxiosResponse<Contact> = await axios.get(
        `${this.baseURL}/v1/contacts/${contactIdentifier}/${platformId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Store contact info in cookies
        setCookie(WEBCHAT_CONTACT_COOKIE, response.data.id, 1);
        setCookie(WEBCHAT_PLATFORM_COOKIE, platformId, 1);
        return response.data;
      }

      throw new Error('Contact not found');
    } catch (error: any) {
      console.error('Error getting contact by identifier:', error);
      throw new Error(`Failed to get contact: ${error.message}`);
    }
  }

  // Get agent assignment for platform
  static async getAgentAssignment(
    platformId: string,
    authToken: string
  ): Promise<{ assignedTo: string | null; agentIdentifier: string | null; shouldRespondWithAI: boolean; idPipeline: string | null; idStage: string | null }> {
    try {
      let assignedTo = null;
      let agentIdentifier = null;
      let shouldRespondWithAI = false;
      let idPipeline = null;
      let idStage = null;

      // Get platform inbox by platform ID
      const inboxRes = await axios.get(
        `${this.baseURL}/v1/platform-inboxs/${platformId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
          validateStatus: () => true,
        }
      );
      
      const platformInbox = inboxRes?.data;
      idPipeline = platformInbox?.id_pipeline || null;

      // Get default stage from pipeline if pipeline exists
      if (idPipeline) {
        try {
          const stagesRes = await axios.get(
            `${this.baseURL}/v1/stages/pipeline/${idPipeline}`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
              validateStatus: () => true,
            }
          );
          
          if (stagesRes.status === 200 && Array.isArray(stagesRes.data)) {
            const defaultStage = stagesRes.data.find(stage => stage.stage_order === 0);
            if (defaultStage) {
              idStage = defaultStage.id;
              
              // Check if default stage has an assigned agent
              if (defaultStage.id_agent) {
                try {
                  const agentRes = await axios.get(
                    `${this.baseURL}/v1/agents/${defaultStage.id_agent}`,
                    {
                      headers: { Authorization: `Bearer ${authToken}` },
                      validateStatus: () => true,
                    }
                  );
                  
                  if (agentRes.status === 200) {
                    assignedTo = defaultStage.id_agent;
                    agentIdentifier = agentRes.data?.identifier || defaultStage.id_agent;
                    shouldRespondWithAI = agentRes.data?.agent_type === "AI";
                  }
                } catch (error) {
                  console.log("Error fetching default stage agent details:", error);
                  assignedTo = defaultStage.id_agent;
                  agentIdentifier = defaultStage.id_agent;
                  shouldRespondWithAI = true;
                }
              }
            }
          }
        } catch (error) {
          console.log("Error fetching pipeline stages:", error);
        }
      }

      // If no pipeline or no agent from pipeline, get agent from platform mapping
      if (!assignedTo) {
        try {
          const platformRes = await axios.post(
            `${this.baseURL}/v1/platform_mappings/inbox`,
            { id_platform: platformId },
            {
              headers: { Authorization: `Bearer ${authToken}` },
              validateStatus: () => true,
            }
          );
          
          // First try to find an active AI agent
          const agentAI = (platformRes?.data || []).find((a: any) => a.agent_type === "AI" && a.is_active === true);
          
          if (agentAI) {
            try {
              const agentRes = await axios.get(
                `${this.baseURL}/v1/agents/${agentAI.id_agent}`,
                {
                  headers: { Authorization: `Bearer ${authToken}` },
                  validateStatus: () => true,
                }
              );
              
              if (agentRes.status === 200) {
                assignedTo = agentAI.id_agent;
                agentIdentifier = agentRes.data?.identifier || agentAI.id_agent;
                shouldRespondWithAI = agentRes.data?.agent_type === "AI";
              }
            } catch (error) {
              assignedTo = agentAI.id_agent;
              agentIdentifier = agentAI.id_agent;
              shouldRespondWithAI = true;
            }
          } else {
            // No AI agent found, try to find an active human agent
            const humanAgents = (platformRes?.data || []).filter((a: any) => a.agent_type === "Human" && a.is_active === true);
            
            if (humanAgents.length > 0) {
              assignedTo = humanAgents[0].id_agent;
              agentIdentifier = null;
              shouldRespondWithAI = false;
            }
          }
        } catch (error) {
          console.log("Error fetching platform mapping:", error);
        }
      }

      return {
        assignedTo,
        agentIdentifier,
        shouldRespondWithAI,
        idPipeline,
        idStage
      };
    } catch (error: any) {
      console.error('Error getting agent assignment:', error);
      return {
        assignedTo: null,
        agentIdentifier: null,
        shouldRespondWithAI: false,
        idPipeline: null,
        idStage: null
      };
    }
  }

  // Create or get lead
  static async createOrGetLead(
    contactIdentifier: string,
    platformId: string,
    authToken: string,
    sessionId?: string,
    pushName?: string,
    message?: string,
    phone?: string
  ): Promise<{ lead: Lead; contact: Contact; sessionId: string; assignedTo: string | null; agentIdentifier: string | null; shouldRespondWithAI: boolean }> {
    try {
      // Create or get contact first
      const contact = await this.createOrGetContact(
        contactIdentifier,
        platformId,
        authToken,
        pushName,
        message,
        false, // fromMe - false for customer-initiated contact
        phone
      );

      // Get agent assignment for this platform
      const { assignedTo, agentIdentifier, shouldRespondWithAI, idPipeline, idStage } = await this.getAgentAssignment(
        platformId,
        authToken
      );

      // Always attempt to get existing leads by contact first
      let existingLeads: Lead[] | undefined;
      let activeLead: Lead | undefined;
      
      try {
        const leadsResponse: AxiosResponse<Lead[]> = await axios.get(
          `${this.baseURL}/v1/leads/contact/${contact.id}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        existingLeads = leadsResponse.data;
        
        // Find an active lead (not resolved)
        activeLead = existingLeads?.find(lead => lead.status !== 'resolved');
        
        console.log('Found existing leads:', existingLeads?.length || 0);
        console.log('Active lead found:', !!activeLead);
        
      } catch (error: any) {
        console.log('No existing leads found for contact:', contact.id);
        existingLeads = undefined;
        activeLead = undefined;
      }

      // Create new lead only if:
      // 1. No existing leads found, OR
      // 2. All existing leads have 'resolved' status
      if (!activeLead) {
        console.log('Creating new lead - no active lead found');
        console.log('🔍 SessionId provided to createOrGetLead:', sessionId);
        
        // Generate new session ID only for new leads
        const finalSessionId = sessionId || this.generateSessionId();
        console.log('🎯 Final sessionId for new lead:', finalSessionId);
        
        const leadPayload = {
          name: pushName || contact.name || this.getOrCreateLeadName() || 'FriendlyGuest-A',
          potential_value: 0,
          id_contact: contact.id,
          assigned_to: assignedTo,
          id_pipeline: idPipeline,
          id_stage: idStage,
          moved_by: "AI",
          status: 'unassigned',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const leadResponse: AxiosResponse<Lead> = await axios.post(
          `${this.baseURL}/v1/leads`,
          leadPayload,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Store session info in cookies
        setCookie(WEBCHAT_SESSION_COOKIE, finalSessionId, 1);
        setCookie(WEBCHAT_CONTACT_COOKIE, contact.id, 1);
        setCookie(WEBCHAT_PLATFORM_COOKIE, platformId, 1);

        return {
          lead: leadResponse.data,
          contact,
          sessionId: finalSessionId,
          assignedTo,
          agentIdentifier,
          shouldRespondWithAI
        };
      } else {
        // Use existing active lead
        console.log('Using existing active lead:', activeLead.id);
        
        // For existing leads, preserve existing session or use provided sessionId
        // Only generate new session if none exists
        const existingSessionId = getCookie(WEBCHAT_SESSION_COOKIE);
        const finalSessionId = sessionId || existingSessionId || this.generateSessionId();
        
        // Only update session cookie if it's different (to preserve existing sessions)
        if (!existingSessionId || existingSessionId !== finalSessionId) {
          setCookie(WEBCHAT_SESSION_COOKIE, finalSessionId, 1);
        }
        setCookie(WEBCHAT_CONTACT_COOKIE, contact.id, 1);
        setCookie(WEBCHAT_PLATFORM_COOKIE, platformId, 1);

        return {
          lead: activeLead,
          contact,
          sessionId: finalSessionId,
          assignedTo,
          agentIdentifier,
          shouldRespondWithAI
        };
      }
    } catch (error: any) {
      console.error('Error creating or getting lead:', error);
      throw new Error(`Failed to create or get lead: ${error.message}`);
    }
  }

  // Log chat message (matching WhatsApp gateway structure)
  static async logChatMessage(
    contactId: string,
    message: string,
    fromMe: boolean,
    authToken: string,
    sessionId: string,
    type: string = 'text',
    media: string = ''
  ): Promise<ChatMessage> {
    try {
      const payload = {
        id_contact: contactId,
        message: message || '',
        type,
        media,
        from_me: fromMe,
        sent_at: new Date().toISOString()
      };

      const response: AxiosResponse<ChatMessage> = await axios.post(
        `${this.baseURL}/v1/chatlogs`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 Chatlog sent:', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error logging chat message:', error);
      throw new Error(`Failed to log chat message: ${error.message}`);
    }
  }

  // Update last message for contact
  static async updateLastMessage(
    contactIdentifier: string,
    platformId: string,
    message: string,
    authToken: string
  ): Promise<void> {
    try {
      const payload = {
        contact_identifier: contactIdentifier,
        id_platform: platformId,
        last_message: message,
        unread: 1 // Increment unread count
      };

      await axios.patch(
        `${this.baseURL}/v1/contacts/${contactIdentifier}/${platformId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      console.error('Error updating last message:', error);
      throw new Error(`Failed to update last message: ${error.message}`);
    }
  }

  // Note: Chat history is now handled via WebSocket and ChatLogsService
  // This method has been removed as the REST endpoint /v1/chat/history does not exist
  // Use ChatLogsService.getChatLogsByContactId() instead for initial chat history loading

  // Send AI message to webchat
  static async sendAIMessageToWebchat(
    message: string,
    contactIdentifier: string,
    platformId: string,
    authToken: string,
    sessionId?: string,
    agentId?: string
  ): Promise<WebchatDetailedResponse> {
    try {
      // Create or get lead with agent assignment
      const { lead, contact, sessionId: finalSessionId, assignedTo, agentIdentifier, shouldRespondWithAI } = await this.createOrGetLead(
        contactIdentifier,
        platformId,
        authToken,
        sessionId,
        undefined, // pushName - will default to dynamic positive guest name
        message // pass the AI message for contact sync
      );

      // Log the AI message
      await this.logChatMessage(
        contact.id,
        message,
        true, // from_me: true for AI/agent messages
        authToken,
        finalSessionId
      );

      // Update last message for contact
      await this.updateLastMessage(
        contactIdentifier,
        platformId,
        message,
        authToken
      );

      // Use assigned agent or provided agentId
      const targetAgentId = agentId || assignedTo;
      
      // Send message to AI agent if agent is available
      if (targetAgentId && (shouldRespondWithAI || agentId)) {
        try {
          await this.sendMessageToAI(
            targetAgentId,
            message,
            contact.id,
            lead.id,
            finalSessionId,
            platformId,
            authToken,
            undefined, // containerId
            contact.name, // customerName
            contact.phone, // customerPhone
            contactIdentifier // contactIdentifier
          );
        } catch (error) {
          console.error('Failed to send message to AI agent:', error);
          // Continue processing even if AI agent call fails
        }
      }

      return {
        success: true,
        message: 'AI message sent successfully',
        data: {
          lead,
          contact,
          sessionId: finalSessionId,
          message,
          assignedTo,
          agentIdentifier,
          shouldRespondWithAI
        }
      };
    } catch (error: any) {
      console.error('Error sending AI message to webchat:', error);
      return {
        success: false,
        message: `Failed to send AI message: ${error.message}`
      };
    }
  }

  // Initialize webchat session
  static async initializeWebchatSession(
    contactIdentifier: string,
    platformId: string,
    authToken?: string
  ): Promise<{ sessionId: string; contactId: string; authToken: string }> {
    try {
      // Use provided auth token or get from cookies
      const finalAuthToken = authToken || this.getAuthToken();
      
      if (!finalAuthToken) {
        throw new Error('No auth token available');
      }

      // Create or get contact and lead
      const { contact, sessionId } = await this.createOrGetLead(
        contactIdentifier,
        platformId,
        finalAuthToken,
        undefined, // sessionId
        undefined, // pushName - will default to dynamic positive guest name
        undefined  // message - no message for initialization
      );

      // Store auth token if provided
      if (authToken) {
        this.setAuthToken(authToken);
      }

      return {
        sessionId,
        contactId: contact.id,
        authToken: finalAuthToken
      };
    } catch (error: any) {
      console.error('Error initializing webchat session:', error);
      throw new Error(`Failed to initialize webchat session: ${error.message}`);
    }
  }

  // Get session info from cookies
  static getSessionInfo(): {
    sessionId?: string;
    contactId?: string;
    platformId?: string;
    authToken?: string;
  } {
    return {
      sessionId: getCookie(WEBCHAT_SESSION_COOKIE) || undefined,
      contactId: getCookie(WEBCHAT_CONTACT_COOKIE) || undefined,
      platformId: getCookie(WEBCHAT_PLATFORM_COOKIE) || undefined,
      authToken: getCookie(WEBCHAT_AUTH_COOKIE) || undefined
    };
  }

  // Clear session info
  static clearSessionInfo(): void {
    setCookie(WEBCHAT_SESSION_COOKIE, '', -1);
    setCookie(WEBCHAT_CONTACT_COOKIE, '', -1);
    setCookie(WEBCHAT_PLATFORM_COOKIE, '', -1);
    setCookie(WEBCHAT_AUTH_COOKIE, '', -1);
    setCookie(WEBCHAT_CONTACT_IDENTIFIER_COOKIE, '', -1);
  }

  // Get existing contact ID from cookies
  static getExistingContactId(): string | null {
    return getCookie(WEBCHAT_CONTACT_COOKIE) || null;
  }

  // Get or create lead name from session
  static getOrCreateLeadName(): string | null {
    // Check if we already have a stored lead name
    const storedName = getCookie('webchat_lead_name');
    if (storedName) {
      return storedName;
    }
    
    // Generate a positive guest name with random character
    const positiveNames = [
      'InterestedGuest',
      'CuriousVisitor', 
      'EagerExplorer',
      'FriendlyGuest',
      'WelcomeVisitor',
      'HelpfulSeeker',
      'KindGuest',
      'PoliteVisitor',
      'SmartExplorer',
      'WiseSeeker'
    ];
    
    const randomName = positiveNames[Math.floor(Math.random() * positiveNames.length)];
    const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    const generatedName = `${randomName}-${randomChar}`;
    
    // Store the generated name in cookies
    setCookie('webchat_lead_name', generatedName, 30); // 30 days
    
    return generatedName;
  }

  // Send message to AI agent
  static async sendMessageToAI(
    agentId: string,
    message: string,
    contactId: string,
    leadId: string,
    sessionId: string,
    platformId: string,
    authToken: string,
    containerId?: string,
    customerName?: string,
    customerPhone?: string,
    contactIdentifier?: string
  ): Promise<void> {
    try {
      // Create payload matching Go struct format
      const payload: AIWebchatRequest = {
        message: message,
        session_id: sessionId,
        customer_name: customerName,
        customer_phone: customerPhone,
        id_platform: platformId,
        webchat: {
          session: sessionId,
          customer_identifier: contactIdentifier || contactId,
          platform_identifier: platformId
        }
      };

      await axios.post(
        `${this.baseURL}/v1/chat/agent/${agentId}/webchat`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error: any) {
      console.error('Error sending message to AI agent:', error);
      throw new Error(`Failed to send message to AI agent: ${error.message}`);
    }
  }

  // Process webchat message - main entry point for widget
  static async processWebchatMessage(
    request: WebchatRequest,
    authToken?: string
  ): Promise<WebchatResponse> {
    try {
      // Use provided auth token or get from cookies
      const finalAuthToken = authToken || this.getAuthToken();
      
      if (!finalAuthToken) {
        throw new Error('No auth token available');
      }

      // Check for existing contact identifier in cookies first
      const existingContactIdentifier = getCookie(WEBCHAT_CONTACT_IDENTIFIER_COOKIE);
      
      // Use existing contact identifier, or name, or provided identifier, or generate new one
      const contactIdentifier = existingContactIdentifier || request.name || request.contactIdentifier || `user_${Date.now()}`;
      const platformId = request.platformId || 'webchat';
      
      // Store contact identifier in cookies if it's new
      if (!existingContactIdentifier) {
        setCookie(WEBCHAT_CONTACT_IDENTIFIER_COOKIE, contactIdentifier, 30); // 30 days expiry
      }

      // Create or get contact and lead with agent assignment
      const { lead, contact, sessionId, assignedTo, agentIdentifier, shouldRespondWithAI } = await this.createOrGetLead(
        contactIdentifier,
        platformId,
        finalAuthToken,
        request.sessionId,
        request.name, // Pass pushName for contact creation
        request.message, // Pass the user's message for contact sync
        request.phone // Pass phone number for contact creation
      );

      // Log the user's message
      await this.logChatMessage(
        contact.id,
        request.message,
        false, // from_me: false for customer messages
        finalAuthToken,
        sessionId
      );

      // Update last message for contact
      await this.updateLastMessage(
        contactIdentifier,
        platformId,
        request.message,
        finalAuthToken
      );

      // Send message to AI agent if conditions are met
      if (shouldRespondWithAI && assignedTo && agentIdentifier) {
        try {
          await this.sendMessageToAI(
            assignedTo,
            request.message,
            contact.id,
            lead.id,
            sessionId,
            platformId,
            finalAuthToken,
            request.containerId,
            request.name || contact.name, // customerName
            contact.phone, // customerPhone
            contactIdentifier // contactIdentifier
          );
        } catch (error) {
          console.error('Failed to send message to AI agent:', error);
          // Continue processing even if AI agent call fails
        }
      } else if (request.agentId) {
        // Fallback to provided agentId if no automatic assignment
        try {
          await this.sendMessageToAI(
            request.agentId,
            request.message,
            contact.id,
            lead.id,
            sessionId,
            platformId,
            finalAuthToken,
            request.containerId,
            request.name || contact.name, // customerName
            contact.phone, // customerPhone
            contactIdentifier // contactIdentifier
          );
        } catch (error) {
          console.error('Failed to send message to provided AI agent:', error);
          // Continue processing even if AI agent call fails
        }
      }

      // Store lead name in cookies if provided
      if (request.name) {
        setCookie('webchat_lead_name', request.name, 1);
      }

      return {
        success: true,
        sessionId,
        contactId: contact.id,
        data: {
          lead,
          contact,
          sessionId,
          message: request.message,
          assignedTo,
          agentIdentifier,
          shouldRespondWithAI
        }
      };
    } catch (error: any) {
      console.error('Error processing webchat message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default WebchatService;