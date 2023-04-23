import React from 'react';

interface DataItemProps {
  title: string;
  value: string | number;
}

const DataItem: React.FC<DataItemProps> = ({ title, value }) => {
  return (
    <div className="flex py-3">
      <div className="w-32 text-sm">{title}</div>
      <div className='  '>{value}</div>
    </div>
  );
};

export { DataItem };
