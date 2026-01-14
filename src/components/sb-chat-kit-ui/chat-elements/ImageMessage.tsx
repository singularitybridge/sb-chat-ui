import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Download from 'yet-another-react-lightbox/plugins/download'; // Corrected quotes
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
  const [openLightbox, setOpenLightbox] = useState(false);
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

  // Note: handleDownload is not used by the simplified preview, but kept for lightbox if needed by older plugin versions or direct calls.
  // The current lightbox download uses saveAs.
  const handleDownload = () => {
    if (fileMetadata.url || fileMetadata.gcpStorageUrl) {
      const link = document.createElement('a');
      link.href = fileMetadata.url || fileMetadata.gcpStorageUrl || '';
      link.download = fileMetadata.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isUser = role === 'user';

  if (!isUser) {
    return (
      <div className="text-xs text-red-500">
        ImageMessage component currently only supports &#39;user&#39; role for this layout.
      </div>
    );
  }

  // This is the active, simplified return statement.
  // The older, complex return block that was previously above this has been removed.
  return (
    <>
      <MessageWrapper
        icon={<UserIcon className="w-5 h-5 text-foreground" />}
        bgColor=""
        borderColor="bg-secondary"
        role="Human"
        dateText={formatRelativeTime(createdAt)}
      >
        {/* Content for MessageWrapper: simplified image display and optional text bubble */}
        <div ref={containerRef} className="flex flex-col items-start w-full mt-1"> {/* Adjusted mt for consistency */}
          {/* Simplified Image Display */}
          {isVisible && !hasError && ( // Only show img if visible and no error
             <img
                ref={imgRef}
                src={fileMetadata.url || fileMetadata.gcpStorageUrl}
                alt={fileMetadata.fileName}
                className="max-w-xs md:max-w-sm h-auto rounded-lg my-2 border border-border cursor-pointer"
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={() => setOpenLightbox(true)}
                loading="lazy"
              />
          )}
          {isVisible && isLoading && ( // Loading state
            <div className="w-full h-48 bg-secondary flex items-center justify-center my-2 rounded-lg border border-border">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-muted-foreground"></div>
            </div>
          )}
          {isVisible && hasError && ( // Error state
            <div className="w-full h-48 bg-secondary flex flex-col items-center justify-center my-2 rounded-lg border border-border p-4 text-center">
              <span className="text-4xl mb-2">🖼️</span>
              <p className="text-sm text-muted-foreground">Failed to load image: {fileMetadata.fileName}</p>
            </div>
          )}

          {/* Separate Text Message content if any (remains the same) */}
          {content && content.trim() && (
            <div className="mt-1 max-w-sm md:max-w-md lg:max-w-lg self-start">
              <div className="px-4 py-3 bg-secondary text-foreground rounded-2xl border border-border shadow-sm">
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              </div>
            </div>
          )}
        </div>
      </MessageWrapper>

      <Lightbox
        open={openLightbox}
        close={() => setOpenLightbox(false)}
        slides={[{ 
          src: fileMetadata.url || fileMetadata.gcpStorageUrl || '', 
          alt: fileMetadata.fileName,
        }]}
        plugins={[Download]}
        download={{ 
          download: ({ slide, saveAs }) => {
            saveAs(slide.src, fileMetadata.fileName);
          }
        }}
      />
    </>
  );
};

export { ImageMessage };
