import React, { useState, useEffect } from 'react';
import { useAssistantStore } from '../store/useAssistantStore';
import Button from './sb-core-ui-kit/Button';
import { useTranslation } from 'react-i18next';
import { IAssistant } from '../types/entities';
import { fetchAllowedActionOptions, ActionOption } from '../store/fieldConfigs/assistantFieldConfigs';
import ActionsGallery from './ActionsGallery';

interface EditAssistantActionsDialogProps {
  assistantId: string;
  allowedActions: string[] | undefined;
}

const EditAssistantActionsDialog: React.FC<EditAssistantActionsDialogProps> = (
  { assistantId, allowedActions }
) => {
  const { t, i18n } = useTranslation();
  const { getAssistantById, updateAssistant } = useAssistantStore();
  const [selectedActions, setSelectedActions] = useState<string[]>(allowedActions || []);
  const [availableActions, setAvailableActions] = useState<ActionOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getAvailableActions = async () => {
      try {
        const actions = await fetchAllowedActionOptions(i18n.language);
        setAvailableActions(actions);
      } catch (error) {
        console.error('Failed to fetch available actions:', error);
      }
    };

    getAvailableActions();
  }, [i18n.language]);

  useEffect(() => {
    setSelectedActions(allowedActions || []);
  }, [allowedActions]);

  const handleActionsChange = (actions: string[]) => {
    setSelectedActions(actions);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const assistant = getAssistantById(assistantId);
      if (assistant) {
        const updatedAssistant: Partial<IAssistant> = {
          ...assistant,
          allowedActions: selectedActions
        };
        await updateAssistant(assistantId, updatedAssistant);
      } else {
        throw new Error('Assistant not found');
      }
    } catch (error) {
      console.error('Failed to update assistant actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedActions([]);
  };

  return (
    <div className="p-4 h-[80vh] flex flex-col">
      <div className="flex-grow overflow-hidden">
        <ActionsGallery
          selectedActions={selectedActions}
          availableActions={availableActions}
          onChange={handleActionsChange}
        />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          onClick={handleClear}
          disabled={isLoading || selectedActions.length === 0}
          variant="secondary"
        >
          {t('common.clear') || 'Clear'}
        </Button>
        <Button onClick={handleSave} disabled={isLoading}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
};

export default EditAssistantActionsDialog;
