import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { AudioRecorder } from '../../sb-core-ui-kit/AudioRecorder';
import { FilePreview, FilePreviewItem } from './FilePreview';
import { useScreenShareStore } from '../../../store/useScreenShareStore';
import { 
  validateFile, 
  cleanupPreviewUrls 
} from '../../../utils/fileUtils';
import { fileToBase64Attachment, Base64Attachment } from '../../../utils/base64Utils';
import { uploadContentFile } from '../../../services/api/contentFileService';
import { useUploadPreferencesStore } from '../../../store/useUploadPreferencesStore';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface ChatInputProps {
  onSendMessage: (message: string, attachments?: Base64Attachment[]) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreviewItem[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploadErrors, setUploadErrors] = useState<{[key: string]: string}>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Get screen share state
  const { isActive: isScreenSharing, captureScreenshot, sessionId: screenShareSessionId } = useScreenShareStore();
  
  // Get upload preferences
  const { saveToCloud, setSaveToCloud } = useUploadPreferencesStore();

  const handleSubmitMessage = async (messageText: string) => {
    if (!messageText.trim() && selectedFiles.length === 0 && !isScreenSharing) return;

    // Skip automatic screenshot in workspace - it handles its own screenshots
    const isInWorkspace = window.location.pathname.includes('/screenshare/');
    
    // If screen sharing is active, capture and attach current screenshot (but not in workspace)
    if (isScreenSharing && selectedFiles.length === 0 && !isInWorkspace) {
      // Screen sharing active, capturing screenshot
      
      try {
        const screenshot = await captureScreenshot();
        if (screenshot) {
          // Create a file from the screenshot blob with session ID
          const fileName = screenShareSessionId 
            ? `${screenShareSessionId}-screenshare.png`
            : `screen-${Date.now()}.png`;
          
          const screenshotFile = new File(
            [screenshot], 
            fileName, 
            { type: 'image/png' }
          );
          
          // Process screenshot
          setIsUploading(true);
          try {
            const attachment = await fileToBase64Attachment(screenshotFile);
            
            // If saveToCloud is enabled, also upload to cloud storage
            if (saveToCloud) {
              try {
                const formData = new FormData();
                formData.append('file', screenshotFile);
                formData.append('title', screenshotFile.name);
                
                const uploadResponse = await uploadContentFile(formData);
                
                if (uploadResponse?.data?.gcpStorageUrl) {
                  (attachment as any).cloudUrl = uploadResponse.data.gcpStorageUrl;
                  // Screenshot uploaded to cloud
                }
              } catch (uploadError) {
                console.error('Cloud upload failed (continuing with base64):', uploadError);
              }
            }
            
            setMessage('');
            onSendMessage(messageText || 'Sharing my screen', [attachment]);
          } catch (error) {
            console.error('Error processing screenshot:', error);
          } finally {
            setIsUploading(false);
          }
        }
      } catch (error) {
        console.error('Failed to capture screenshot:', error);
        // Still send the message even if screenshot fails
        setMessage('');
        onSendMessage(messageText);
      }
    } else if (selectedFiles.length > 0) {
      // If there are manually selected files, convert them to base64
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
      const attachments: Base64Attachment[] = [];
      
      // Process all files
      for (const fileItem of selectedFiles) {
        try {
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }));
          
          // Validate file before processing
          const validation = validateFile(fileItem.file);
          if (!validation.isValid) {
            setUploadErrors(prev => ({ ...prev, [fileItem.id]: validation.error || 'Invalid file' }));
            continue;
          }

          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 30 }));
          
          // Convert file to base64 attachment
          const attachment = await fileToBase64Attachment(fileItem.file);
          
          // If saveToCloud is enabled, also upload to cloud storage
          if (saveToCloud) {
            try {
              setUploadProgress(prev => ({ ...prev, [fileItem.id]: 60 }));
              
              const formData = new FormData();
              formData.append('file', fileItem.file);
              formData.append('title', fileItem.file.name);
              
              const uploadResponse = await uploadContentFile(formData);
              
              if (uploadResponse?.data?.gcpStorageUrl) {
                // Add the cloud URL to the attachment for reference
                (attachment as any).cloudUrl = uploadResponse.data.gcpStorageUrl;
                  // File uploaded to cloud
              }
            } catch (uploadError) {
              console.error('Cloud upload failed (continuing with base64):', uploadError);
              // Continue with base64 even if cloud upload fails
            }
          }
          
          attachments.push(attachment);
          setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }));
        } catch (error) {
          console.error('Error processing file:', fileItem.file.name, error);
          setUploadErrors(prev => ({ 
            ...prev, 
            [fileItem.id]: 'Failed to process file. Please try again.' 
          }));
        }
      }
      
      // Send message with all attachments at once
      if (attachments.length > 0) {
        onSendMessage(messageText || `Shared ${attachments.length} file(s)`, attachments);
      }
      
      // Clear the form after successful processing
      setMessage('');
      clearSelectedFiles();
    } catch (error) {
      console.error('Error in file processing:', error);
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
    addFiles(files);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addFiles = (files: File[]) => {
    const newFileItems: FilePreviewItem[] = [];
    
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
      
      newFileItems.push(fileItem);
    });
    
    if (newFileItems.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFileItems]);
    }
  };

  const handleScreenCapture = async (blob: Blob, metadata?: any) => {
    // Create a File from the Blob with session ID
    const fileName = screenShareSessionId 
      ? `${screenShareSessionId}-screenshare.png`
      : `screenshot-${Date.now()}.png`;
    
    const file = new File([blob], fileName, { type: 'image/png' });
    // Handle screen capture
    
    // Auto-send screen captures immediately
    setIsUploading(true);
    
    try {
      // Convert file to base64 attachment
      const attachment = await fileToBase64Attachment(file);
      
      // If saveToCloud is enabled, also upload to cloud storage
      if (saveToCloud) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name);
          
          const uploadResponse = await uploadContentFile(formData);
          
          if (uploadResponse?.data?.gcpStorageUrl) {
            (attachment as any).cloudUrl = uploadResponse.data.gcpStorageUrl;
            // Screen capture uploaded to cloud
          }
        } catch (uploadError) {
          console.error('Cloud upload failed (continuing with base64):', uploadError);
        }
      }
      
      const message = `Screen capture #${metadata?.captureNumber || 1} at ${new Date().toLocaleTimeString()}`;
      
      // Sending screen capture message with attachment
      onSendMessage(message, [attachment]);
    } catch (error) {
      console.error('Error processing screen capture:', error);
    } finally {
      setIsUploading(false);
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

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if dragging files
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const hasFiles = Array.from(e.dataTransfer.items).some(item => item.kind === 'file');
      if (hasFiles) {
        setDragCounter(prev => prev + 1);
        setIsDragging(true);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    setDragCounter(0);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const files: File[] = [];
    
    items.forEach(item => {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    });
    
    if (files.length > 0) {
      e.preventDefault();
      addFiles(files);
    }
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
    <div 
      ref={containerRef}
      className="flex flex-col w-full space-y-2 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-500 rounded-2xl flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg px-6 py-4">
              <div className="flex flex-col items-center space-y-2">
                <PaperClipIcon className="h-10 w-10 text-blue-500 animate-pulse" />
                <p className="text-lg font-medium text-gray-800">Drop files here</p>
                <p className="text-sm text-gray-500">Release to add files to your message</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Screen sharing indicator */}
      {isScreenSharing && (
        <div className="mx-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="animate-pulse h-2 w-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-blue-700">
              {t('ChatContainer.screenShare.active', 'Screen sharing active - Current screen will be attached to your message')}
            </span>
          </div>
        </div>
      )}
      
      {/* File preview area */}
      {selectedFiles.length > 0 && (
        <div className="mx-1 space-y-2">
          <FilePreview
            files={selectedFiles}
            onRemoveFile={handleRemoveFile}
          />
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedFiles.length} {selectedFiles.length === 1 ? 'file' : 'files'} selected
              </span>
              <button
                onClick={clearSelectedFiles}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
            <button
              onClick={() => setSaveToCloud(!saveToCloud)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                saveToCloud 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={saveToCloud ? 'Files will be saved to cloud' : 'Files will be sent directly'}
            >
              <CloudArrowUpIcon className="h-4 w-4" />
              <span>{saveToCloud ? 'Cloud: ON' : 'Cloud: OFF'}</span>
            </button>
          </div>
        </div>
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
                : t('ChatContainer.input.placeholder', 'Type your message')
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmitMessage(message);
                e.preventDefault();
              }
            }}
            onPaste={handlePaste}
            rows={1}
            disabled={isUploading}
          />
          <div className="flex flex-col justify-end space-x-2 rtl:space-x-reverse">
            <div className="flex space-x-2">
              <AudioRecorder
                onTranscriptionComplete={handleTranscriptionComplete}
              />
              {/* Basic screen share - sends screenshots immediately */}
              {/* <ScreenShare
                onScreenCapture={handleScreenCapture}
              /> */}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelection}
                className="hidden"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar,.csv,.json,.mp3,.xls,.xlsx"
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
