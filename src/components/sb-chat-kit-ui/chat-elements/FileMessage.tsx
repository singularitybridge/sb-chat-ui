import React from 'react';
import { ArrowDownTrayIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { formatFileSize, getFileIcon, isVideoFile, isDocumentFile } from '../../../utils/fileUtils';
import { FileMetadata } from '../../../types/chat';

interface FileMessageProps {
  fileMetadata: FileMetadata;
  content: string;
  role: string;
  createdAt: number;
}

const FileMessage: React.FC<FileMessageProps> = ({
  fileMetadata,
  content,
  role,
  createdAt
}) => {
  const handleDownload = () => {
    if (fileMetadata.url || fileMetadata.gcpStorageUrl) {
      const link = document.createElement('a');
      link.href = fileMetadata.url || fileMetadata.gcpStorageUrl || '';
      link.download = fileMetadata.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || '';
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (isVideoFile(mimeType)) return 'Video';
    if (isDocumentFile(mimeType)) return 'Document';
    if (mimeType.includes('audio')) return 'Audio';
    if (mimeType.includes('text')) return 'Text';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'Archive';
    return 'File';
  };

  const getFileColor = (mimeType: string) => {
    if (isVideoFile(mimeType)) return 'bg-purple-100 border-purple-300 text-purple-700';
    if (isDocumentFile(mimeType)) return 'bg-red-100 border-red-300 text-red-700';
    if (mimeType.includes('audio')) return 'bg-green-100 border-green-300 text-green-700';
    if (mimeType.includes('text')) return 'bg-blue-100 border-blue-300 text-blue-700';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
    return 'bg-gray-100 border-gray-300 text-gray-700';
  };

  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-sm md:max-w-md ${
          isUser 
            ? 'bg-blue-500 text-white rounded-t-2xl rounded-bl-2xl' 
            : 'bg-white border border-gray-200 rounded-t-2xl rounded-br-2xl shadow-sm'
        }`}
      >
        {/* File preview area */}
        <div className="p-4">
          <div className={`
            border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer hover:bg-opacity-50
            ${isUser ? 'border-blue-300 hover:bg-blue-400' : getFileColor(fileMetadata.mimeType)}
          `}
          onClick={handleDownload}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {/* File icon */}
              <div className="relative">
                <div className={`
                  w-16 h-16 rounded-lg flex items-center justify-center text-2xl
                  ${isUser ? 'bg-blue-400' : 'bg-white shadow-sm'}
                `}>
                  {getFileIcon(fileMetadata.mimeType)}
                </div>
                
                {/* File extension badge */}
                <div className={`
                  absolute -bottom-1 -right-1 px-1.5 py-0.5 text-xs font-bold rounded
                  ${isUser ? 'bg-blue-600 text-blue-100' : 'bg-gray-600 text-white'}
                `}>
                  {getFileExtension(fileMetadata.fileName)}
                </div>
              </div>

              {/* File info */}
              <div className="space-y-1">
                <p className={`text-sm font-medium break-all ${
                  isUser ? 'text-blue-100' : 'text-gray-800'
                }`}>
                  {fileMetadata.fileName}
                </p>
                
                <div className="flex items-center justify-center space-x-2 text-xs">
                  <span className={`
                    px-2 py-1 rounded-full
                    ${isUser ? 'bg-blue-400 text-blue-100' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {getFileTypeLabel(fileMetadata.mimeType)}
                  </span>
                  <span className={isUser ? 'text-blue-200' : 'text-gray-500'}>
                    {formatFileSize(fileMetadata.fileSize)}
                  </span>
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                  ${isUser 
                    ? 'bg-blue-400 hover:bg-blue-300 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Download</span>
              </button>
            </div>
          </div>
        </div>

        {/* Message content if any */}
        {content && content.trim() && (
          <div className="px-4 pb-3">
            <p className={`text-sm ${
              isUser ? 'text-white' : 'text-gray-800'
            }`}>
              {content}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div className={`px-4 py-2 text-xs ${
          isUser ? 'text-blue-200' : 'text-gray-500'
        }`}>
          {formatDate(createdAt)}
        </div>
      </div>
    </div>
  );
};

export { FileMessage };
