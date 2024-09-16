import React from 'react';
import { ActionOption } from '../store/fieldConfigs/assistantFieldConfigs';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';

interface ActionsGalleryProps {
  selectedActions: string[];
  availableActions: ActionOption[];
  onChange: (actions: string[]) => void;
}

const ActionsGallery: React.FC<ActionsGalleryProps> = ({
  selectedActions,
  availableActions,
  onChange,
}) => {
  const { t } = useTranslation();

  const handleToggleAction = (actionValue: string) => {
    const updatedActions = selectedActions.includes(actionValue)
      ? selectedActions.filter(action => action !== actionValue)
      : [...selectedActions, actionValue];
    onChange(updatedActions);
  };

  const renderActionButton = (action: ActionOption) => (
    <button
      key={action.value}
      className={`p-2 m-1 rounded flex flex-col items-center justify-center w-full h-24 ${
        selectedActions.includes(action.value)
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      onClick={() => handleToggleAction(action.value)}
    >
      <span className="text-2xl mb-2">{action.iconName}</span>
      <span className="text-sm text-center">{action.label}</span>
    </button>
  );

  const renderActionCategory = (category: string, actions: ActionOption[]) => (
    <div key={category} className="mb-6">
      <TextComponent text={category} size="medium" className="font-bold mb-2" />
      <div className="grid grid-cols-3 gap-4">
        {actions.map(renderActionButton)}
      </div>
    </div>
  );

  const categorizedActions = availableActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, ActionOption[]>);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <TextComponent text={t('ActionsGallery.selectedActions')} size="medium" className="font-bold mb-2" />
        <div className="border border-gray-300 rounded-lg p-4 max-h-[200px] overflow-y-auto">
          {selectedActions.length === 0 ? (
            <p className="text-gray-500">{t('ActionsGallery.noSelectedActions')}</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {selectedActions.map(action => {
                const actionOption = availableActions.find(a => a.value === action);
                return actionOption ? renderActionButton(actionOption) : null;
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <TextComponent text={t('ActionsGallery.availableActions')} size="medium" className="font-bold mb-2" />
        <div className="border border-gray-300 rounded-lg p-4 h-full overflow-y-auto">
          {Object.entries(categorizedActions).map(([category, actions]) =>
            renderActionCategory(category, actions)
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionsGallery;