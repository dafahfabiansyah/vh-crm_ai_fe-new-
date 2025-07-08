import axiosInstance from './axios';

export async function getSubscriptionPlans() {
  const response = await axiosInstance.get('/v1/subscription-plans?with_details=true');
  return response.data;
} 