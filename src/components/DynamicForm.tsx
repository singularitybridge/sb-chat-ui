import React, { useEffect, useState } from 'react';
import InputWithLabel from './admin/InputWithLabel';
import Button from './core/Button';
import { TextareaWithLabel } from './admin/TextareaWithLabel';
import { KeyValue, KeyValueList } from './KeyValueList';

export type FieldType = 'input' | 'textarea' | 'key-value-list';

export interface BaseFieldConfig {
  id: string;
  label: string;
}

export interface InputFieldConfig extends BaseFieldConfig {
  type: 'input';
  value: string;
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea';
  value: string;
}

export interface KeyValueListFieldConfig extends BaseFieldConfig {
  type: 'key-value-list';
  value: KeyValue[];
}

export type FieldConfig =
  | InputFieldConfig
  | TextareaFieldConfig
  | KeyValueListFieldConfig;

export interface FormValues extends Record<string, string | KeyValue[]> {}

export interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (values: FormValues) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fields, onSubmit }) => {
  const [values, setValues] = useState<FormValues>({});

  useEffect(() => {
    const initialValues: FormValues = {};
    fields.forEach((field) => {
      initialValues[field.id] = field.value;
    });

    setValues(initialValues);
  }, [fields]);

  const handleChange = (id: string, newValue: string | KeyValue[]) => {
    setValues((prevValues) => ({ ...prevValues, [id]: newValue }));
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {fields.map((field) => {
        switch (field.type) {
          case 'textarea':
            return (
              <TextareaWithLabel
                key={field.id}
                label={field.label}
                id={field.id}
                value={values[field.id] as string}
                onChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          case 'key-value-list':
            return (
              <KeyValueList
                key={field.id}
                title="Identifiers"
                description="Identifiers are used to connect assistant to external sources"
                initialData={values[field.id] as KeyValue[] || []} 
                onDataChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          default:
            return (
              <InputWithLabel
                key={field.id}
                type="text"
                label={field.label}
                id={field.id}
                value={values[field.id] as string}
                onChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
        }
      })}
      <Button type="submit">Save Changes</Button>
    </form>
  );
};

export { DynamicForm };
