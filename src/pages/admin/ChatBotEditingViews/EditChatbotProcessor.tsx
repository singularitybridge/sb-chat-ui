import React, { useState, useEffect } from "react";
import InputWithLabel from "../../../components/admin/InputWithLabel";

interface EditChatbotProcessorProps {
  node: any;
  onUpdateProcessor: (updatedProcessor: any) => void;
}

const EditChatbotProcessor: React.FC<EditChatbotProcessorProps> = ({
  node,
  onUpdateProcessor,
}) => {
  const initialProcessorData = Object.entries(node.processor_data).map(
    ([key, value]) => ({
      key,
      value: value as string,
    })
  );

  const [processorData, setProcessorData] = useState(initialProcessorData);
  const [processorName, setProcessorName] = useState(node.processor_name);
  const [focused, setFocused] = useState<number | null>(null);

  const handleKeyChange = (newValue: string, index: number) => {
    const updatedProcessorData = [...processorData];
    updatedProcessorData[index].key = newValue;
    setProcessorData(updatedProcessorData);
  };

  const handleValueChange = (newValue: string, index: number) => {
    const updatedProcessorData = [...processorData];
    updatedProcessorData[index].value = newValue;
    setProcessorData(updatedProcessorData);
  };

  const addParam = () => {
    const newParam = { key: "new_key", value: "new_value" };
    setProcessorData([...processorData, newParam]);
  };

  const removeParam = (index: number) => {
    setProcessorData(processorData.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedProcessorData = Object.fromEntries(
      processorData.map(({ key, value }) => [key, value])
    );
    onUpdateProcessor({ ...node, processor_data: updatedProcessorData });
  };

  return (
    <div>
      <InputWithLabel
        id="processor_name"
        label="Processor Name"
        type="text"
        value={processorName}
        onChange={(value) => setProcessorName(value)}
      />
      {processorData.map(({ key, value }, index) => (
        <div key={key} className="flex space-x-2">
          <InputWithLabel
            id={`processor_key_${key}`}
            label="Key"
            type="text"
            value={key}
            onChange={(newValue) => handleKeyChange(newValue, index)}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            autoFocus={focused === index}
          />
          <InputWithLabel
            id={`processor_value_${key}`}
            label="Value"
            type="text"
            value={value as string}
            onChange={(newValue) => handleValueChange(newValue, index)}
          />

          <button
            type="button"
            onClick={() => removeParam(index)}
            data-te-ripple-init
            data-te-ripple-color="light"
            className="inline-block text-center w-10 h-10 rounded-full bg-primary p-2 uppercase leading-normal text-white "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path
                fill-rule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
        onClick={handleSave}
      >
        Save
      </button>

      <button
        type="button"
        onClick={addParam}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4 mr-2"
      >
        Add Param
      </button>
    </div>
  );
};

export { EditChatbotProcessor };
