import { useState } from 'react';
import { useNavigate } from 'react-router';
import CreatePipelineService, { type CreatePipelineRequest, type PipelineListResponse } from '@/services/pipelineService';

export const useCreatePipeline = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPipeline = async (data: CreatePipelineRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CreatePipelineService.createPipeline(data);
      
      console.log("Pipeline created successfully:", response);
      
      // Redirect to pipeline page with ID as query param
      navigate(`/pipeline?id=${response.id}`);
      
      return response;
    } catch (error: any) {
      console.error("Error creating pipeline:", error);
      setError(error.message || "Failed to create pipeline. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    createPipeline,
    isLoading,
    error,
    clearError
  };
};

export const usePipelineList = () => {
  const [pipelines, setPipelines] = useState<PipelineListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPipelines = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await CreatePipelineService.getPipelines();
      setPipelines(response);
      return response;
    } catch (error: any) {
      console.error("Error fetching pipelines:", error);
      setError(error.message || "Failed to fetch pipelines. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    pipelines,
    fetchPipelines,
    isLoading,
    error,
    clearError
  };
};
