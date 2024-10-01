import React from 'react';
import { MessageWrapper } from './MessageWrapper';

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
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getIcon = () => {
    // You can replace this with actual icon components based on the 'icon' prop
    return <span className="text-2xl">{icon === 'assistant' ? '🤖' : '⚙️'}</span>;
  };

  return (
    <MessageWrapper icon={getIcon()} bgColor="bg-gray-100" borderColor="border-gray-300" role="Action">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold">{actionTitle}</span>
          <span className={`font-medium ${getStatusColor(status)}`}>{status}</span>
        </div>
        <p className="text-sm text-gray-600">{actionDescription}</p>
        <div className="text-xs text-gray-500">
          <p>Service: {serviceName}</p>
          <p>Action ID: {actionId}</p>
          <p>Original Action ID: {originalActionId}</p>
        </div>
        {Object.keys(args).length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium">Arguments:</p>
            <pre className="text-xs bg-gray-200 p-2 rounded mt-1">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </MessageWrapper>
  );
};

export { ActionExecutionMessage };