import React from 'react';
import { Download, File, FileJson, FileArchive, FileAudio, FileVideo, FileImage } from 'lucide-react';
import { formatFileSize, isVideoFile, isImageFile } from '../../../utils/fileUtils'; // Removed isDocumentFile as PDF/CSV have own components
import { FileMetadata } from '../../../types/chat';

interface FileMessageProps {
  fileMetadata: FileMetadata;
  content: string; // Keep for prop consistency, but won't be rendered separately
  role: string;
  createdAt: number;
}

const FileMessage: React.FC<FileMessageProps> = ({
  fileMetadata,
  content: _content, // Not rendered separately anymore
  role,
  createdAt,
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
      minute: '2-digit',
    });
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const isUser = role === 'user';
  const extension = getFileExtension(fileMetadata.fileName);

  let fileTypeIcon = <File className={`w-4 h-4 ${isUser ? 'text-muted-foreground' : 'text-muted-foreground'}`} strokeWidth={1.5} />;
  let fileTypeLabel = extension || 'file';
  let innerBgColor = isUser ? 'bg-secondary' : 'bg-secondary';
  let badgeBgColor = isUser ? 'bg-accent text-foreground' : 'bg-accent text-foreground';
  let iconColor = isUser ? 'text-muted-foreground' : 'text-muted-foreground';
  // Large icon and clickToViewText are removed as preview area is gone

  if (fileMetadata.mimeType === 'application/json') {
    fileTypeIcon = <FileJson className={`w-4 h-4 ${isUser ? 'text-indigo-600' : 'text-indigo-600'}`} strokeWidth={1.5} />;
    fileTypeLabel = 'json';
    innerBgColor = isUser ? 'bg-indigo-50' : 'bg-indigo-50';
    badgeBgColor = isUser ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-100 text-indigo-700';
    iconColor = isUser ? 'text-indigo-600' : 'text-indigo-600';
  } else if (isImageFile(fileMetadata.mimeType)) {
    fileTypeIcon = <FileImage className={`w-4 h-4 ${isUser ? 'text-pink-600' : 'text-pink-600'}`} strokeWidth={1.5} />;
    fileTypeLabel = extension || 'image';
    innerBgColor = isUser ? 'bg-pink-50' : 'bg-pink-50';
    badgeBgColor = isUser ? 'bg-pink-100 text-pink-700' : 'bg-pink-100 text-pink-700';
    iconColor = isUser ? 'text-pink-600' : 'text-pink-600';
  } else if (isVideoFile(fileMetadata.mimeType)) {
    fileTypeIcon = <FileVideo className={`w-4 h-4 ${isUser ? 'text-purple-600' : 'text-purple-600'}`} strokeWidth={1.5} />;
    fileTypeLabel = extension || 'video';
    innerBgColor = isUser ? 'bg-purple-50' : 'bg-purple-50';
    badgeBgColor = isUser ? 'bg-purple-100 text-purple-700' : 'bg-purple-100 text-purple-700';
    iconColor = isUser ? 'text-purple-600' : 'text-purple-600';
  } else if (fileMetadata.mimeType.includes('audio')) {
    fileTypeIcon = <FileAudio className={`w-4 h-4 ${isUser ? 'text-teal-600' : 'text-teal-600'}`} strokeWidth={1.5} />;
    fileTypeLabel = extension || 'audio';
    innerBgColor = isUser ? 'bg-teal-50' : 'bg-teal-50';
    badgeBgColor = isUser ? 'bg-teal-100 text-teal-700' : 'bg-teal-100 text-teal-700';
    iconColor = isUser ? 'text-teal-600' : 'text-teal-600';
  } else if (fileMetadata.mimeType.includes('zip') || fileMetadata.mimeType.includes('rar')) {
    fileTypeIcon = <FileArchive className={`w-4 h-4 ${isUser ? 'text-yellow-600' : 'text-yellow-600'}`} strokeWidth={1.5} />;
    fileTypeLabel = extension || 'archive';
    innerBgColor = isUser ? 'bg-yellow-50' : 'bg-yellow-50';
    badgeBgColor = isUser ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-100 text-yellow-700';
    iconColor = isUser ? 'text-yellow-600' : 'text-yellow-600';
  }
  // PDF and CSV are handled by their own components

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-md md:max-w-lg lg:max-w-xl rounded-2xl shadow-sm ${
          isUser
            ? 'bg-background border border-border text-foreground rounded-bl-2xl'
            : 'bg-background border border-border text-foreground rounded-br-2xl'
        }`}
      >
        <div className="p-3"> {/* Reduced padding */}
          <div
            className={`
            rounded-lg p-3 sm:p-4 transition-colors 
            ${innerBgColor}
          `}
          >
            <div className="flex flex-col space-y-2"> {/* Reduced space-y */}
              {/* File Name and Info Row */}
              <div className="flex items-center justify-between">
                <div className="grow space-y-0.5">
                  <p className={`text-sm font-medium break-all ${isUser ? 'text-foreground' : 'text-foreground'}`}>
                    {fileMetadata.fileName}
                  </p>
                  <div className="flex items-center space-x-1.5 text-xs">
                    {fileTypeIcon}
                    <span className={`
                      px-1.5 py-0.5 rounded-full font-medium text-xs
                      ${badgeBgColor}
                    `}>
                      {fileTypeLabel}
                    </span>
                    <span className="text-muted-foreground">
                      {formatFileSize(fileMetadata.fileSize)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  title={`Download ${fileTypeLabel}`}
                  className={`
                    p-1.5 rounded-md transition-colors ml-2 shrink-0
                    ${isUser ? 'text-muted-foreground hover:bg-accent hover:text-foreground' : `${iconColor.replace('text-', 'hover:bg-').replace('-600', '-100').replace('-500', '-100')} ${iconColor.replace('text-', 'hover:text-').replace('-600', '-700').replace('-500', '-700')}`}
                  `}
                >
                  <Download className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              {/* Preview section removed */}
            </div>
          </div>
        </div>

        {/* Separate content display removed */}
        <div className={`px-4 pt-0 pb-2 text-xs ${isUser ? 'text-muted-foreground' : 'text-muted-foreground'}`}> {/* Adjusted padding for timestamp */}
          {formatDate(createdAt)}
        </div>
      </div>
    </div>
  );
};

export { FileMessage };
