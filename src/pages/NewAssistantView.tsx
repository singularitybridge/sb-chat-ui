import React, { useState, useEffect } from 'react';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  DropdownFieldConfig,
} from '../components/DynamicForm';
import { assistantFieldConfigs } from '../store/fieldConfigs/assistantFieldConfigs';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import { IAssistant } from '../store/models/Assistant';
import { useEventEmitter } from '../services/mittEmitter';
import { EVENT_SET_ASSISTANT_VALUES } from '../utils/eventNames';
import AvatarSelector from '../components/AvatarSelector';
import { TextComponent } from '../components/sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';

const NewAssistantView: React.FC = observer(() => {
  const { t } = useTranslation();
  const rootStore = useRootStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FieldConfig[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>('avatar2');

  const handleUpdateFormFields = (data: {
    name: string;
    description: string;
    prompt: string;
  }) => {
    setFormFields((prev) => {
      const newFormFields = prev.map((field) => {
        if (field.key === 'name') {
          field.value = data.name;
        } else if (field.key === 'description') {
          field.value = data.description;
        } else if (field.key === 'llmPrompt') {
          field.value = data.prompt;
        }
        return field;
      });
      return newFormFields;
    });
  };

  useEventEmitter<{ name: string; description: string; prompt: string }>(
    EVENT_SET_ASSISTANT_VALUES,
    handleUpdateFormFields
  );

  useEffect(() => {
    const initialFormFields = assistantFieldConfigs.map((field) => {
      if (field.type === 'dropdown') {
        return {
          ...field,
          options: (field as DropdownFieldConfig).options,
        } as DropdownFieldConfig;
      }
      return field;
    });

    setFormFields(initialFormFields);
    setSelectedAvatarId('avatar-_0000_29'); // Ensure the second avatar is selected even if fields are reset
  }, []); // Empty dependency array ensures this runs only once

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const assistantData = {
      ...values,
      avatarImage: selectedAvatarId,
    } as unknown as IAssistant;
    await rootStore.createAssistant(assistantData);
    setIsLoading(false);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <TextComponent text={t('EditAssistantPage.selectAvatar')} size="normal" className="mb-4" />
        <AvatarSelector
          selectedAvatarId={selectedAvatarId}
          onSelectAvatar={setSelectedAvatarId}
        />
      </div>
      <DynamicForm
        formContext="assistantFieldConfigs"
        fields={formFields}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        formType="create"
      />
    </div>
  );
});

export { NewAssistantView };
