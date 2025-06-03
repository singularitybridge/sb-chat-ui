import { FileMetadata } from '../types/chat';

// File type constants
export const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/mov'];
export const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Check if file is an image
export const isImageFile = (mimeType: string): boolean => {
  return IMAGE_TYPES.includes(mimeType);
};

// Check if file is a video
export const isVideoFile = (mimeType: string): boolean => {
  return VIDEO_TYPES.includes(mimeType);
};

// Check if file is a document
export const isDocumentFile = (mimeType: string): boolean => {
  return DOCUMENT_TYPES.includes(mimeType);
};

// Get file icon based on type
export const getFileIcon = (mimeType: string): string => {
  if (isImageFile(mimeType)) return '🖼️';
  if (isVideoFile(mimeType)) return '🎥';
  if (isDocumentFile(mimeType)) return '📄';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  if (mimeType.includes('text')) return '📝';
  return '📎';
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  const maxSize = isImageFile(file.type) ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${formatFileSize(maxSize)} limit`
    };
  }

  // Check file type (basic validation)
  const allowedTypes = [
    ...IMAGE_TYPES,
    ...VIDEO_TYPES,
    ...DOCUMENT_TYPES,
    'text/plain',
    'application/json',
    'audio/mpeg',
    'audio/wav',
    'application/zip',
    'application/x-rar-compressed',
    'text/csv'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not supported`
    };
  }

  return { isValid: true };
};

// Create preview URL for file
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Generate thumbnail for image using canvas
export const generateImageThumbnail = (file: File, maxWidth = 300, maxHeight = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file.type)) {
      reject(new Error('File is not an image'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Calculate dimensions
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Failed to create thumbnail'));
        }
      }, 'image/jpeg', 0.8);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

// Create file metadata from upload response
export const createFileMetadata = (file: File, uploadResponse: any): FileMetadata => {
  // uploadResponse is the full response from apiClient, so uploadResponse.data is the actual payload
  const responseData = uploadResponse.data || uploadResponse; // Handle if uploadResponse is already the data part
  return {
    id: responseData?._id || undefined, // Assuming the ID is returned as _id
    type: isImageFile(file.type) ? 'image' : 'file',
    url: responseData?.gcpStorageUrl || '',
    fileName: responseData?.filename || file.name,
    fileSize: responseData?.size || file.size,
    mimeType: file.type,
    gcpStorageUrl: responseData?.gcpStorageUrl
  };
};

// Cleanup preview URLs to prevent memory leaks
export const cleanupPreviewUrls = (urls: string[]) => {
  urls.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
};
