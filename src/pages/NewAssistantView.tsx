import React, { useState, useEffect } from 'react';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  KeyValueListFieldConfig,
} from '../components/DynamicForm';
import { assistantFieldConfigs } from '../store/formConfigs/assistantFormConfigs';

const NewAssistantView: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FieldConfig[]>([]);

  useEffect(() => {
    const initialFormFields = assistantFieldConfigs.map(
      ({ id, key, label, type, visibility, value }) => {
        return {
          id: id,
          key: key,
          label: label,
          value: value,
          type: type,
          visibility: visibility,
        } as KeyValueListFieldConfig;
      }
    );

    setFormFields(initialFormFields);
  }, []); // Empty dependency array ensures this runs only once

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
      formType="create"
    />
  );
};

export { NewAssistantView };
