import React, { useState } from 'react';
import { useRootStore } from '../store/common/RootStoreContext';
import { AssistantKeys, IAssistant } from '../store/models/Assistant';
import {
  DynamicForm,
  FieldConfig,
  FieldType,
  FormValues,
  KeyValueListFieldConfig,
} from '../components/DynamicForm';

const NewAssistantView: React.FC = () => {
  const rootStore = useRootStore();
  const [isLoading, setIsLoading] = useState(false);

  const fieldKeys: AssistantKeys[] = [
    'assistantId',
    'name',
    'description',
    'introMessage',
    'voice',
    'language',
    'llmModel',
    'llmPrompt',
    'identifiers',
  ];

  const fieldTypeMap: Partial<Record<AssistantKeys, FieldType>> = {
    assistantId: 'input',
    name: 'input',
    description: 'textarea',
    llmModel: 'input',
    llmPrompt: 'textarea',
    introMessage: 'input',
    voice: 'input',
    language: 'input',
    identifiers: 'key-value-list',
  };

  const formFields: FieldConfig[] = fieldKeys.map((key) => {
    const fieldKeyString = String(key);
    const fieldType = fieldTypeMap[key] || 'input';

    if (fieldType === 'key-value-list') {
      return {
        label: fieldKeyString.charAt(0).toUpperCase() + fieldKeyString.slice(1),
        value: [], // KeyValueListFieldConfig requires an array
        id: fieldKeyString,
        type: fieldType,
      } as KeyValueListFieldConfig;
    }

    return {
      label: fieldKeyString.charAt(0).toUpperCase() + fieldKeyString.slice(1),
      value: '', // Set default value to empty string
      id: fieldKeyString,
      type: fieldType,
    };
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    console.log('values', values);
    // await rootStore.createAssistant(values as unknown as IAssistant);
    setIsLoading(false);
  };

  return (
    <DynamicForm
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
};

export { NewAssistantView };
