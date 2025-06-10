import React, { useState, useEffect } from 'react';
import { X, Download as LucideDownload, Search, FileSpreadsheet } from 'lucide-react'; // Added FileSpreadsheet
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import DownloadPlugin from 'yet-another-react-lightbox/plugins/download';
import { 
  formatFileSize, 
  getFileIcon, 
  isImageFile, 
  generateImageThumbnail,
  createPreviewUrl
} from '../../../utils/fileUtils';

interface FilePreviewItemInterface {
  id: string;
  file: File;
  previewUrl?: string;
  thumbnailUrl?: string;
}

interface FilePreviewProps {
  files: FilePreviewItemInterface[];
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
    const generateThumbnails = async () => {
      const newThumbnails: {[key: string]: string} = {};
      for (const fileItem of files) {
        if (isImageFile(fileItem.file.type) && !thumbnails[fileItem.id]) {
          try {
            const thumbnail = await generateImageThumbnail(fileItem.file);
            newThumbnails[fileItem.id] = thumbnail;
          } catch (error) {
            console.warn('Failed to generate thumbnail for', fileItem.file.name);
            newThumbnails[fileItem.id] = createPreviewUrl(fileItem.file);
          }
        }
      }
      if (Object.keys(newThumbnails).length > 0) {
        setThumbnails(prev => ({ ...prev, ...newThumbnails }));
      }
    };

    if (files.length > 0) {
      generateThumbnails();
    }
  }, [files]); // Removed thumbnails from dependency array

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
          onClick={() => {
            const urlsToRevoke = files.map(f => thumbnails[f.id]).filter(Boolean);
            urlsToRevoke.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
            setThumbnails({});
            files.forEach(f => onRemoveFile(f.id));
          }}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Clear all
        </button>
      </div>
      
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {files.map((fileItem) => (
          <FilePreviewItemComponent
            key={fileItem.id}
            fileItem={fileItem}
            thumbnailUrl={thumbnails[fileItem.id]}
            onRemove={() => {
              if (thumbnails[fileItem.id] && thumbnails[fileItem.id].startsWith('blob:')) {
                URL.revokeObjectURL(thumbnails[fileItem.id]);
              }
              setThumbnails(prev => {
                const newState = {...prev};
                delete newState[fileItem.id];
                return newState;
              });
              onRemoveFile(fileItem.id);
            }}
          />
        ))}
      </div>
    </div>
  );
};

interface FilePreviewItemComponentProps {
  fileItem: FilePreviewItemInterface;
  thumbnailUrl?: string;
  onRemove: () => void;
}

const FilePreviewItemComponent: React.FC<FilePreviewItemComponentProps> = ({
  fileItem,
  thumbnailUrl,
  onRemove
}) => {
  const { file } = fileItem;
  const isImage = isImageFile(file.type);
  const [openLightbox, setOpenLightbox] = useState(false);

  const handleDirectDownload = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  useEffect(() => {
    return () => {
      if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [thumbnailUrl]);

  return (
    <>
      <div className="flex items-center space-x-3 p-2 bg-white rounded border hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0 relative group">
          {isImage && thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={file.name}
              className="w-10 h-10 object-cover rounded border cursor-pointer"
              onClick={() => setOpenLightbox(true)}
            />
          ) : file.type === 'text/csv' ? (
            <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-lg">
              {getFileIcon(file.type)}
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>

        <div className="flex items-center space-x-1">
          {isImage && thumbnailUrl ? (
            <>
              <button
                onClick={() => setOpenLightbox(true)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="View image"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                onClick={handleDirectDownload}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Download image"
              >
                <LucideDownload className="h-4 w-4" />
              </button>
            </>
          ) : null } {/* Explicitly returning null if not an image with thumbnail */}
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    
      {isImage && thumbnailUrl && openLightbox && (
        <Lightbox
          open={openLightbox}
          close={() => setOpenLightbox(false)}
          slides={[{ 
            src: thumbnailUrl,
            alt: file.name,
          }]}
          plugins={[DownloadPlugin]}
          download={{ 
            download: ({ saveAs }) => {
              const originalFileUrl = URL.createObjectURL(file);
              saveAs(originalFileUrl, file.name);
              URL.revokeObjectURL(originalFileUrl);
            }
          }}
        />
      )}
    </>
  );
};

export { FilePreview };
export type { FilePreviewItemInterface as FilePreviewItem };
