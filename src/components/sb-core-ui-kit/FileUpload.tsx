// src/components/FileUpload.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isUploading }) => {

  const { t } = useTranslation();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && !isUploading) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload, isUploading]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: isUploading
  });

  return (
    <div 
      {...getRootProps()} 
      className={`border border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer transition duration-300 ${
        isUploading ? 'bg-gray-50' : 'hover:border-blue-500'
      }`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <p className="text-slate-500 text-sm animate-pulse duration-75">
          {t('EditAssistantPage.uploading')}
          </p>
      ) : isDragActive ? (
        <p className="text-slate-500 text-sm">{t('EditAssistantPage.dropFile')}</p>
      ) : (
        <p className='text-sm text-slate-500'>{t('EditAssistantPage.dragFileHere')}</p>
      )}
    </div>
  );
};

export default FileUpload;