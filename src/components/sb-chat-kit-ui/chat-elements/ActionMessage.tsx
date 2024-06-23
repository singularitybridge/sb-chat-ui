import React from 'react';
import { MessageWrapper } from './MessageWrapper';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface Action {
  label: string;
  onClick: () => void;
}

interface ActionMessageProps {
  text: string;
  actions: Action[];
  role: string;
  isDisabled: boolean; // New prop to handle disabled state
}

const ActionMessage: React.FC<ActionMessageProps> = ({ text, actions, role, isDisabled }) => {
  const [selected, setSelected] = React.useState<number | null>(null);

  const handleClick = (index: number, action: Action) => {
    if (selected === null && !isDisabled) {
      action.onClick();
      setSelected(index);
    }
  };

  return (
    <MessageWrapper icon={<SparklesIcon className="w-5 h-5 text-gray-700" />} bgColor="" borderColor="bg-gray-300" role={role}>
      <p>{text}</p>
      <div className="mt-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleClick(index, action)}
            className={`px-4 py-2 rounded m-1 ${
              selected === index
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 text-white'
            } ${isDisabled || (selected !== null && selected !== index) ? 'pointer-events-none opacity-50' : ''}`}
            disabled={isDisabled || selected !== null}
          >
            {action.label}
          </button>
        ))}
      </div>
    </MessageWrapper>
  );
};

export { ActionMessage };
