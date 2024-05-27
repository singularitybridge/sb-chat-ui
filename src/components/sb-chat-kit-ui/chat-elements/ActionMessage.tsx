import React from 'react';
import { MessageWrapper } from './MessageWrapper';
import { SparklesIcon } from '@heroicons/react/24/solid'; // Import an icon to use

interface Action {
  label: string;
  onClick: () => void;
}

interface ActionMessageProps {
  text: string;
  actions: Action[];
  role: string;
}

const ActionMessage: React.FC<ActionMessageProps> = ({ text, actions, role }) => {
  return (
    <MessageWrapper icon={<SparklesIcon className="w-5 h-5 text-gray-700" />} bgColor="" borderColor="bg-gray-300" role={role}>
      <span className="block font-bold text-gray-800">{role}</span>
      <p>{text}</p>
      <div className="mt-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="px-4 py-2 bg-blue-500 text-white rounded m-1"
          >
            {action.label}
          </button>
        ))}
      </div>
    </MessageWrapper>
  );
};

export { ActionMessage };
