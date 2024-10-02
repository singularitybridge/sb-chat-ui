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
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'started':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const mappedIconName = mapIconName(icon);
  const IconComponent = (LucideIcons[mappedIconName] || LucideIcons.HelpCircle) as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  return (
    <div className="mb-2 rtl:mr-11 ltr:ml-11">
      <div className={`rounded-lg border ${getStatusStyle(status)} overflow-hidden`}>
        <div className="p-2 flex flex-col items-start w-full text-gray-800">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <IconComponent className="w-4 h-4 flex-shrink-0" />
              </button>
              <span className="font-medium text-sm">{actionTitle}</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">{serviceName}</span>
          </div>
          <p className="text-xs mt-1 rtl:text-right ltr:text-left">{actionDescription}</p>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px]' : 'max-h-0'}`}>
        <div className="px-4 py-2 rounded-b  bg-slate-50 w-[calc(100%-16px)] mx-2 border border-gray-200">
          <div className="space-y-1">
            <div className="border-b border-indigo-100 pb-1 text-left">
              <span className="text-xs font-normal">Action ID</span>
              <p className=" text-base">{actionId}</p>
            </div>
            <div className="border-b border-indigo-100 pb-1 text-left">
              <span className="text-xs font-normal">Original Action ID</span>
              <p className="test-base">{originalActionId}</p>
            </div>
            {Object.keys(args).length > 0 && (
              <div className="border-b border-indigo-100 pb-1 text-left">
                <span className="font-normal text-xs">request</span>
                <pre dir='ltr' className="bg-slate-100 p-3 rounded mt-1 text-xs overflow-x-auto text-blue-800">
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