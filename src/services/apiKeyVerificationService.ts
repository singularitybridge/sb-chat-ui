// services/apiKeyVerificationService.ts
import axios from 'axios';
import apiClient from './AxiosService';

const baseUrl = 'https://api.singularitybridge.net/api';

export const verifyApiKey = async (
  apiKey: string,
  apiKeyId: string
): Promise<boolean> => {  
  try {
    const response = await apiClient.post(`api/verify-api-key`, {
      apiKey,
      apiKeyId,
    });    
    return response.data.isValid;
  } catch (error) {
    console.error('Error verifying API key:', error);
    return false;
  }
};
