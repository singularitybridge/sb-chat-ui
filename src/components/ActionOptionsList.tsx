import React from 'react';
import ActionTag from './ActionTag';
import { ActionOption } from './ActionSelect';

interface ActionOptionsListProps {
  options: ActionOption[];
  onSelect: (value: string) => void;
}

const ActionOptionsList: React.FC<ActionOptionsListProps> = ({ options, onSelect }) => {
  // Group options by serviceName
  const groupedOptions = options.reduce((groups: { [key: string]: ActionOption[] }, option) => {
    const group = groups[option.serviceName] || [];
    group.push(option);
    groups[option.serviceName] = group;
    return groups;
  }, {});

  if (Object.keys(groupedOptions).length === 0) {
    return <div className="text-center text-gray-500 py-2">No results found</div>;
  }

  return (
    <>
      {Object.entries(groupedOptions).map(([serviceName, options]) => (
        <div key={serviceName}>
          <div className="px-2 py-1 mt-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md">
            {serviceName}
          </div>
          {options.map(option => (
            <div
              key={option.id}
              className="mt-1 cursor-pointer"
              onClick={() => onSelect(option.id)}
            >
              <ActionTag
                iconName={option.iconName}
                title={option.title}
                description={option.description}
                serviceName={option.serviceName}
                className="p-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-md"
              />
            </div>
          ))}
        </div>
      ))}
    </>
  );
};

export default ActionOptionsList;
