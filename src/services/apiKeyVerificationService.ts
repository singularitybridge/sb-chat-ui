// services/apiKeyVerificationService.ts
import axios from 'axios';

const baseUrl = 'http://localhost:3000/api';

export const verifyApiKey = async (
  apiKey: string,
  apiKeyId: string
): Promise<boolean> => {
  debugger;
  try {
    const response = await axios.post(`${baseUrl}/verify-api-key`, {
      apiKey,
      apiKeyId,
    });
    debugger;
    return response.data.isValid;
  } catch (error) {
    console.error('Error verifying API key:', error);
    return false;
  }
};
