import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { formatFileSize } from '../../../utils/fileUtils';
import { FileMetadata } from '../../../types/chat';
import { MessageWrapper } from './MessageWrapper'; // Import MessageWrapper
import { formatRelativeTime } from '../../../utils/dateUtils'; // For timestamp

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
  createdAt,
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
      minute: '2-digit',
    });
  };

  const isUser = role === 'user';

  // If it's not a user message, we might render it differently or not at all,
  // but the feedback is specifically about user image messages.
  // For now, this component is primarily designed for user image uploads.
  if (!isUser) {
    // Fallback for non-user roles, or could return null/different component
    return (
      <div className="text-xs text-red-500">
        ImageMessage component currently only supports &apos;user&apos; role for
        this layout.
      </div>
    );
  }

  return (
    <MessageWrapper
      icon={<UserIcon className="w-5 h-5 text-gray-800" />}
      bgColor="" // Wrapper itself has no specific bg for user messages
      borderColor="bg-gray-100" // For the icon border
      role="Human" // Consistent role display
      dateText={formatRelativeTime(createdAt)} // Use relative time for consistency
    >
      <div ref={containerRef} className="flex flex-col items-start w-full mt-2">
        {' '}
        {/* Content within MessageWrapper */}
        {/* Image Container - This div itself becomes the main frame for the image and its overlays */}
        <div className="relative group max-w-sm md:max-w-md lg:max-w-lg rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden">
          {/* Image preview */}
          {isVisible && (
            <>
              {isLoading && (
                <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                </div>
              )}
              {hasError ? (
                <div className="w-full h-48 bg-gray-50 flex flex-col items-center justify-center">
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

          {/* Overlay for Title and File Size - at the bottom of the image */}
          {!isLoading && !hasError && isVisible && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-800 bg-opacity-50 text-white flex flex-col"> {/* Use flex-col for structure */}
              {/* Wrapper for filename to enforce truncation context */}
              <div className="min-w-0 overflow-hidden"> {/* Ensures parent constrains width for truncate */}
                <p className="text-sm font-medium truncate whitespace-nowrap"> {/* Added whitespace-nowrap */}
                  {fileMetadata.fileName}
                </p>
              </div>
              <p className="text-xs">
                {formatFileSize(fileMetadata.fileSize)}
              </p>
            </div>
          )}

          {/* Overlay buttons - visible on group hover, top-right */}
          {!isLoading && !hasError && isVisible && (
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                className="p-1 rounded bg-black bg-opacity-40 text-white hover:bg-opacity-60"
                title="View full size"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                className="p-1 rounded bg-black bg-opacity-40 text-white hover:bg-opacity-60"
                title="Download"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        {/* Separate Text Message content if any, styled as an AI assistant bubble */}
        {content && content.trim() && (
          <div className="mt-4 max-w-sm md:max-w-md lg:max-w-lg self-start">
            <p className="text-sm whitespace-pre-wrap">{content}</p>

            {/* Timestamp for text part is handled by MessageWrapper */}
          </div>
        )}
        {/* If no content, MessageWrapper's dateText will cover the timestamp for the image message */}
      </div>
    </MessageWrapper>
  ); // This was the end of the first return block for the MessageWrapper's children.

  // The main return for the component when isUser is true should be a single fragment
  // containing both the MessageWrapper and the modal.
  // The previous attempt incorrectly had two separate return statements for the main component body.

  // Corrected structure:
  return (
    <>
      <MessageWrapper
        icon={<UserIcon className="w-5 h-5 text-gray-800" />}
        bgColor=""
        borderColor="bg-gray-100"
        role="Human"
        dateText={formatRelativeTime(createdAt)}
      >
        {/* Content for MessageWrapper: image container and optional text bubble */}
        <div ref={containerRef} className="flex flex-col items-start w-full">
          {/* Image Container */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg rounded-2xl bg-gray-100 border border-gray-200 mb-1">
            {/* Message header with file info */}
            <div className="px-4 py-2 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">🖼️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {fileMetadata.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(fileMetadata.fileSize)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="p-1 rounded hover:bg-opacity-20 hover:bg-black text-gray-600"
                    title="View full size"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1 rounded hover:bg-opacity-20 hover:bg-black text-gray-600"
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
                    <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
                    </div>
                  )}
                  {hasError ? (
                    <div className="w-full h-48 bg-gray-50 flex flex-col items-center justify-center">
                      <span className="text-4xl mb-2">🖼️</span>
                      <p className="text-sm text-gray-500">
                        Failed to load image
                      </p>
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
          </div>

          {/* Separate Text Message content if any */}
          {content && content.trim() && (
            // Style this text part like an AI Assistant bubble, but left-aligned.
            // It should have a light background, dark text, and appropriate padding & rounding.
            <div className="mt-1 max-w-sm md:max-w-md lg:max-w-lg self-start">
              <div className="px-4 py-3 bg-gray-100 text-gray-800 rounded-2xl border border-gray-200 shadow-sm">
                {/* Using rounded-2xl for all corners for a neutral bubble, or could use user-specific rounding like rounded-t-2xl rounded-bl-2xl */}
                {/* Added border and shadow-sm to mimic assistant bubble style more closely */}
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              </div>
            </div>
          )}
        </div>
      </MessageWrapper>

      {/* Full screen modal for viewing image, remains a sibling to MessageWrapper, within the fragment */}
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
    </>
  );
};

export { ImageMessage };
