import React, { useState, useEffect } from 'react';
import { ActionOption } from '../store/fieldConfigs/assistantFieldConfigs';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import { Input } from './sb-core-ui-kit/Input';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActions, setFilteredActions] = useState(availableActions);

  useEffect(() => {
    const filtered = availableActions.filter(action =>
      action.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredActions(filtered);
  }, [searchTerm, availableActions]);

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
        className={`p-2 m-1 rounded flex flex-col items-start w-full h-full ${
          isSelected
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={() => handleToggleAction(action.value)}
      >
        <div className="flex items-center w-full">
          <IconComponent className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{action.label}</span>
        </div>
        <p className="text-xs mt-1 w-full text-left">{action.description}</p>
      </button>
    );
  };

  const renderActionCategory = (category: string, actions: ActionOption[]) => (
    <div key={category} className="mb-6">
      <TextComponent text={category} size="medium" className="font-bold mb-2" />
      <div className="grid grid-cols-2 gap-2">
        {actions.map(renderActionButton)}
      </div>
    </div>
  );

  const categorizedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, ActionOption[]>);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="mb-4 relative">
        <Input
          id="action-search"
          type="text"
          placeholder={t('ActionsGallery.searchPlaceholder')}
          value={searchTerm}
          onChange={(value: string) => setSearchTerm(value)}
          className="w-full pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <LucideIcons.X size={16} />
          </button>
        )}
      </div>
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