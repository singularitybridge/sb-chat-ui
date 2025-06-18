import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { AudioRecorder } from '../../sb-core-ui-kit/AudioRecorder';
import { uploadContentFile } from '../../../services/api/contentFileService';
import { FilePreview, FilePreviewItem } from './FilePreview';
import { 
  validateFile, 
  createFileMetadata, 
  cleanupPreviewUrls 
} from '../../../utils/fileUtils';

interface ChatInputProps {
  onSendMessage: (message: string, fileMetadata?: import('../../../types/chat').FileMetadata) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreviewItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadErrors, setUploadErrors] = useState<{[key: string]: string}>({});
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmitMessage = async (messageText: string) => {
    if (!messageText.trim() && selectedFiles.length === 0) return;

    // If there are files, upload them first
    if (selectedFiles.length > 0) {
      await handleFilesUpload(messageText);
    } else {
      // Send text message only
      setMessage('');
      onSendMessage(messageText);
    }
  };

  const handleFilesUpload = async (messageText: string) => {
    setIsUploading(true);
    
    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const fileItem of selectedFiles) {
        try {
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));
          
          // Validate file before upload
          const validation = validateFile(fileItem.file);
          if (!validation.isValid) {
            setUploadErrors(prev => ({ ...prev, [fileItem.id]: validation.error || 'Invalid file' }));
            continue;
          }

          const formData = new FormData();
          formData.append('file', fileItem.file);
          formData.append('title', fileItem.file.name);

          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 50 }));
          
          const response = await uploadContentFile(formData);
          
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }));
          
          if (response && response.data) {
            // Create file metadata and send as message
            const fileMetadata = createFileMetadata(fileItem.file, response);
            onSendMessage(messageText || `Shared ${fileItem.file.name}`, fileMetadata);
          } else {
            setUploadErrors(prev => ({ 
              ...prev, 
              [fileItem.id]: 'Upload succeeded but received unexpected response' 
            }));
          }
        } catch (error) {
          console.error('Error uploading file:', fileItem.file.name, error);
          setUploadErrors(prev => ({ 
            ...prev, 
            [fileItem.id]: 'Failed to upload file. Please try again.' 
          }));
        }
      }
      
      // Clear the form after successful uploads
      setMessage('');
      clearSelectedFiles();
    } catch (error) {
      console.error('Error in file upload process:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress({});
      setTimeout(() => setUploadErrors({}), 5000); // Clear errors after 5 seconds
    }
  };

  const handleTranscriptionComplete = (transcription: string) => {
    setMessage(transcription);
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const validation = validateFile(file);
      if (!validation.isValid) {
        alert(`${file.name}: ${validation.error}`);
        return;
      }

      const fileItem: FilePreviewItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file
      };
      
      setSelectedFiles(prev => [...prev, fileItem]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      // Clean up URLs for removed file
      const removedFile = prev.find(f => f.id === fileId);
      if (removedFile?.previewUrl) {
        cleanupPreviewUrls([removedFile.previewUrl]);
      }
      return updatedFiles;
    });
    
    // Clear any errors for this file
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileId];
      return newErrors;
    });
  };

  const clearSelectedFiles = () => {
    // Clean up preview URLs
    const urlsToCleanup = selectedFiles
      .map(f => f.previewUrl)
      .filter(Boolean) as string[];
    cleanupPreviewUrls(urlsToCleanup);
    
    setSelectedFiles([]);
    setUploadErrors({});
    setUploadProgress({});
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      clearSelectedFiles();
    };
  }, []);

  const hasContent = message.trim() || selectedFiles.length > 0;

  return (
    <div className="flex flex-col w-full space-y-2">
      {/* File preview area */}
      {selectedFiles.length > 0 && (
        <FilePreview
          files={selectedFiles}
          onRemoveFile={handleRemoveFile}
          className="mx-1"
        />
      )}

      {/* Upload errors */}
      {Object.keys(uploadErrors).length > 0 && (
        <div className="mx-1 p-2 bg-red-50 border border-red-200 rounded-lg">
          {Object.entries(uploadErrors).map(([fileId, error]) => {
            const file = selectedFiles.find(f => f.id === fileId);
            return (
              <p key={fileId} className="text-sm text-red-600">
                {file?.file.name}: {error}
              </p>
            );
          })}
        </div>
      )}

      {/* Main input area */}
      <div className="flex items-end w-full">
        <div className="flex flex-row bg-neutral-200 items-end rtl:space-x-reverse w-full space-x-2 rounded-2xl px-3 py-2">
          <textarea
            ref={textareaRef}
            className="flex-grow px-2 min-h-6 bg-neutral-200 resize-y max-h-40 overflow-auto border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-500 focus:outline-none"
            placeholder={
              selectedFiles.length > 0 
                ? t('ChatContainer.input.withFiles', 'Add a caption (optional)...') 
                : t('ChatContainer.input')
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmitMessage(message);
                e.preventDefault();
              }
            }}
            rows={1}
            disabled={isUploading}
          />
          <div className="flex flex-col justify-end space-x-2 rtl:space-x-reverse">
            <div className="flex space-x-2">
              <AudioRecorder
                onTranscriptionComplete={handleTranscriptionComplete}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelection}
                className="hidden"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar,.csv,.json,.mp3,audio/mpeg"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center h-7 w-7 relative"
                disabled={isUploading}
                title="Attach files"
              >
                <PaperClipIcon className="h-5 w-5 text-gray-600" />
                {selectedFiles.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {selectedFiles.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleSubmitMessage(message)}
                className="inline-flex items-center justify-center disabled:pointer-events-none disabled:opacity-50 h-7 w-7"
                disabled={isUploading || !hasContent}
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <PaperAirplaneIcon className="h-5 w-5 text-gray-600 rtl:-scale-x-100" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ChatInput };
