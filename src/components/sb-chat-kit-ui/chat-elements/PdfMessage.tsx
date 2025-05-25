import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  UserIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { formatFileSize } from '../../../utils/fileUtils';
import { FileMetadata } from '../../../types/chat';
import { MessageWrapper } from './MessageWrapper';
import { formatRelativeTime } from '../../../utils/dateUtils';

interface PdfMessageProps {
  fileMetadata: FileMetadata;
  content: string;
  role: string;
  createdAt: number;
}

const PdfMessage: React.FC<PdfMessageProps> = ({
  fileMetadata,
  content,
  role,
  createdAt,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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

  const handleViewPdf = () => {
    if (fileMetadata.url || fileMetadata.gcpStorageUrl) {
      window.open(fileMetadata.url || fileMetadata.gcpStorageUrl, '_blank');
    }
  };

  const isUser = role === 'user';

  // If it's not a user message, we might render it differently or not at all
  if (!isUser) {
    return (
      <div className="text-xs text-red-500">
        PdfMessage component currently only supports &apos;user&apos; role for
        this layout.
      </div>
    );
  }

  return (
    <>
      <MessageWrapper
        icon={<UserIcon className="w-5 h-5 text-gray-800" />}
        bgColor=""
        borderColor="bg-gray-100"
        role="Human"
        dateText={formatRelativeTime(createdAt)}
      >
        <div ref={containerRef} className="flex flex-col items-start w-full pt-2">
          {/* PDF Container */}
          <div className="max-w-sm md:max-w-md lg:max-w-lg rounded-2xl bg-gray-100 border border-gray-200 mb-1">
            {/* Message header with file info */}
            <div className="px-4 py-2 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">📄</span>
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
                    onClick={handleViewPdf}
                    className="p-1 rounded hover:bg-opacity-20 hover:bg-black text-gray-600"
                    title="Open PDF"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="p-1 rounded hover:bg-opacity-20 hover:bg-black text-gray-600"
                    title="View in modal"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
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

            {/* PDF preview/placeholder */}
            <div className="relative">
              {isVisible && (
                <div
                  className="w-full h-48 bg-gradient-to-br from-red-50 to-red-100 flex flex-col items-center justify-center cursor-pointer hover:from-red-100 hover:to-red-200 transition-colors duration-200"
                  onClick={handleViewPdf}
                >
                  <DocumentTextIcon className="h-16 w-16 text-red-500 mb-3" />
                  <p className="text-sm font-medium text-gray-700 text-center px-4">
                    {fileMetadata.fileName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click to open PDF
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Separate Text Message content if any */}
          {content && content.trim() && (
            <div className="mt-1 max-w-sm md:max-w-md lg:max-w-lg self-start">
              <p className="text-sm whitespace-pre-wrap">{content}</p>
            </div>
          )}
        </div>
      </MessageWrapper>

      {/* Full screen modal for viewing PDF */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative w-full h-full max-w-6xl">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <div className="w-full h-full bg-white rounded-lg overflow-hidden">
              <iframe
                src={`${
                  fileMetadata.url || fileMetadata.gcpStorageUrl
                }#view=FitH`}
                className="w-full h-full"
                title={fileMetadata.fileName}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
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

export { PdfMessage };
