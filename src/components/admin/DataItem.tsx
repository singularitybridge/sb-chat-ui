import React from 'react';

interface DataItemProps {
  title: React.ReactNode;
  value: React.ReactNode;
}

const DataItem: React.FC<DataItemProps> = ({ title, value }) => {
  return (
    <div className="flex mb-4">
      <div className="mr-4">{title}</div>
      <div>{value}</div>
    </div>
  );
};

export { DataItem };
