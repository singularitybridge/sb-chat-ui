import React, { ChangeEvent, useEffect, useState } from "react";
import InputWithLabel from "./admin/InputWithLabel";
import Button from "./core/Button";
import { TextareaWithLabel } from "./admin/TextareaWithLabel";
import { KeyValue, KeyValueList } from "./KeyValueList";
import { Input } from "./Input";

export type FieldType = "input" | "textarea" | "key-value-list";

export const getFieldTypeByKey = (key: string): FieldType => {
  switch (key) {
    case "description":
      return "textarea";
    case "identifiers":
      return "key-value-list";
    default:
      return "input";
  }
};

export interface FieldConfig {
  id: string;
  label: string;
  value: string;
}

export interface FormValues extends Record<string, string> {}

export interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (values: FormValues) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fields, onSubmit }) => {
  const [values, setValues] = useState<FormValues>({});
  const [identifiersData, setIdentifiersData] = useState<KeyValue[]>([]);

  useEffect(() => {
    const initialValues: FormValues = {};
    fields.forEach((field) => {
      initialValues[field.id] = field.value;
      if (field.id === "identifiers" && Array.isArray(field.value)) {
        setIdentifiersData(
          field.value.map(({ key, value }) => ({ key, value }))
        );
      }
    });
    setValues(initialValues);
  }, [fields]);

  const handleIdentifiersDataChange = (data: Record<string, string>) => {
    setIdentifiersData(
      Object.entries(data).map(([key, value]) => ({ key, value }))
    );
  };

  const handleChange = (id: string, newValue: string) => {
    setValues((prevValues) => ({ ...prevValues, [id]: newValue }));
  };

  const handleSubmit = () => {
    const identifiersDataAsRecord = Object.fromEntries(
      identifiersData.map(({ key, value }) => [key, value])
    );

    const updatedValues = {
      ...values,
      identifiers: identifiersDataAsRecord,
    };
    console.log("object", updatedValues);
    onSubmit({});
    // onSubmit(updatedValues);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {fields.map((field) => {
        const fieldType = getFieldTypeByKey(field.id);

        switch (fieldType) {
          case "textarea":
            return (
              <TextareaWithLabel
                label={field.label}
                id={field.id}
                value={values[field.id]}
                onChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          case "key-value-list":
            return (
              <KeyValueList
                title="Identifiers"
                description="Identifiers are used to connect assistant to external sources"
                initialData={identifiersData}
                onDataChange={handleIdentifiersDataChange}
              />
            );
          default:
            return (
              <InputWithLabel
                type="text"
                label={field.label}
                id={field.id}
                value={values[field.id]}
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
