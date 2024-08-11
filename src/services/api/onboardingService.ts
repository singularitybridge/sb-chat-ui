import apiClient from '../AxiosService';

export const getOnboardingStatus = async () => {
  try {
    const response = await apiClient.get('/onboarding/status');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch onboarding status:', error);
    throw error;
  }
};

export const updateOnboardingStatus = async (status: string, modules: string[]) => {
  try {
    const response = await apiClient.put('/onboarding/status', { status, modules });
    return response.data;
  } catch (error) {
    console.error('Failed to update onboarding status:', error);
    throw error;
  }
};