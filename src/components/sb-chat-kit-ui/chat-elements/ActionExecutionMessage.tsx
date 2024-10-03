import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { getMessageById } from '../../../services/api/assistantService';

interface ActionExecutionMessageProps {
  messageId: string;
  status: 'started' | 'completed' | 'failed';
  actionId: string;
  serviceName: string;
  actionTitle: string;
  actionDescription: string;
  icon: string;
  originalActionId: string;
}

interface FullMessageData {
  _id: string;
  data: {
    id: string;
    actionId: string;
    serviceName: string;
    actionTitle: string;
    actionDescription: string;
    icon: string;
    originalActionId: string;
    input?: any;
    output?: any;
    status: 'started' | 'completed' | 'failed';
  };
  sessionId: string;
  messageType: string;
  sender: string;
  timestamp: string;
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
  messageId,
  status,
  actionId,
  serviceName,
  actionTitle,
  actionDescription,
  icon,
  originalActionId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullMessageData, setFullMessageData] = useState<FullMessageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleExpand = async () => {
    if (!isExpanded && !fullMessageData) {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMessageById(messageId);
        setFullMessageData(data);
      } catch (err) {
        setError('Failed to load message details');
        console.error('Error loading message details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-2 rtl:mr-11 ltr:ml-11">
      <div className={`rounded-lg border ${getStatusStyle(status)} overflow-hidden`}>
        <div className="p-2 flex flex-col items-start w-full text-gray-800">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={handleExpand}
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
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
        <div className="px-4 py-2 rounded-b bg-slate-50 w-[calc(100%-16px)] mx-2 border border-gray-200">
          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && fullMessageData && (
            <div className="space-y-1">
              <div className="border-b border-indigo-100 pb-1 text-left">
                <span className="text-xs font-normal">Message ID</span>
                <p className="text-base">{fullMessageData._id}</p>
              </div>
              <div className="border-b border-indigo-100 pb-1 text-left">
                <span className="text-xs font-normal">Action ID</span>
                <p className="text-base">{fullMessageData.data.actionId}</p>
              </div>
              <div className="border-b border-indigo-100 pb-1 text-left">
                <span className="text-xs font-normal">Original Action ID</span>
                <p className="text-base">{fullMessageData.data.originalActionId}</p>
              </div>
              <div className="border-b border-indigo-100 pb-1 text-left">
                <span className="text-xs font-normal">Status</span>
                <p className="text-base">{fullMessageData.data.status}</p>
              </div>
              {fullMessageData.data.input && (
                <div className="border-b border-indigo-100 pb-1 text-left">
                  <span className="text-xs font-normal">Input</span>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(fullMessageData.data.input, null, 2)}
                  </pre>
                </div>
              )}
              {fullMessageData.data.output && (
                <div className="border-b border-indigo-100 pb-1 text-left">
                  <span className="text-xs font-normal">Output</span>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(fullMessageData.data.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ActionExecutionMessage };