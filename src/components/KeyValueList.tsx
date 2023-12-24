import React, { useState } from "react";
import { Input } from "./Input";
import { IconButton } from "./admin/IconButton";
import {
  ArrowUturnLeftIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

export interface KeyValue {
  key: string;
  value: string;
}

interface KeyValueListProps {
  title: string;
  description: string;
  initialData: KeyValue[];
  onDataChange: (data: Record<string, string>) => void; // Add this line
}

const KeyValueList: React.FC<KeyValueListProps> = ({
  title,
  description,
  initialData,
  onDataChange,
}) => {
  const [keyValueData, setKeyValueData] = useState<KeyValue[]>(initialData);

  const constructData = () => {
    const data: Record<string, string> = {};
    keyValueData.forEach(({ key, value }) => {
      data[key] = value;
    });
    onDataChange(data);
  };

  const handleKeyChange = (newValue: string, index: number) => {
    const updatedData = [...keyValueData];
    updatedData[index].key = newValue;
    setKeyValueData(updatedData);
    constructData(); // Add this line
  };

  const handleValueChange = (newValue: string, index: number) => {
    const updatedData = [...keyValueData];
    updatedData[index].value = newValue;
    setKeyValueData(updatedData);
    constructData(); // Add this line
  };

  const addParam = () => {
    setKeyValueData([...keyValueData, { key: "", value: "" }]);
  };

  const removeParam = (index: number) => {
    const updatedData = [...keyValueData];
    updatedData.splice(index, 1);
    setKeyValueData(updatedData);
  };

  const resetToInitialData = () => {
    setKeyValueData(initialData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mt-3">
        <h2 className="text-xl">{title}</h2>
        <div className="space-x-2">
          <IconButton
            icon={<ArrowUturnLeftIcon className="w-6 h-6  text-green-800" />}
            onClick={resetToInitialData}
          />
          <IconButton
            icon={<PlusCircleIcon className="w-6 h-6 text-stone-400" />}
            onClick={addParam}
          />
        </div>
      </div>
      <p className="mb-4 text-sm">{description}</p>
      {keyValueData.map(({ key, value }, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <Input
            id={`key_${index}`}
            value={key}
            onChange={(newValue) => handleKeyChange(newValue, index)}
          />
          <Input
            id={`value_${index}`}
            value={value}
            onChange={(newValue) => handleValueChange(newValue, index)}
          />
          <IconButton
            icon={<MinusCircleIcon className="w-6 h-6 text-orange-400" />}
            onClick={() => removeParam(index)}
          />
        </div>
      ))}
    </div>
  );
};

export { KeyValueList };
