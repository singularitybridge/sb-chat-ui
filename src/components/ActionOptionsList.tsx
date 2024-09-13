import React from 'react';
import { ActionOption } from './ActionSelect';
import ActionTag from './ActionTag';

interface ActionOptionsListProps {
  options: ActionOption[];
  onSelect: (value: string) => void;
  onHover?: (option: ActionOption) => void;
}

const ActionOptionsList: React.FC<ActionOptionsListProps> = ({ options, onSelect, onHover }) => {
  return (
    <div>
      {options.map(option => (
        <div
          key={option.id}
          onClick={() => onSelect(option.id)}
          onMouseEnter={() => onHover && onHover(option)}
          className="p-2 hover:bg-gray-100 cursor-pointer"
        >
          <ActionTag
            iconName={option.iconName}
            title={option.title}
            description={option.description}
            serviceName={option.serviceName}
            className="p-0 bg-transparent"            
          />
        </div>
      ))}
    </div>
  );
};

export default ActionOptionsList;
