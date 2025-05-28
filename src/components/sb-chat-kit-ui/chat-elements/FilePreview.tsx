import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { 
  formatFileSize, 
  getFileIcon, 
  isImageFile, 
  generateImageThumbnail,
  createPreviewUrl
} from '../../../utils/fileUtils';

interface FilePreviewItem {
  id: string;
  file: File;
  previewUrl?: string;
  thumbnailUrl?: string;
}

interface FilePreviewProps {
  files: FilePreviewItem[];
  onRemoveFile: (id: string) => void;
  className?: string;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  files,
  onRemoveFile,
  className = ''
}) => {
  const [thumbnails, setThumbnails] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Generate thumbnails for image files
    const generateThumbnails = async () => {
      const newThumbnails: {[key: string]: string} = {};
      
      for (const fileItem of files) {
        if (isImageFile(fileItem.file.type)) {
          try {
            const thumbnail = await generateImageThumbnail(fileItem.file);
            newThumbnails[fileItem.id] = thumbnail;
          } catch (error) {
            console.warn('Failed to generate thumbnail for', fileItem.file.name);
            // Fallback to original file preview
            newThumbnails[fileItem.id] = createPreviewUrl(fileItem.file);
          }
        }
      }
      
      setThumbnails(newThumbnails);
    };

    if (files.length > 0) {
      generateThumbnails();
    }

    // Cleanup function to revoke URLs
    return () => {
      Object.values(thumbnails).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {files.length} file{files.length > 1 ? 's' : ''} selected
        </span>
        <button
          onClick={() => files.forEach(f => onRemoveFile(f.id))}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {files.map((fileItem) => (
          <FilePreviewItem
            key={fileItem.id}
            fileItem={fileItem}
            thumbnailUrl={thumbnails[fileItem.id]}
            onRemove={() => onRemoveFile(fileItem.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface FilePreviewItemProps {
  fileItem: FilePreviewItem;
  thumbnailUrl?: string;
  onRemove: () => void;
}

const FilePreviewItem: React.FC<FilePreviewItemProps> = ({
  fileItem,
  thumbnailUrl,
  onRemove
}) => {
  const { file } = fileItem;
  const isImage = isImageFile(file.type);

  return (
    <div className="flex items-center space-x-3 p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
      {/* File preview/icon */}
      <div className="flex-shrink-0">
        {isImage && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={file.name}
            className="w-10 h-10 object-cover rounded border"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-lg">
            {getFileIcon(file.type)}
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">
          {formatFileSize(file.size)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove file"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export { FilePreview };
export type { FilePreviewItem };
