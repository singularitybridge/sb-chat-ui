import React, { useState } from 'react';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  KeyValueListFieldConfig,
} from '../components/DynamicForm';
import { assistantFieldConfigs } from '../store/formConfigs/assistantFormConfigs';

const NewAssistantView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const formFields: FieldConfig[] = assistantFieldConfigs.map(
    ({ key, type }) => {
      const fieldKeyString = String(key);

      if (type === 'key-value-list') {
        return {
          label:
            fieldKeyString.charAt(0).toUpperCase() + fieldKeyString.slice(1),
          value: [], // KeyValueListFieldConfig requires an array
          id: fieldKeyString,
          type: type,
        } as KeyValueListFieldConfig;
      }

      return {
        label: fieldKeyString.charAt(0).toUpperCase() + fieldKeyString.slice(1),
        value: '', // Set default value to empty string
        id: fieldKeyString,
        type: type,
      };
    }
  );

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
