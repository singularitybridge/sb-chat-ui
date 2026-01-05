import React, { useState } from 'react';
import { Download, FileText, Eye, X, Maximize2 } from 'lucide-react';
import { formatFileSize } from '../../../utils/fileUtils';
import { FileMetadata } from '../../../types/chat';

interface PdfMessageProps {
  fileMetadata: FileMetadata;
  content: string; // Keep for prop consistency, but won't be rendered separately
  role: string;
  createdAt: number;
}

const PdfMessage: React.FC<PdfMessageProps> = ({
  fileMetadata,
  content, // Not rendered separately anymore
  role,
  createdAt,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
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

  const handleViewPdf = () => {
    if (fileMetadata.url || fileMetadata.gcpStorageUrl) {
      window.open(fileMetadata.url || fileMetadata.gcpStorageUrl, '_blank');
    }
  };

  const isUser = role === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-sm ${
          isUser
            ? 'bg-white border border-gray-200 text-gray-800 rounded-bl-2xl'
            : 'bg-white border border-gray-200 text-gray-800 rounded-br-2xl'
        }`}
      >
        <div className="p-3"> {/* Reduced padding */}
          <div
            className={`
            rounded-lg p-3 sm:p-4 transition-colors  /* Reduced padding */
            ${isUser ? 'bg-red-50' : 'bg-red-50'} 
          `}
          >
            <div className="flex flex-col space-y-2"> {/* Reduced space-y */}
              {/* File Name and Info Row */}
              <div className="flex items-center justify-between">
                <div className="grow space-y-0.5">
                  <p className={`text-sm font-medium break-all ${isUser ? 'text-gray-800' : 'text-gray-800'}`}>
                    {fileMetadata.fileName}
                  </p>
                  <div className="flex items-center space-x-1.5 text-xs">
                    <FileText className={`w-4 h-4 ${isUser ? 'text-red-600' : 'text-red-600'}`} strokeWidth={1.5} />
                    <span className={`
                      px-1.5 py-0.5 rounded-full font-medium text-xs
                      ${isUser ? 'bg-red-100 text-red-700' : 'bg-red-100 text-red-700'}
                    `}>
                      pdf
                    </span>
                    <span className={isUser ? 'text-gray-500' : 'text-gray-500'}>
                      {formatFileSize(fileMetadata.fileSize)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-2 shrink-0">
                  <button
                    onClick={handleViewPdf}
                    title="Open PDF in new tab"
                    className={`p-1.5 rounded-md transition-colors ${isUser ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700' : 'text-red-500 hover:bg-red-100 hover:text-red-700'}`}
                  >
                    <Eye className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setIsExpanded(true)}
                    title="View PDF in modal"
                    className={`p-1.5 rounded-md transition-colors ${isUser ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700' : 'text-red-500 hover:bg-red-100 hover:text-red-700'}`}
                  >
                    <Maximize2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={handleDownload}
                    title="Download PDF"
                    className={`p-1.5 rounded-md transition-colors ${isUser ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-700' : 'text-red-500 hover:bg-red-100 hover:text-red-700'}`}
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* PDF preview/placeholder removed */}
            </div>
          </div>
        </div>

        {/* Separate content display removed */}
        <div className={`px-4 pt-0 pb-2 text-xs ${isUser ? 'text-gray-400' : 'text-gray-500'}`}> {/* Adjusted padding for timestamp */}
          {formatDate(createdAt)}
        </div>
      </div>

      {/* Full screen modal for viewing PDF */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="relative w-full h-full max-w-4xl">
            <button
              onClick={() => setIsExpanded(false)}
              className="absolute -top-2 -right-2 md:-top-4 md:-right-10 text-white bg-black bg-opacity-50 rounded-full p-1.5 hover:bg-opacity-75 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden shadow-2xl">
              <iframe
                src={`${
                  fileMetadata.url || fileMetadata.gcpStorageUrl
                }#view=FitH`}
                className="w-full h-full border-0"
                title={fileMetadata.fileName}
              />
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1.5 rounded-md text-xs shadow-lg">
              <p className="font-medium truncate max-w-xs">{fileMetadata.fileName}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { PdfMessage };
