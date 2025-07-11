import axiosInstance from './axios';

export interface KnowledgeContent {
  type: 'Text' | 'Website' | 'Product' | 'File' | 'QA';
  text?: {
    content: string;
  };
  website?: {
    url: string;
    title?: string;
  };
  product?: {
    // For new product knowledge, only product_id is required
    product_id: string;
    // For backward compatibility, allow name/category/description (optional)
    name?: string;
    category?: string;
    description?: string;
  };
  file?: {
    filename: string;
    title?: string;
  };
  qa?: {
    question: string;
    answer: string;
    keywords?: string;
  };
}

export interface CreateKnowledgeRequest {
  name: string;
  description: string;
  status: boolean;
  content: KnowledgeContent;
}

export interface KnowledgeResponse {
  name: string;
  description: string;
  status: boolean;
  content: KnowledgeContent;
}

export interface ExistingKnowledge {
  id: string;
  id_agent: string;
  name: string;
  description: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeContentItem {
  id: string;
  id_knowledge: string;
  source_id: string;
  source_type: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  content: {
    content: string;
    // Other potential fields
  };
}

export interface KnowledgeSourceContent {
  id: string;
  name: string;
  description: string;
  status: boolean;
  content: KnowledgeContent;
  created_at: string;
  updated_at: string;
  contentItems?: KnowledgeContentItem[];
}

export class KnowledgeService {
  /**
   * Create knowledge for an AI agent
   */
  static async createKnowledge(agentId: string, data: CreateKnowledgeRequest): Promise<KnowledgeResponse> {
    try {
      const response = await axiosInstance.post<KnowledgeResponse>(`/v1/ai/knowledge/agent/${agentId}/complete`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to create knowledge',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Create text knowledge
   */
  static async createTextKnowledge(agentId: string, name: string, content: string, description?: string): Promise<KnowledgeResponse> {
    return this.createKnowledge(agentId, {
      name,
      description: description || `Text Knowledge Base - ${name}`,
      status: true,
      content: {
        type: 'Text',
        text: {
          content,
        },
      },
    });
  }

  /**
   * Create website knowledge
   */
  static async createWebsiteKnowledge(agentId: string, name: string, url: string, title?: string): Promise<KnowledgeResponse> {
    return this.createKnowledge(agentId, {
      name,
      description: `Website Knowledge Base - ${name}`,
      status: true,
      content: {
        type: 'Website',
        website: {
          url,
          title,
        },
      },
    });
  }

  /**
   * Create product knowledge
   */
  static async createProductKnowledge(agentId: string, name: string, description: string, product_id: string): Promise<KnowledgeResponse> {
    return this.createKnowledge(agentId, {
      name,
      description,
      status: true,
      content: {
        type: 'Product',
        product: {
          product_id,
        },
      },
    });
  }

  /**
   * Create Q&A knowledge
   */
  static async createQAKnowledge(agentId: string, question: string, answer: string, keywords?: string): Promise<KnowledgeResponse> {
    return this.createKnowledge(agentId, {
      name: `Q&A - ${question.substring(0, 50)}...`,
      description: `Q&A Knowledge Base`,
      status: true,
      content: {
        type: 'QA',
        qa: {
          question,
          answer,
          keywords,
        },
      },
    });
  }

  /**
   * Get existing knowledge sources for an agent
   */
  static async getExistingKnowledge(agentId: string): Promise<ExistingKnowledge[]> {
    try {
      const response = await axiosInstance.get<ExistingKnowledge[]>(`/v1/ai/knowledge/base/agent/${agentId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch existing knowledge',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Get knowledge source content by ID
   */
  static async getKnowledgeSourceContent(knowledgeId: string): Promise<KnowledgeSourceContent> {
    try {
      // Get the basic knowledge source information
      const baseResponse = await axiosInstance.get<ExistingKnowledge>(`/v1/ai/knowledge/base/${knowledgeId}`);
      const baseData = baseResponse.data;
      
      // Get the content items for this knowledge source
      const contentResponse = await axiosInstance.get<KnowledgeContentItem[]>(`/v1/ai/knowledge/source/knowledge/${knowledgeId}`);
      const contentItems = contentResponse.data;
      
      // Create a combined response with both the base knowledge info and the content items
      const result: KnowledgeSourceContent = {
        id: baseData.id,
        name: baseData.name,
        description: baseData.description,
        status: baseData.status,
        created_at: baseData.created_at,
        updated_at: baseData.updated_at,
        contentItems: contentItems,
        // Set a default content for backward compatibility
        content: { 
          type: 'Text', 
          text: { 
            content: contentItems[0]?.content?.content || 'No content available' 
          } 
        }
      };
      
      return result;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch knowledge content',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }

  /**
   * Delete existing knowledge source
   */
  static async deleteKnowledge(idKnowledge: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/ai/knowledge/base/${idKnowledge}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to delete knowledge source',
          status: error.response.status,
          errors: error.response.data.errors,
        };
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    }
  }
}
