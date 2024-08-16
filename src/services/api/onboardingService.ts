import { OnboardingStatus } from '../../store/models/RootStore';
import apiClient from '../AxiosService';


export const getOnboardingStatus = async () => {
  try {
    const response = await apiClient.get('/onboarding/status');
    return response.data;
  } catch (error) {
    console.error('Failed to get onboarding status:', error);
    throw error;
  }
};

export const updateOnboardingStatus = async (status: OnboardingStatus, modules: string[]) => {
  try {
    const response = await apiClient.put('/onboarding/status', { status, modules });
    return response.data;
  } catch (error) {
    console.error('Failed to update onboarding status:', error);
    throw error;
  }
};