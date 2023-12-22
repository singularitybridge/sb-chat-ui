import React, { ChangeEvent, useState } from "react";
import InputWithLabel from "./admin/InputWithLabel";
import Button from "./core/Button";
import { TextareaWithLabel } from "./admin/TextareaWithLabel";

type FieldType = "input" | "textarea";

export interface FieldConfig {
  type: FieldType;
  label: string;
  value: string;
  id: string;
}

export interface FormValues extends Record<string, string> {}

export interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (values: FormValues) => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ fields, onSubmit }) => {
  const initialState = fields.reduce((acc, field) => {
    acc[field.id] = field.value;
    return acc;
  }, {} as { [key: string]: string });

  const [values, setValues] = useState(initialState);

  const handleChange =
    (id: string) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      setValues({ ...values, [id]: newValue });
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
      {fields.map((field) =>
        field.type === "input" ? (
          <InputWithLabel
            key={field.id}
            id={field.id}
            label={field.label}
            type="text"
            value={values[field.id]}
            onChange={(value) =>
              handleChange(field.id)({
                target: { value },
              } as ChangeEvent<HTMLInputElement>)
            }
          />
        ) : (
          <TextareaWithLabel
            key={field.id}
            id={field.id}
            label={field.label}
            rows={10}
            placeholder="Please enter the prompt"
            value={values[field.id]}
            onChange={(value) =>
              handleChange(field.id)({
                target: { value },
              } as ChangeEvent<HTMLTextAreaElement>)
            }
          />
        )
      )}

      <Button type="submit">Save Changes</Button>
    </form>
  );
};

export { DynamicForm };
