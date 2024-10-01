import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

interface ActionExecutionMessageProps {
  status: string;
  actionId: string;
  serviceName: string;
  actionTitle: string;
  actionDescription: string;
  icon: string;
  args: Record<string, any>;
  originalActionId: string;
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

const ActionExecutionMessage: React.FC<ActionExecutionMessageProps> = ({
  status,
  actionId,
  serviceName,
  actionTitle,
  actionDescription,
  icon,
  args,
  originalActionId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100';
      case 'failed':
        return 'bg-red-100';
      case 'started':
        return 'bg-blue-100';
      default:
        return 'bg-gray-100';
    }
  };

  const mappedIconName = mapIconName(icon);
  const IconComponent = (LucideIcons[mappedIconName] || LucideIcons.HelpCircle) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  return (
    <div className="mb-2">
      <div className={`rounded-t ${isExpanded ? 'rounded-b-none' : 'rounded-b'} overflow-hidden ${getStatusStyle(status)}`}>
        <div className="p-3 flex flex-col items-start w-full text-gray-800">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
              </button>
              <span className="font-light text-lg">{actionTitle}</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{serviceName}</span>
          </div>
          <div className="flex items-center mt-2 w-full rtl:text-right ltr:text-left">
            <p className="text-xs flex-grow">{actionDescription}</p>
          </div>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className={`p-3 rounded-b ${getStatusStyle(status)}`}>
          <div className="space-y-2">
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm">Action ID:</span>
              <p className="text-xs text-gray-600 mt-1">{actionId}</p>
            </div>
            <div className="border-b border-gray-200 pb-2">
              <span className="text-sm">Original Action ID:</span>
              <p className="text-xs text-gray-600 mt-1">{originalActionId}</p>
            </div>
            {Object.keys(args).length > 0 && (
              <div className="border-b border-gray-200 pb-2">
                <span className="text-sm">Arguments:</span>
                <pre dir='ltr' className="text-xs bg-gray-100 p-3 rounded mt-1 ">
                  {JSON.stringify(args, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ActionExecutionMessage };