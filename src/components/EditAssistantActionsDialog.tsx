import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../store/common/RootStoreContext';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import Button from './sb-core-ui-kit/Button';
import { useTranslation } from 'react-i18next';
import { IAssistant } from '../store/models/Assistant';
import { cast } from 'mobx-state-tree';
import { fetchAllowedActionOptions, ActionOption } from '../store/fieldConfigs/assistantFieldConfigs';
import ActionsGallery from './ActionsGallery';

interface EditAssistantActionsDialogProps {
  assistantId: string;
  allowedActions: string[] | undefined;
}

const EditAssistantActionsDialog: React.FC<EditAssistantActionsDialogProps> = observer(
  ({ assistantId, allowedActions }) => {
    const { t, i18n } = useTranslation();
    const rootStore = useRootStore();
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
          // Handle error (e.g., show error message)
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
        const assistant = rootStore.getAssistantById(assistantId);
        if (assistant) {
          const updatedAssistant: IAssistant = {
            ...assistant,
            allowedActions: cast(selectedActions)
          };
          await rootStore.updateAssistant(assistantId, updatedAssistant);
          // Close the dialog or show a success message
        } else {
          throw new Error('Assistant not found');
        }
      } catch (error) {
        console.error('Failed to update assistant actions:', error);
        // Show an error message
      } finally {
        setIsLoading(false);
      }
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
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    );
  }
);

export default EditAssistantActionsDialog;