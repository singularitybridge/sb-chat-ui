import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useAssistantStore } from '../../store/useAssistantStore';
import { IAssistant } from '../../types/entities';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  DropdownFieldConfig,
} from '../../components/DynamicForm';
import { getAssistantFieldConfigs, defaultAssistantFieldConfigs } from '../../store/fieldConfigs/assistantFieldConfigs';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';
import AvatarSelector from '../../components/AvatarSelector';
import { emitter } from '../../services/mittEmitter';
import { EVENT_SHOW_EDIT_ASSISTANT_ACTIONS_MODAL } from '../../utils/eventNames';
import { StickyFormLayout } from '../../components/admin/StickyFormLayout';
import { getAssistantUrl } from '../../utils/assistantUrlUtils';
import { Button } from '../../components/ui/button';
import LoadingButton from '../../components/core/LoadingButton';

const EditAssistantPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { assistantsLoaded, getAssistantById, updateAssistant } = useAssistantStore();
  const assistant = key ? getAssistantById(key) : null;
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>(defaultAssistantFieldConfigs);
  const [isFieldConfigsLoading, setIsFieldConfigsLoading] = useState(true);

  const formId = 'edit-assistant-form';

  useEffect(() => {
    const fetchFieldConfigs = async () => {
      try {
        const configs = await getAssistantFieldConfigs(i18n.language);
        setFieldConfigs(configs);
      } catch (error) {
        console.error('Failed to fetch assistant field configs:', error);
      } finally {
        setIsFieldConfigsLoading(false);
      }
    };

    fetchFieldConfigs();

    if (assistant) {
      setSelectedAvatarId(assistant.avatarImage || null);
    }
  }, [key, assistant, i18n.language]);

  const showActionsModal = () => {
    if (assistant) {
      emitter.emit(EVENT_SHOW_EDIT_ASSISTANT_ACTIONS_MODAL, {
        assistantId: assistant._id,
        allowedActions: assistant.allowedActions,
        title: t('EditAssistantPage.editAllowedActions'),
      });
    }
  };

  if (assistantsLoaded === false || isFieldConfigsLoading) {
    return <TextComponent text={t('common.pleaseWait')} size="medium" />;
  }

  if (!assistant) {
    return <TextComponent text="Assistant not found" size="medium" />;
  }

  const formFields: FieldConfig[] = fieldConfigs.map((field) => {
    if (field.key === 'allowedActions') {
      return null; // Remove the allowedActions field from the form
    }
    const fieldKeyString = String(field.key);
    let value = assistant ? (assistant as any)[fieldKeyString] : '';

    if (field.key === 'voice') {
      value = assistant ? assistant.voice : '';
    }

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
  }).filter(Boolean) as FieldConfig[]; // Filter out null values and cast to FieldConfig[]

  const handleSubmit = async (values: FormValues) => {
    if (!key || !assistant) {
      return;
    }
    setIsLoading(true);
    const updatedValues = {
      ...values,
      avatarImage: selectedAvatarId,
    };

    try {
      // Check if name has changed (which affects the URL)
      const oldName = assistant.name;
      const newName = values.name as string;

      await updateAssistant(key, updatedValues as IAssistant);
      toast.success(t('EditAssistantPage.saveSuccess'));

      // If name has changed, navigate to the new URL
      if (newName && newName !== oldName) {
        const updatedAssistant = getAssistantById(key);
        if (updatedAssistant) {
          const newUrl = getAssistantUrl(updatedAssistant);
          navigate(newUrl, { replace: true });
        }
      }
    } catch (_error) {
      toast.error(t('EditAssistantPage.saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StickyFormLayout
      title={t('EditAssistantPage.title')}
      subtitle={t('EditAssistantPage.description')}
      backUrl="/admin/assistants"
      footer={
        <div className="flex items-center gap-3">
          <LoadingButton
            type="submit"
            form={formId}
            isLoading={isLoading}
          >
            {t('common.save')}
          </LoadingButton>
          <Button variant="outline" onClick={showActionsModal}>
            {t('EditAssistantPage.editAllowedActions')}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-12 rtl:space-x-reverse">
        <div className="w-full lg:w-1/2">
          <DynamicForm
            formId={formId}
            formContext="assistantFieldConfigs"
            fields={formFields}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            formType="update"
            hideSubmitButton={true}
          />
        </div>
        <div className="w-full lg:w-1/2">
          <div>
            <TextComponent text={t('EditAssistantPage.selectAvatar')} size="subtitle" className="mb-4" />
            <AvatarSelector
              selectedAvatarId={selectedAvatarId}
              onSelectAvatar={setSelectedAvatarId}
            />
          </div>
        </div>
      </div>
    </StickyFormLayout>
  );
};

export { EditAssistantPage };
