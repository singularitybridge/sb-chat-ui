import React, { useState, useEffect } from "react";
import InputWithLabel from "../../../components/admin/InputWithLabel";
import Button from "../../../components/core/Button";
import { Select, initTE } from "tw-elements";
import { SelectInput } from "../../../components/admin/SelectInput";
import {
  CloudArrowUpIcon,
  Cog6ToothIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { processorOptions } from "./processorOptions";
import { TextareaWithLabel } from "../../../components/admin/TextareaWithLabel";
import { IconButton } from "../../../components/admin/IconButton";

interface EditChatbotProcessorProps {
  node: any;
  onUpdateProcessor: (updatedProcessor: any) => void;
  onDeleteProcessor: (processorId: string) => void;
  onInsertProcessorAfter: (processorId: string) => void;
}

const EditChatbotProcessor: React.FC<EditChatbotProcessorProps> = ({
  node,
  onUpdateProcessor,
  onDeleteProcessor,
  onInsertProcessorAfter,
}) => {
  const [processorData, setProcessorData] = useState<
    { key: string; value: string }[]
  >([]);
  const [processorName, setProcessorName] = useState<string>("");
  const [title, setTitle] = useState<string>(node.title || ""); // Add this line to keep track of title
  const [focused, setFocused] = useState<number | null>(null);
  const [setupMode, setSetupMode] = useState<boolean>(false);

  const toggleSetupMode = () => {
    setSetupMode(!setupMode);
  };

  useEffect(() => {
    const initialProcessorData = Object.entries(node.processor_data).map(
      ([key, value]) => ({
        key,
        value: value as string,
      })
    );
    setProcessorData(initialProcessorData);
    setProcessorName(node.processor_name);
    setTitle(node.title || ""); // Add this line to update the title state when the node prop changes

    initTE({ Select });
  }, [node]);

  const handleKeyChange = (newValue: string, index: number) => {
    const updatedProcessorData = [...processorData];
    updatedProcessorData[index].key = newValue;
    setProcessorData(updatedProcessorData);
  };

  const handleValueChange = (newValue: string, index: number) => {
    if (newValue !== null) {
      const updatedProcessorData = [...processorData];
      updatedProcessorData[index].value = newValue;
      setProcessorData(updatedProcessorData);
    }
  };

  const addParam = () => {
    const newParam = { key: "new_key", value: "new_value" };
    setProcessorData([...processorData, newParam]);
  };

  const removeParam = (index: number) => {
    setProcessorData(processorData.filter((_, i) => i !== index));
  };

  const handleProcessorChange = (value: string) => {
    // Find the selected processor option
    const selectedProcessorOption = processorOptions.find(
      (option) => option.value === value
    );

    // If the selected processor option has a processor_data preset, apply it
    if (selectedProcessorOption && selectedProcessorOption.processor_data) {
      const presetProcessorData = Object.entries(
        selectedProcessorOption.processor_data
      ).map(([key, value]) => ({ key, value: String(value) })); // Convert value to string

      setProcessorData(presetProcessorData);
    }

    // Update the processorName
    setProcessorName(value);
  };

  const handleSave = () => {
    const updatedProcessorData = Object.fromEntries(
      processorData.map(({ key, value }) => [key, value])
    );
    onUpdateProcessor({
      ...node,
      title, // Add the updated title here
      processor_name: processorName,
      processor_data: updatedProcessorData,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-bold">Edit State Processor</div>
        <IconButton
          icon={<PlusCircleIcon className="w-6 h-6 text-stone-400" />}
          onClick={toggleSetupMode}
        />
        <IconButton
          icon={<TrashIcon className="w-6 h-6 text-stone-400" />}
          onClick={toggleSetupMode}
        />
        <IconButton
          icon={<CloudArrowUpIcon className="w-6 h-6 text-stone-400" />}
          onClick={toggleSetupMode}
        />
        <IconButton
          icon={
            <Cog6ToothIcon
              className={`${
                setupMode
                  ? " w-6 h-6 text-orange-600"
                  : " w-6 h-6 text-stone-400"
              } `}
            />
          }
          onClick={toggleSetupMode}
        />
      </div>

      <SelectInput
        options={processorOptions}
        value={processorName}
        onChange={(value) => handleProcessorChange(value)}
      />

      <InputWithLabel // Input for editing the title
        id="floatingTitle"
        label="Title"
        type="text"
        value={title}
        onChange={(newValue) => setTitle(newValue)}
      />

      {processorData.map(({ key, value }, index) => (
        <div key={key} className={`${setupMode ? "flex space-x-2" : ""}`}>
          {setupMode ? (
            <>
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
              >
                <MinusCircleIcon className="w-6 h-6 text-orange-400" />
              </button>
            </>
          ) : ["text", "prompt", "textarea", "payload", "headers"].includes(key) ? (
            <TextareaWithLabel
              id={`textarea_${key}`}
              label={key}
              rows={10}
              placeholder={"pls enter the prompt"}
              value={value}
              onChange={(updatedPrompt) =>
                handleValueChange(updatedPrompt, index)
              }
            />
          ) : (
            <InputWithLabel
              id="floatingName"
              label={key}
              type="text"
              value={value}
              onChange={(newValue) => handleValueChange(newValue, index)}
            />
          )}
        </div>
      ))}

      <Button onClick={handleSave}>Save</Button>
      <Button onClick={addParam}>Add Param</Button>
      <Button onClick={() => onDeleteProcessor(node._id)}>
        Delete Processor
      </Button>
      <Button onClick={() => onInsertProcessorAfter(node._id)}>
        Insert Processor After
      </Button>
    </div>
  );
};

export { EditChatbotProcessor };
