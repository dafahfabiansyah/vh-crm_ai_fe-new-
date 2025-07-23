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
   * Post website knowledge dengan format baru (tanpa content, langsung url, scrape_type, max_links di root)
   */
  static async postWebsiteKnowledge(
    agentId: string,
    name: string,
    description: string,
    url: string,
    scrape_type: string,
    max_links: number
  ): Promise<any> {
    try {
      const response = await axiosInstance.post(
        `/v1/ai/knowledge/agent/${agentId}/website`,
        {
          name,
          description,
          status: true,
          url,
          scrape_type,
          max_links,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to post website knowledge',
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
   * Get website knowledge by agent ID
   */
  static async getWebsiteKnowledge(agentId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/v1/ai/knowledge/website/agent/${agentId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch website knowledge',
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
   * Get website knowledge detail by website ID
   */
  static async getWebsiteKnowledgeByWebsiteId(websiteId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/v1/ai/scraped-pages/website/${websiteId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch website knowledge detail',
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

  /**
   * Update knowledge base (name, description, status)
   */
  static async updateKnowledgeBase(id: string, data: { name: string; description: string; status: boolean }): Promise<any> {
    try {
      const response = await axiosInstance.put(`/v1/ai/knowledge/base/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to update knowledge base',
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
   * Delete website knowledge by scraped pages ID
   */
  static async deleteWebsiteKnowledge(scrapedPagesId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/ai/scraped-pages/${scrapedPagesId}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to delete website knowledge',
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

  // Q&A Knowledge CRUD Methods

  /**
   * Create Q&A knowledge
   */
  static async createQAKnowledge(question: string, answer: string): Promise<any> {
    try {
      const response = await axiosInstance.post(`/v1/ai/knowledge/qa`, {
        question,
        answer
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to create Q&A knowledge',
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
   * Get all Q&A knowledge
   */
  static async getAllQAKnowledge(): Promise<any> {
    try {
      const response = await axiosInstance.get(`/v1/ai/knowledge/qa`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch Q&A knowledge',
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
   * Get Q&A knowledge by ID
   */
  static async getQAKnowledgeById(idQnaKnowledge: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/v1/ai/knowledge/qa/${idQnaKnowledge}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch Q&A knowledge',
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
   * Update Q&A knowledge
   */
  static async updateQAKnowledge(idQnaKnowledge: string, question: string, answer: string): Promise<any> {
    try {
      const response = await axiosInstance.put(`/v1/ai/knowledge/qa/${idQnaKnowledge}`, {
        question,
        answer
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to update Q&A knowledge',
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
   * Delete Q&A knowledge
   */
  static async deleteQAKnowledge(idQnaKnowledge: string): Promise<void> {
    try {
      await axiosInstance.delete(`/v1/ai/knowledge/qa/${idQnaKnowledge}`);
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to delete Q&A knowledge',
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
   * Edit text knowledge
   */
  static async editTextKnowledge(id: string, content: string): Promise<any> {
    try {
      const response = await axiosInstance.put(
        `/v1/ai/knowledge/text/${id}`,
        {
          content,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to edit text knowledge',
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
   * Update text knowledge by ID
   */
  static async updateTextKnowledge(id: string, content: string): Promise<any> {
    try {
      const response = await axiosInstance.put(
        `/v1/ai/knowledge/text/${id}`,
        {
          content,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to update text knowledge',
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
   * Get all text knowledge
   */
  static async getAllTextKnowledge(): Promise<any> {
    try {
      const response = await axiosInstance.get('/v1/ai/knowledge/text');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch all text knowledge',
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
   * Get text knowledge by ID
   */
  static async getTextKnowledgeById(id: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/v1/ai/knowledge/text/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw {
          message: error.response.data.message || 'Failed to fetch text knowledge by id',
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
