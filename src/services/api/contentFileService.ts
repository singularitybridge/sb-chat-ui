import apiClient from '../AxiosService';

export const uploadContentFile = async (formData: FormData): Promise<any> => {
  try {
    const response = await apiClient.post('/content-file/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading content file:', error);
    throw error;
  }
};

export const getContentFiles = async (): Promise<any> => {
  try {
    const response = await apiClient.get('/content-file/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching content files:', error);
    throw error;
  }
};

export const deleteContentFile = async (fileId: string): Promise<any> => {
  try {
    const response = await apiClient.delete(`/content-file/${fileId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting content file:', error);
    throw error;
  }
};