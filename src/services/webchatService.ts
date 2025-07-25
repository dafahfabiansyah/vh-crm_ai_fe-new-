import { ChatLogsService } from './chatLogsService';
import PipelineService from './pipelineService';
import axiosInstance from './axios';

export interface WebchatRequest {
  message: string;
  name?: string;
  phone?: string;
  agentId: string;
  sessionId?: string;
}

export interface WebchatResponse {
  success: boolean;
  message?: string;
  sessionId?: string;
  contactId?: string;
  leadId?: string;
}

export interface ContactCreateRequest {
  id_platform: string;
  contact_identifier: string;
  push_name: string;
  message: string;
  timestamp: string;
  unread_messages: number;
  fromMe: boolean;
}

export interface LeadCreateRequest {
  name: string;
  potential_value: number;
  id_contact: string;
  assigned_to?: string | null;
  id_pipeline?: string | null;
  id_stage?: string | null;
  moved_by: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ChatLogRequest {
  id_contact: string;
  message: string;
  timestamp: string;
  fromMe: boolean;
  message_type: string;
}

export class WebchatService {
  private static contactSessionIds: { [key: string]: string } = {};
  private static contactLastAgents: { [key: string]: string } = {};

  /**
   * Sync contact with proper unread message handling (following WhatsApp gateway pattern)
   */
  private static async syncContact(logData: any, token: string): Promise<string | null> {
    const {
      id_platform,
      contact_identifier,
      push_name,
      message,
      timestamp,
      fromMe,
    } = logData;

    try {
      // Look up contact by both contact_identifier and id_platform
      const contactRes = await axiosInstance.get(
        `/v1/contacts/${contact_identifier}?id_platform=${encodeURIComponent(id_platform)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true,
        }
      );

      const contactExists = contactRes.status === 200 && contactRes.data?.id;
      const existing = contactExists ? contactRes.data : null;

      // If the message is from you but contact doesn't exist → don't do anything
      if (fromMe && !contactExists) {
        console.warn(`Skipping sync for ${contact_identifier} on platform ${id_platform} — you messaged first & contact doesn't exist`);
        return null;
      }

      // Log contact creation for same identifier on different platforms
      if (!contactExists) {
        console.log(`Creating new contact: ${contact_identifier} on platform ${id_platform}`);
      } else {
        console.log(`Updating existing contact: ${contact_identifier} on platform ${id_platform}`);
      }

      let unreadMessages = 0;
      let lastMessageFromMe = fromMe;
      if (!contactExists) {
        unreadMessages = fromMe ? 0 : 1;
        lastMessageFromMe = fromMe;
      } else {
        if (fromMe) {
          unreadMessages = 0;
          lastMessageFromMe = false;
        } else {
          unreadMessages = (existing?.unread_messages || 0) + 1;
          lastMessageFromMe = true;
        }
      }

      const payload = {
        id_platform,
        contact_identifier,
        push_name: fromMe ? null : push_name,
        message,
        timestamp,
        unread_messages: unreadMessages,
        fromMe: lastMessageFromMe,
      };

      const res = await axiosInstance.post('/v1/contacts', payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
      });

      if (res.status === 200 || res.status === 201) {
        const id = res.data?.id || res.data?.contact?.id;
        if (id) return id;
      }

      console.warn("Failed to sync contact:", res.status, res.data);
      return null;
    } catch (err: any) {
      console.error("Error syncing contact:", err.response?.data || err.message);
      return null;
    }
  }

  /**
   * Process webchat message following WhatsApp gateway pattern
   */
  static async processWebchatMessage(request: WebchatRequest): Promise<WebchatResponse> {
    try {
      const { message, name, agentId } = request;
      const timestamp = new Date().toISOString();
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Generate unique contact identifier if name is provided
      const contactIdentifier = name || `webchat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const pushName = name || contactIdentifier;
      
      // Use a consistent webchat platform ID (should be from platform configuration)
      const webchatPlatformId = `webchat-${agentId}`; // Use agent-specific platform ID
      
      // 1. Sync contact using WhatsApp gateway pattern
      const logData = {
        id_platform: webchatPlatformId,
        contact_identifier: contactIdentifier,
        push_name: pushName,
        message: message,
        timestamp: timestamp,
        fromMe: false
      };
      
      console.log('Syncing contact:', logData);
      const contactId = await this.syncContact(logData, token);
      
      if (!contactId) {
        throw new Error('Failed to sync contact');
      }
      
      // 2. Create chat log with proper message handling
      const chatLogPayload = {
        id_contact: contactId,
        message: message,
        timestamp: timestamp,
        fromMe: false,
        message_type: 'text'
      };
      
      console.log('Creating chat log:', chatLogPayload);
      const chatLogRes = await axiosInstance.post('/v1/chat-logs', chatLogPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        validateStatus: () => true,
      });
      
      if (chatLogRes.status !== 200 && chatLogRes.status !== 201) {
        console.warn('Failed to create chat log:', chatLogRes.status, chatLogRes.data);
        throw new Error('Failed to create chat log');
      }
      
      const chatLogId = chatLogRes.data?.id;
      if (!chatLogId) {
        throw new Error('Chat log created but no ID returned');
      }
      
      // 3. Check for existing lead (following whatsappgateway.txt pattern)
      let existingLead = null;
      let hasActiveExistingLead = false;
      let assignedTo = null;
      let agentIdentifier = null;
      let shouldRespondWithAI = false;
      
      try {
        // First try to get unassigned leads for this contact
        const unassignedLeadRes = await axiosInstance.get(
          `/v1/leads/contact/${contactId}?status=unassigned`,
          {
            headers: { Authorization: `Bearer ${token}` },
            validateStatus: () => true,
          }
        );
        
        if (unassignedLeadRes.status === 200 && unassignedLeadRes.data) {
          existingLead = unassignedLeadRes.data;
          console.log('Found unassigned lead:', existingLead.id, 'assigned to:', existingLead.assigned_to);
        }
      } catch (error) {
        console.log('Error fetching unassigned leads:', error);
      }
      
      // If no unassigned lead found, try to get any existing lead
      if (!existingLead) {
        try {
          const existingLeadRes = await axiosInstance.get(
            `/v1/leads/contact/${contactId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              validateStatus: () => true,
            }
          );
          
          if (existingLeadRes.status === 200 && existingLeadRes.data) {
            existingLead = existingLeadRes.data;
            console.log('Found existing lead:', existingLead.id, 'assigned to:', existingLead.assigned_to, 'status:', existingLead.status);
          }
        } catch (error) {
          console.log('Error fetching existing leads:', error);
        }
      }
      
      // Check if existing lead is active
      if (existingLead) {
        const isLeadActive = existingLead.status !== 'resolved' && existingLead.status !== 'closed' && 
                            existingLead.status !== 'won' && existingLead.status !== 'lost';
        
        if (isLeadActive && existingLead.assigned_to) {
          hasActiveExistingLead = true;
          assignedTo = existingLead.assigned_to;
          console.log('Using existing active lead assignment:', assignedTo);
          
          // Get agent details for the assigned agent
          try {
            const agentRes = await axiosInstance.get(
              `/v1/agents/${assignedTo}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: () => true,
              }
            );
            
            if (agentRes.status === 200) {
              agentIdentifier = agentRes.data?.identifier || assignedTo;
              shouldRespondWithAI = agentRes.data?.agent_type === "AI";
              console.log('Using existing lead agent:', assignedTo, 'Type:', agentRes.data?.agent_type);
            } else {
              console.log('Could not fetch existing lead agent details, using ID as fallback');
              agentIdentifier = assignedTo;
              shouldRespondWithAI = true;
            }
          } catch (error) {
            console.log('Error fetching existing lead agent details:', error);
            agentIdentifier = assignedTo;
          }
        } else {
          console.log('Existing lead is resolved/closed or has no assignment, will create new lead with pipeline defaults');
        }
      } else {
        console.log('No existing lead found, will create new lead with pipeline defaults');
      }
      
      // 4. Get platform inbox details for pipeline (if no active existing lead)
      let idPipeline = null;
      let idStage = null;
      
      if (!hasActiveExistingLead) {
        try {
          // For webchat, we'll use the agent's default pipeline
          const agentRes = await axiosInstance.get(
            `/v1/agents/${agentId}`,
            {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
              validateStatus: () => true,
            }
          );
          
          if (agentRes.status === 200) {
            // Get agent's pipeline from platform mapping or default
            const platformMappingRes = await axiosInstance.get(
              `/v1/platform_mappings/agent/${agentId}`,
              {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                validateStatus: () => true,
              }
            );
            
            if (platformMappingRes.status === 200 && platformMappingRes.data?.length > 0) {
              const mapping = platformMappingRes.data[0];
              idPipeline = mapping.id_pipeline;
            }
            
            // If no pipeline from mapping, use a default pipeline
            if (!idPipeline) {
              const pipelinesRes = await PipelineService.getPipelines();
              if (pipelinesRes.length > 0) {
                idPipeline = pipelinesRes[0].id;
              }
            }
            
            assignedTo = agentId;
            agentIdentifier = agentRes.data?.identifier || agentId;
            shouldRespondWithAI = agentRes.data?.agent_type === "AI";
          }
        } catch (error) {
          console.log('Error fetching agent details:', error);
          assignedTo = agentId;
          agentIdentifier = agentId;
          shouldRespondWithAI = true;
        }
        
        // Get default stage from pipeline
        if (idPipeline) {
          try {
            const stagesRes = await axiosInstance.get(
              `/v1/stages/pipeline/${idPipeline}`,
              {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                validateStatus: () => true,
              }
            );
            
            if (stagesRes.status === 200 && Array.isArray(stagesRes.data)) {
              const defaultStage = stagesRes.data.find(stage => stage.stage_order === 0);
              if (defaultStage) {
                idStage = defaultStage.id;
                
                // Use stage agent if available
                if (defaultStage.id_agent) {
                  assignedTo = defaultStage.id_agent;
                  
                  // Get stage agent details
                  try {
                    const stageAgentRes = await axiosInstance.get(
                      `/v1/agents/${defaultStage.id_agent}`,
                      {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                        validateStatus: () => true,
                      }
                    );
                    
                    if (stageAgentRes.status === 200) {
                      agentIdentifier = stageAgentRes.data?.identifier || defaultStage.id_agent;
                      shouldRespondWithAI = stageAgentRes.data?.agent_type === "AI";
                    }
                  } catch (error) {
                    console.log('Error fetching stage agent details:', error);
                  }
                }
              }
            }
          } catch (error) {
            console.log('Error fetching stages:', error);
          }
        }
      }
      
      // 5. Create lead only if there's actual content and no active existing lead
      let leadId = existingLead?.id;
      
      if (!hasActiveExistingLead && message && message.trim()) {
        const leadPayload: LeadCreateRequest = {
          name: pushName,
          potential_value: 0,
          id_contact: contactId,
          assigned_to: assignedTo || null,
          id_pipeline: idPipeline || null,
          id_stage: idStage || null,
          moved_by: "AI",
          status: "unassigned",
          created_at: timestamp,
          updated_at: timestamp,
        };
        
        console.log('Creating lead:', leadPayload);
        const leadResponse = await axiosInstance.post('/v1/leads', leadPayload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        leadId = leadResponse.data?.id;
        console.log('Lead created:', leadPayload);
      } else if (hasActiveExistingLead) {
        console.log('Using existing active lead, skipping lead creation');
      } else {
        console.log('Skipping lead creation - no content in message');
      }
      
      // 6. Generate session ID and handle AI response
      let sessionId = request.sessionId;
      const contactKey = `${webchatPlatformId}_${contactIdentifier}`;
      const lastUsedAgent = this.contactLastAgents[contactKey];
      const hasAgentChanged = lastUsedAgent && lastUsedAgent !== agentIdentifier;
      let isFirstMessage = false;
      
      if (!sessionId || hasAgentChanged || (existingLead && existingLead.status === 'resolved')) {
        sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.contactSessionIds[contactKey] = sessionId;
        this.contactLastAgents[contactKey] = agentIdentifier || '';
        isFirstMessage = !lastUsedAgent;
        console.log('New session_id created:', sessionId);
      }
      
      // 7. Send welcome message if first interaction
      if (isFirstMessage && agentIdentifier && shouldRespondWithAI) {
        try {
          console.log('Sending welcome message for first interaction:', contactKey);
          
          const agentSettingsResponse = await axiosInstance.get(`/v1/ai/agents/${agentIdentifier}/settings`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            validateStatus: () => true,
          });
          
          let welcomeMessage = "";
          
          if (agentSettingsResponse.status === 200 && agentSettingsResponse.data?.welcome_message) {
            welcomeMessage = agentSettingsResponse.data.welcome_message;
            
            // Send welcome message to chat API
            const welcomePayload = {
              message: welcomeMessage,
              session_id: sessionId,
              contact_identifier: contactIdentifier,
              platform: webchatPlatformId
            };
            
            await axiosInstance.post(`/v1/ai/agents/${agentIdentifier}/chat`, welcomePayload, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            
            // Log welcome message and update contact
            const welcomeTimestamp = new Date().toISOString();
            const welcomeChatlogPayload: ChatLogRequest = {
              id_contact: contactId,
              message: welcomeMessage,
              timestamp: welcomeTimestamp,
              fromMe: true,
              message_type: 'text'
            };
            
            const welcomeChatLogRes = await axiosInstance.post('/v1/chat-logs', welcomeChatlogPayload, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              validateStatus: () => true,
            });
            
            if (welcomeChatLogRes.status === 200 || welcomeChatLogRes.status === 201) {
              // Update contact with welcome message (fromMe: true, unread: 0)
              const welcomeContactUpdate = {
                id_platform: webchatPlatformId,
                contact_identifier: contactIdentifier,
                message: welcomeMessage,
                timestamp: welcomeTimestamp,
                unread_messages: 0,
                fromMe: true,
              };
              
              await axiosInstance.post('/v1/contacts', welcomeContactUpdate, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                validateStatus: () => true,
              });
            }
          }
        } catch (error) {
          console.log('Error sending welcome message:', error);
        }
      }
      
      // 8. Send user message to AI agent
      if (message && agentIdentifier && shouldRespondWithAI) {
        try {
          const chatPayload = {
            message: message,
            session_id: sessionId,
            contact_identifier: contactIdentifier,
            platform: webchatPlatformId
          };
          
          console.log('Sending message to AI agent:', agentIdentifier, chatPayload);
          
          const aiResponse = await axiosInstance.post(`/v1/ai/agents/${agentIdentifier}/chat`, chatPayload, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          // Log AI response if available and update contact
          if (aiResponse.data?.message) {
            const aiTimestamp = new Date().toISOString();
            const aiChatlogPayload: ChatLogRequest = {
              id_contact: contactId,
              message: aiResponse.data.message,
              timestamp: aiTimestamp,
              fromMe: true,
              message_type: 'text'
            };
            
            const aiChatLogRes = await axiosInstance.post('/v1/chat-logs', aiChatlogPayload, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              validateStatus: () => true,
            });
            
            if (aiChatLogRes.status === 200 || aiChatLogRes.status === 201) {
              // Update contact with AI message (fromMe: true, unread: 0)
              const aiContactUpdate = {
                id_platform: webchatPlatformId,
                contact_identifier: contactIdentifier,
                message: aiResponse.data.message,
                timestamp: aiTimestamp,
                unread_messages: 0,
                fromMe: true,
              };
              
              await axiosInstance.post('/v1/contacts', aiContactUpdate, {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                validateStatus: () => true,
              });
            }
          }
        } catch (error) {
          console.log('Error sending message to AI agent:', error);
        }
      }
      
      return {
        success: true,
        message: 'Message processed successfully',
        sessionId: sessionId,
        contactId: contactId,
        leadId: leadId
      };
      
    } catch (error: any) {
      console.error('Error processing webchat message:', error);
      throw new Error(error.message || 'Failed to process webchat message');
    }
  }
  
  /**
   * Get chat history for a contact
   */
  static async getChatHistory(contactId: string): Promise<any[]> {
    try {
      return await ChatLogsService.getChatLogsByContact(contactId);
    } catch (error: any) {
      console.error('Error fetching chat history:', error);
      throw new Error(error.message || 'Failed to fetch chat history');
    }
  }
}

export default WebchatService;