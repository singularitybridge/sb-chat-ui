import React, { useState, useEffect, useId } from 'react';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  DropdownFieldConfig,
} from '../components/DynamicForm';
import { getAssistantFieldConfigs, defaultAssistantFieldConfigs } from '../store/fieldConfigs/assistantFieldConfigs';
import { useAssistantStore } from '../store/useAssistantStore';
import { IAssistant } from '../types/entities';
import { useEventEmitter } from '../services/mittEmitter';
import { EVENT_SET_ASSISTANT_VALUES } from '../utils/eventNames';
import AvatarSelector from '../components/AvatarSelector';
import { TextComponent } from '../components/sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';
import LoadingButton from '../components/core/LoadingButton';

const NewAssistantView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { addAssistant } = useAssistantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FieldConfig[]>(defaultAssistantFieldConfigs);
  const [isFieldConfigsLoading, setIsFieldConfigsLoading] = useState(true);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>('avatar2');
  const formId = useId();

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
    const fetchFieldConfigs = async () => {
      try {
        const configs = await getAssistantFieldConfigs(i18n.language);
        setFormFields(configs.map((field) => {
          if (field.type === 'dropdown') {
            return {
              ...field,
              options: (field as DropdownFieldConfig).options,
            } as DropdownFieldConfig;
          }
          return field;
        }));
      } catch (error) {
        console.error('Failed to fetch assistant field configs:', error);
        // Fallback to default configs if fetch fails
        setFormFields(defaultAssistantFieldConfigs.map((field) => {
          if (field.type === 'dropdown') {
            return {
              ...field,
              options: (field as DropdownFieldConfig).options,
            } as DropdownFieldConfig;
          }
          return field;
        }));
      } finally {
        setIsFieldConfigsLoading(false);
      }
    };

    fetchFieldConfigs();
    setSelectedAvatarId('avatar-_0000_29'); // Ensure the second avatar is selected even if fields are reset
  }, [i18n.language]);

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const assistantData = {
      ...values,
      avatarImage: selectedAvatarId,
      language: 'en', // Default language (field removed from UI)
    } as unknown as IAssistant;
    await addAssistant(assistantData);
    setIsLoading(false);
  };

  if (isFieldConfigsLoading) {
    return <TextComponent text={t('common.pleaseWait')} size="medium" />;
  }

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="mb-6">
          <TextComponent text={t('EditAssistantPage.selectAvatar')} size="normal" className="mb-4" />
          <AvatarSelector
            selectedAvatarId={selectedAvatarId}
            onSelectAvatar={setSelectedAvatarId}
          />
        </div>
        <DynamicForm
          formId={formId}
          formContext="assistantFieldConfigs"
          fields={formFields}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          formType="create"
          hideSubmitButton={true}
        />
      </div>
      {/* Sticky footer */}
      <div className="shrink-0 pt-4 border-t border-neutral-200 dark:border-neutral-700 mt-2">
        <LoadingButton
          type="submit"
          form={formId}
          isLoading={isLoading}
        >
          {t('common.create')}
        </LoadingButton>
      </div>
    </div>
  );
};

export { NewAssistantView };
