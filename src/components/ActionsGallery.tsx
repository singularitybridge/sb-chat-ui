import React, { useState, useEffect } from 'react';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import { Input } from './sb-core-ui-kit/Input';

interface ActionParameter {
  type: string;
  description: string;
}

interface ActionParameters {
  type: string;
  properties: {
    [key: string]: ActionParameter;
  };
  required?: string[];
}

interface ActionOption {
  id: string;
  value: string;
  label: string;
  description: string;
  category: string;
  iconName: string;
  parameters: ActionParameters;
  name?: string;
  title?: string;
  serviceName?: string;
}

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

interface ExtendedInfoProps {
  action: ActionOption;
  isExpanded: boolean;
}

const ExtendedInfo: React.FC<ExtendedInfoProps> = ({ action, isExpanded }) => {
  const parameterEntries = Object.entries(action.parameters.properties);

  return (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
      <div className="bg-gray-100 p-3 rounded-b">
        <h4 className="mb-2 font-light text-lg">Parameters</h4>
        {parameterEntries.length > 0 ? (
          <div className="space-y-2">
            {parameterEntries.map(([name, prop]) => (
              <div key={name} className="border-b border-gray-200 pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{name}</span>
                  {action.parameters.required?.includes(name) && (
                    <span className="text-red-500 font-light text-lg">*</span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{prop.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">This action does not require any parameters.</p>
        )}
      </div>
    </div>
  );
};

const ActionsGallery: React.FC<ActionsGalleryProps> = ({
  selectedActions,
  availableActions,
  onChange,
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActions, setFilteredActions] = useState(availableActions);
  const [expandedActionId, setExpandedActionId] = useState<string | null>(null);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);

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

  const handleToggleExtendedInfo = (actionId: string) => {
    setExpandedActionId(prevId => prevId === actionId ? null : actionId);
  };

  const handleCopyIntegrationDetails = async (action: ActionOption) => {
    try {
      const integrationDetails = {
        id: action.id,
        name: action.name || action.label,
        title: action.title || action.label,
        label: action.label,
        description: action.description,
        category: action.category,
        serviceName: action.serviceName || action.category,
        iconName: action.iconName,
        value: action.value,
        parameters: action.parameters
      };
      
      await navigator.clipboard.writeText(JSON.stringify(integrationDetails, null, 2));
      
      // Show visual feedback
      setCopiedActionId(action.id);
      setTimeout(() => setCopiedActionId(null), 2000);
      
      console.log('Integration details copied to clipboard');
    } catch (error) {
      console.error('Failed to copy integration details:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = JSON.stringify({
        id: action.id,
        name: action.name || action.label,
        title: action.title || action.label,
        label: action.label,
        description: action.description,
        category: action.category,
        serviceName: action.serviceName || action.category,
        iconName: action.iconName,
        value: action.value,
        parameters: action.parameters
      }, null, 2);
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Show visual feedback for fallback too
      setCopiedActionId(action.id);
      setTimeout(() => setCopiedActionId(null), 2000);
    }
  };

  const renderActionButton = (action: ActionOption) => {    
    const mappedIconName = mapIconName(action.iconName);
    const IconComponent = (LucideIcons[mappedIconName] || LucideIcons.HelpCircle) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

    const isSelected = selectedActions.includes(action.value);
    const isExpanded = expandedActionId === action.id;

    return (
      <div key={action.value} className="mb-2">
        <div className={`rounded-t ${isExpanded ? 'rounded-b-none' : 'rounded-b'} overflow-hidden`}>
          <div
            className={`p-3 flex flex-col items-start w-full cursor-pointer ${
              isSelected
                ? 'bg-[#e0fcd6] text-gray-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => handleToggleAction(action.value)}
          >
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                <span className="font-light text-lg">{action.label}</span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyIntegrationDetails(action);
                  }}
                  className={`p-1 rounded-full hover:bg-gray-400 transition-colors ${
                    copiedActionId === action.id ? 'bg-green-200 text-green-700' : ''
                  }`}
                  title={copiedActionId === action.id ? 'Copied!' : 'Copy integration details as JSON'}
                >
                  {copiedActionId === action.id ? (
                    <LucideIcons.Check size={16} />
                  ) : (
                    <LucideIcons.Copy size={16} />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExtendedInfo(action.id);
                  }}
                  className="p-1 rounded-full hover:bg-gray-400"
                  title="Show/hide parameters"
                >
                  <LucideIcons.Info size={16} />
                </button>
              </div>
            </div>
            <p className="text-xs mt-2 w-full rtl:text-right ltr:text-left">{action.description}</p>
          </div>
        </div>
        <ExtendedInfo action={action} isExpanded={isExpanded} />
      </div>
    );
  };

  const renderActionCategory = (category: string, actions: ActionOption[]) => (
    <div key={category} className="mb-6">
      <TextComponent text={category} size="subtitle" className="mb-2" color="secondary" />
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
      <div className="mb-8 relative">
        <Input
          id="action-search"
          type="text"
          placeholder={t('actionsGallery.searchPlaceholder')}
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
      
      <div className="flex-grow overflow-y-auto">
        {Object.entries(categorizedActions).map(([category, actions]) =>
          renderActionCategory(category, actions)
        )}
      </div>
    </div>
  );
};

export default ActionsGallery;
