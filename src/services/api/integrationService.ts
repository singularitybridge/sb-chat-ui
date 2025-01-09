import apiClient from '../AxiosService';

interface WriteFileRequest {
  data: {
    fileId: string;
    title: string;
    description: string;
    content: string;
  };
}

interface WriteFileResponse {
  _id: string;
  filename: string;
  title: string;
  description: string;
  mimeType: string;
  size: number;
  sessionId: string;
  gcpStorageUrl: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const writeFile = async (params: WriteFileRequest): Promise<WriteFileResponse> => {
  try {
    const response = await apiClient.post<WriteFileResponse>(
      '/integrations/actions/content_file/writeFile',
      params
    );
    return response.data;
  } catch (error) {
    console.error('Failed to write file:', error);
    throw error;
  }
};

// Add more integration actions here as needed
