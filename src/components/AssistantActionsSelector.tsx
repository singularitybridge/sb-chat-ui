import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionSelect, ActionOption } from './ActionSelect';
import ActionTag from './ActionTag';

export interface ActionType {
  id: string;
  name: string;
  iconName: string;
  title: string;
  description: string;
  serviceName: string;
}

export interface AssistantActionsSelectorProps {
  selectedActions: string[];
  availableActions: ActionType[];
  title: string;
  description: string;
  onChange: (actions: string[]) => void;
}

const AssistantActionsSelector: React.FC<AssistantActionsSelectorProps> = ({
  selectedActions,
  availableActions,
  title,
  description,
  onChange,
}) => {
  const { t } = useTranslation();

  const removeAction = (actionToRemove: string) => {
    onChange(selectedActions.filter((action) => action !== actionToRemove));
  };

  const addAction = (actionToAdd: string) => {
    if (!selectedActions.includes(actionToAdd)) {
      onChange([...selectedActions, actionToAdd]);
    }
  };

  // Filter out actions that are already selected
  const filteredAvailableActions = availableActions.filter(
    (availableAction) => !selectedActions.includes(availableAction.id)
  );

  const actionOptions: ActionOption[] = filteredAvailableActions.map((action) => ({
    id: action.id,
    name: action.name,
    iconName: action.iconName,
    title: action.title,
    description: action.description,
    serviceName: action.serviceName,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <div className="border border-gray-300 rounded-lg p-4 space-y-4">
        {selectedActions.length === 0 ? (
          <p className="text-gray-500">{t('CompaniesPage.noActionSelected')}</p>
        ) : (
          <div className="space-y-2">
            {selectedActions.map((actionId) => {
              const action = availableActions.find((a) => a.id === actionId);
              return action ? (
                <ActionTag
                  key={actionId}
                  iconName={action.iconName}
                  title={action.title}
                  description={action.description}
                  serviceName={action.serviceName}
                  onRemove={() => removeAction(actionId)}
                />
              ) : null;
            })}
          </div>
        )}
        <div className="pt-4 border-t border-gray-200">
          <ActionSelect
            label={t('CompaniesPage.addAction')}
            options={actionOptions}
            onSelect={addAction}
            placeholder={t('CompaniesPage.selectAction')}
          />
        </div>
      </div>
    </div>
  );
};

export { AssistantActionsSelector };