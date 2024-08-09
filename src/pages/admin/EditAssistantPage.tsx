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
    { id: 'avatar-_0000_29', name: 'Avatar 29', imageUrl: '/assets/avatars/avatar-_0000_29.png' },
    { id: 'avatar-_0001_28', name: 'Avatar 28', imageUrl: '/assets/avatars/avatar-_0001_28.png' },
    { id: 'avatar-_0002_27', name: 'Avatar 27', imageUrl: '/assets/avatars/avatar-_0002_27.png' },
    { id: 'avatar-_0003_26', name: 'Avatar 26', imageUrl: '/assets/avatars/avatar-_0003_26.png' },
    { id: 'avatar-_0004_25', name: 'Avatar 25', imageUrl: '/assets/avatars/avatar-_0004_25.png' },
    { id: 'avatar-_0005_24', name: 'Avatar 24', imageUrl: '/assets/avatars/avatar-_0005_24.png' },
    { id: 'avatar-_0006_23', name: 'Avatar 23', imageUrl: '/assets/avatars/avatar-_0006_23.png' },
    { id: 'avatar-_0007_22', name: 'Avatar 22', imageUrl: '/assets/avatars/avatar-_0007_22.png' },
    { id: 'avatar-_0008_21', name: 'Avatar 21', imageUrl: '/assets/avatars/avatar-_0008_21.png' },
    { id: 'avatar-_0009_20', name: 'Avatar 20', imageUrl: '/assets/avatars/avatar-_0009_20.png' },
    { id: 'avatar-_0010_19', name: 'Avatar 19', imageUrl: '/assets/avatars/avatar-_0010_19.png' },
    { id: 'avatar-_0011_18', name: 'Avatar 18', imageUrl: '/assets/avatars/avatar-_0011_18.png' },
    { id: 'avatar-_0012_17', name: 'Avatar 17', imageUrl: '/assets/avatars/avatar-_0012_17.png' },
    { id: 'avatar-_0013_16', name: 'Avatar 16', imageUrl: '/assets/avatars/avatar-_0013_16.png' },
    { id: 'avatar-_0014_15', name: 'Avatar 15', imageUrl: '/assets/avatars/avatar-_0014_15.png' },
    { id: 'avatar-_0015_14', name: 'Avatar 14', imageUrl: '/assets/avatars/avatar-_0015_14.png' },
    { id: 'avatar-_0016_13', name: 'Avatar 13', imageUrl: '/assets/avatars/avatar-_0016_13.png' },
    { id: 'avatar-_0017_12', name: 'Avatar 12', imageUrl: '/assets/avatars/avatar-_0017_12.png' },
    { id: 'avatar-_0018_11', name: 'Avatar 11', imageUrl: '/assets/avatars/avatar-_0018_11.png' },
    { id: 'avatar-_0019_10', name: 'Avatar 10', imageUrl: '/assets/avatars/avatar-_0019_10.png' },
    { id: 'avatar-_0020_9', name: 'Avatar 9', imageUrl: '/assets/avatars/avatar-_0020_9.png' },
    { id: 'avatar-_0021_8', name: 'Avatar 8', imageUrl: '/assets/avatars/avatar-_0021_8.png' },
    { id: 'avatar-_0022_7', name: 'Avatar 7', imageUrl: '/assets/avatars/avatar-_0022_7.png' },
    { id: 'avatar-_0023_6', name: 'Avatar 6', imageUrl: '/assets/avatars/avatar-_0023_6.png' },
    { id: 'avatar-_0024_5', name: 'Avatar 5', imageUrl: '/assets/avatars/avatar-_0024_5.png' },
    { id: 'avatar-_0025_4', name: 'Avatar 4', imageUrl: '/assets/avatars/avatar-_0025_4.png' },
    { id: 'avatar-_0026_3', name: 'Avatar 3', imageUrl: '/assets/avatars/avatar-_0026_3.png' },
    { id: 'avatar-_0027_2', name: 'Avatar 2', imageUrl: '/assets/avatars/avatar-_0027_2.png' },
    { id: 'avatar-_0028_1', name: 'Avatar 1', imageUrl: '/assets/avatars/avatar-_0028_1.png' },
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
    <div className="flex w-full space-x-4 rtl:space-x-reverse">
      <div className="w-1/2">
        <DynamicForm
          formContext="assistantFieldConfigs"
          fields={formFields}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          formType="update"
        />
      </div>
      <div className="w-1/2">
        <div className="mb-6">
          <TextComponent text={t('EditAssistantPage.selectAvatar')} size="medium" className="mb-2" />
          <AvatarSelector
            selectedAvatarId={selectedAvatarId}
            onSelectAvatar={setSelectedAvatarId}
          />
        </div>
        <div className="mb-6">
          <TextComponent text={t('EditAssistantPage.uploadFile')} size="normal" className="mb-2" />
          <FileUpload
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />
        </div>
        {uploadedFiles.length > 0 && (
          <div>
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
