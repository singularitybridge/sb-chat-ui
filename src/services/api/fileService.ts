// src/services/api/fileService.ts
import apiClient from '../AxiosService';

export const uploadFile = async (assistantId: string, file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`file/${assistantId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to upload file for assistant ${assistantId}`, error);
    throw error;
  }
};

export const listAssistantFiles = async (assistantId: string): Promise<any[]> => {
  try {
    const response = await apiClient.get(`file/${assistantId}/files`);
    return response.data;
  } catch (error) {
    console.error(`Failed to list files for assistant ${assistantId}`, error);
    throw error;
  }
};

export const deleteFile = async (assistantId: string, fileId: string): Promise<void> => {
  try {
    await apiClient.delete(`file/${assistantId}/files/${fileId}`);
  } catch (error) {
    console.error(`Failed to delete file ${fileId} for assistant ${assistantId}`, error);
    throw error;
  }
};