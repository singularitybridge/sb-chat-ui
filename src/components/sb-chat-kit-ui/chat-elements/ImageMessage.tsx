import React, { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatFileSize } from '../../../utils/fileUtils';
import { FileMetadata } from '../../../types/chat';

interface ImageMessageProps {
  fileMetadata: FileMetadata;
  content: string;
  role: string;
  createdAt: number;
}

const ImageMessage: React.FC<ImageMessageProps> = ({
  fileMetadata,
  content,
  role,
  createdAt
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

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

  const isUser = role === 'user';

  return (
    <div
      ref={containerRef}
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div 
        className={`max-w-sm md:max-w-md lg:max-w-lg ${
          isUser 
            ? 'bg-blue-500 text-white rounded-t-2xl rounded-bl-2xl' 
            : 'bg-white border border-gray-200 rounded-t-2xl rounded-br-2xl shadow-sm'
        }`}
      >
        {/* Message header with file info */}
        <div className={`px-4 py-2 border-b ${
          isUser ? 'border-blue-400' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm">🖼️</span>
              <div>
                <p className={`text-sm font-medium ${
                  isUser ? 'text-blue-100' : 'text-gray-800'
                }`}>
                  {fileMetadata.fileName}
                </p>
                <p className={`text-xs ${
                  isUser ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {formatFileSize(fileMetadata.fileSize)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsExpanded(true)}
                className={`p-1 rounded hover:bg-opacity-20 hover:bg-black ${
                  isUser ? 'text-blue-100' : 'text-gray-500'
                }`}
                title="View full size"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
              <button
                onClick={handleDownload}
                className={`p-1 rounded hover:bg-opacity-20 hover:bg-black ${
                  isUser ? 'text-blue-100' : 'text-gray-500'
                }`}
                title="Download"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Image preview */}
        <div className="relative">
          {isVisible && (
            <>
              {isLoading && (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                </div>
              )}
              
              {hasError ? (
                <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-2">🖼️</span>
                  <p className="text-sm text-gray-500">Failed to load image</p>
                </div>
              ) : (
                <img
                  ref={imgRef}
                  src={fileMetadata.url || fileMetadata.gcpStorageUrl}
                  alt={fileMetadata.fileName}
                  className={`w-full h-auto max-h-96 object-cover cursor-pointer transition-opacity duration-200 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  onClick={() => setIsExpanded(true)}
                  loading="lazy"
                />
              )}
            </>
          )}
        </div>

        {/* Message content if any */}
        {content && content.trim() && (
          <div className="px-4 py-3">
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

      {/* Full screen modal */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <img
              src={fileMetadata.url || fileMetadata.gcpStorageUrl}
              alt={fileMetadata.fileName}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <p className="text-sm font-medium">{fileMetadata.fileName}</p>
              <p className="text-xs text-gray-300">
                {formatFileSize(fileMetadata.fileSize)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ImageMessage };
