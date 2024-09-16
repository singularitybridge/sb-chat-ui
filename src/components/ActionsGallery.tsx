import React, { useEffect } from 'react';
import { ActionOption } from '../store/fieldConfigs/assistantFieldConfigs';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';

interface ActionsGalleryProps {
  selectedActions: string[];
  availableActions: ActionOption[];
  onChange: (actions: string[]) => void;
}

const mapIconName = (iconName: string): keyof typeof LucideIcons => {
  const pascalCase = iconName.split(/[-_\s]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('');
  
  const specialCases: { [key: string]: keyof typeof LucideIcons } = {
    'image': 'Image',
    'brain': 'Brain',
    // Add more special cases here if needed
  };

  return (specialCases[iconName] || pascalCase) as keyof typeof LucideIcons;
};

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

  const renderActionButton = (action: ActionOption) => {    
    const mappedIconName = mapIconName(action.iconName);
    const IconComponent = (LucideIcons[mappedIconName] || LucideIcons.HelpCircle) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

    const isSelected = selectedActions.includes(action.value);

    return (
      <button
        key={action.value}
        className={`p-2 m-1 rounded flex flex-col items-center justify-center w-full h-24 ${
          isSelected
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={() => handleToggleAction(action.value)}
      >
        <IconComponent className="w-6 h-6 mb-2" />
        <span className="text-sm text-center">{action.label}</span>
      </button>
    );
  };

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
    <div className="h-full flex flex-col overflow-hidden">
      <TextComponent text={t('ActionsGallery.availableActions')} size="medium" className="font-bold mb-2" />
      <div className="flex-grow overflow-y-auto">
        {Object.entries(categorizedActions).map(([category, actions]) =>
          renderActionCategory(category, actions)
        )}
      </div>
    </div>
  );
};

export default ActionsGallery;