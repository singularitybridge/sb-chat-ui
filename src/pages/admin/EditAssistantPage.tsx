// src/pages/admin/EditAssistantPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAssistant } from '../../store/models/Assistant';
import { withPage } from '../../components/admin/HOC/withPage';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  DropdownFieldConfig,
} from '../../components/DynamicForm';
import { toJS } from 'mobx';
import { assistantFieldConfigs } from '../../store/fieldConfigs/assistantFieldConfigs';
import {
  uploadFile,
  listAssistantFiles,
  deleteFile,
} from '../../services/api/fileService';
import FileUpload from '../../components/sb-core-ui-kit/FileUpload';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { FileText, Trash2 as TrashIcon } from 'lucide-react';
import { IconButton } from '../../components/admin/IconButton';
import { useTranslation } from 'react-i18next';
import AvatarSelector from '../../components/AvatarSelector';

interface UploadedFile {
  fileId: string;
  openaiFileId: string;
  filename: string;
}

const EditAssistantView: React.FC = observer(() => {

  const { t } = useTranslation();
  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const assistant = key ? rootStore.getAssistantById(key) : null;
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  useEffect(() => {
    if (key) {
      fetchAssistantFiles();
    }
    if (assistant && assistant.avatarImage) {
      setSelectedAvatarId(assistant.avatarImage);
    }
  }, [key, assistant]);

  const avatars = [
    { id: 'avatar1', name: 'Avatar 1', imageUrl: '/avatars/avatar1.png' },
    { id: 'avatar2', name: 'Avatar 2', imageUrl: '/avatars/avatar2.png' },
    { id: 'avatar3', name: 'Avatar 3', imageUrl: '/avatars/avatar3.png' },
    { id: 'avatar4', name: 'Avatar 4', imageUrl: '/avatars/avatar4.png' },
    { id: 'avatar5', name: 'Avatar 5', imageUrl: '/avatars/avatar5.png' },
    { id: 'avatar6', name: 'Avatar 6', imageUrl: '/avatars/avatar6.png' },
    { id: 'avatar7', name: 'Avatar 7', imageUrl: '/avatars/avatar7.png' },
    { id: 'avatar8', name: 'Avatar 8', imageUrl: '/avatars/avatar8.png' },
    { id: 'avatar9', name: 'Avatar 9', imageUrl: '/avatars/avatar9.png' },
  ];

  const fetchAssistantFiles = async () => {
    if (key) {
      try {
        const files = await listAssistantFiles(key);
        setUploadedFiles(files);
      } catch (error) {
        console.error('Failed to fetch assistant files', error);
      }
    }
  };

  if (rootStore.assistantsLoaded === false) {
    return <TextComponent text="Loading..." size="medium" />;
  }

  if (!assistant) {
    return <TextComponent text="Assistant not found" size="medium" />;
  }

  const formFields: FieldConfig[] = assistantFieldConfigs.map((field) => {
    if (field.key === 'voice') {
      field.value = assistant ? toJS(assistant.voice) : '';
    }
    const fieldKeyString = String(field.key);
    const value = assistant ? toJS((assistant as any)[fieldKeyString]) : '';

    if (field.type === 'dropdown') {
      return {
        ...field,
        value,
        options: (field as DropdownFieldConfig).options,
      } as DropdownFieldConfig;
    }

    return {
      ...field,
      value,
    };
  });

  const handleSubmit = async (values: FormValues) => {
    console.log('Form Values:', values);
    if (!key) {
      return;
    }
    setIsLoading(true);
    const updatedValues = {
      ...values,
      avatarImage: selectedAvatarId,
    };
    await rootStore.updateAssistant(key, updatedValues as unknown as IAssistant);
    setIsLoading(false);
  };

  const handleFileUpload = async (file: File) => {
    if (!key) return;

    setIsUploading(true);
    try {
      const response = await uploadFile(key, file);
      const newFile: UploadedFile = {
        fileId: response.fileId,
        openaiFileId: response.openaiFileId,
        filename: response.title,
      };
      setUploadedFiles([...uploadedFiles, newFile]);
      console.log('File uploaded successfully:', newFile);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!key) return;

    try {
      await deleteFile(key, fileId);
      setUploadedFiles(uploadedFiles.filter((file) => file.fileId !== fileId));
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className="flex w-full space-x-2 rtl:space-x-reverse">
      <div className="w-1/2">
        <DynamicForm
          formContext="assistantFieldConfigs"
          fields={formFields}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          formType="update"
        />
        <div className="mt-4">
          <AvatarSelector
            avatars={avatars}
            selectedAvatarId={selectedAvatarId}
            onSelectAvatar={setSelectedAvatarId}
          />
        </div>
      </div>
      <div className="w-1/2">
        <TextComponent text={t('EditAssistantPage.uploadFile')} size="normal" className="mb-2" />
        <FileUpload
          onFileUpload={handleFileUpload}
          isUploading={isUploading}
        />
        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <TextComponent
              text={t('EditAssistantPage.uploadedFiles')}
              size="medium"
              className="mb-2"
            />
            <ul>
              {uploadedFiles.map((file) => (
                <li
                  key={file.fileId}
                  className="flex justify-between items-center text-sm text-gray-600 mb-2"
                >
                  <div className="flex gap-2">
                    <FileText size={16} className="text-slate-500 mt-1" />
                    <TextComponent
                      text={file.filename}
                      size="small"
                      color="secondary"
                    />
                  </div>

                  <IconButton
                    icon={<TrashIcon size={16} />}
                    onClick={() => handleFileDelete(file.fileId)}
                    className="text-gray-400 hover:text-red-400 transition duration-100"
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

const EditAssistantPage = withPage(
  'EditAssistantPage.title',
  'EditAssistantPage.description',
  () => {
    // Removed console.log statement
  }
)(EditAssistantView);

export { EditAssistantPage, EditAssistantView };
