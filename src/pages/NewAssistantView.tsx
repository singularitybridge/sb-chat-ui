import React, { useState, useEffect } from 'react';
import {
  DynamicForm,
  FieldConfig,
  FormValues,
  KeyValueListFieldConfig,
} from '../components/DynamicForm';
import { assistantFieldConfigs } from '../store/fieldConfigs/assistantFieldConfigs';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import { IAssistant } from '../store/models/Assistant';
import { useEventEmitter } from '../services/mittEmitter';
import { EVENT_SET_ASSISTANT_VALUES } from '../utils/eventNames';

const NewAssistantView: React.FC = observer(() => {
  const rootStore = useRootStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FieldConfig[]>([]);

  const handleUpdateFormFields = (data: {
    name: string;
    description: string;
    prompt: string;
  }) => {
    setFormFields((prev) => {
      const newFormFields = prev.map((field) => {
        if (field.key === 'name') {
          field.value = data.name;
        } else if (field.key === 'description') {
          field.value = data.description;
        } else if (field.key === 'llmPrompt') {
          field.value = data.prompt;
        }
        return field;
      });
      return newFormFields;
    });
  };

  useEventEmitter<{ name: string; description: string; prompt: string }>(
    EVENT_SET_ASSISTANT_VALUES,
    handleUpdateFormFields
  );

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
    await rootStore.createAssistant(values as unknown as IAssistant);
    setIsLoading(false);
  };
  return (
    <DynamicForm
      formContext="assistantFieldConfigs"
      fields={formFields}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      formType="create"
    />
  );
});

export { NewAssistantView };
