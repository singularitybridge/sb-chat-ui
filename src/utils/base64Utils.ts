/**
 * Utility functions for base64 encoding of files
 */

/**
 * Convert a File or Blob to base64 string (without data URL prefix)
 */
export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Create attachment metadata for direct base64 upload
 */
export interface Base64Attachment {
  data: string;  // Base64 string (no data URL prefix)
  mimeType: string;  // e.g., "image/png", "image/jpeg"
  fileName: string;  // e.g., "photo.png"
  cloudUrl?: string;  // Optional: URL if also uploaded to cloud storage
}

/**
 * Convert File to Base64Attachment format for API
 */
export const fileToBase64Attachment = async (file: File): Promise<Base64Attachment> => {
  const base64Data = await fileToBase64(file);
  return {
    data: base64Data,
    mimeType: file.type,
    fileName: file.name
  };
};

/**
 * Convert multiple files to Base64Attachment array
 */
export const filesToBase64Attachments = async (files: File[]): Promise<Base64Attachment[]> => {
  return Promise.all(files.map(fileToBase64Attachment));
};