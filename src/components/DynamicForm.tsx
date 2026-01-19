import React, { useEffect, useState } from 'react';
import InputWithLabel from './sb-core-ui-kit/InputWithLabel';
import { TextareaWithLabel } from './sb-core-ui-kit/TextareaWithLabel';
import { KeyValue, KeyValueList } from './sb-core-ui-kit/KeyValueList';
import { ApiKey, ApiKeyList } from './ApiKeyList';
import LoadingButton from './core/LoadingButton';
import { AssistantKeys, CompanyKeys, UserKeys, TeamKeys } from '../types/entities';
import TokenInput from './admin/TokenInput';
import { useTranslation } from 'react-i18next';
import { useAIAssistedStore } from '../store/useAIAssistedStore';
import { AIAssistedTextareaContainer } from './sb-core-ui-kit/AIAssistedTextareaContainer';
import { SelectList, SelectListOption } from './sb-core-ui-kit/SelectList';
import { TagsInput, TagType } from './TagsInput';

export type FieldType =
  | 'input'
  | 'textarea'
  | 'key-value-list'
  | 'verified-input'
  | 'api-key-list'
  | 'token-input'
  | 'dropdown'
  | 'tags'
  | 'number';

export interface FieldVisibility {
  create: boolean;
  view: boolean;
  update: boolean;
}

export interface BaseFieldConfig {
  id: string;
  key: AssistantKeys | CompanyKeys | UserKeys | TeamKeys | string;
  type: FieldType;
  label: string;
  visibility: FieldVisibility;
}

export interface InputFieldConfig extends BaseFieldConfig {
  type: 'input';
  value: string;
  transform?: (value: string) => string;
  placeholder?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number';
  value: number;
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea';
  value: string;
}

export interface ApiKeysListFieldConfig extends BaseFieldConfig {
  type: 'api-key-list';
  value: ApiKey[];
}

export interface KeyValueListFieldConfig extends BaseFieldConfig {
  type: 'key-value-list';
  value: KeyValue[];
}

export interface TokenInputFieldConfig extends BaseFieldConfig {
  type: 'token-input';
  value: string;
}

export interface DropdownFieldConfig extends BaseFieldConfig {
  type: 'dropdown';
  value: string | number;
  options: SelectListOption[];
  dependsOn?: string;
  optionsByDependency?: Record<string, SelectListOption[]>;
  defaultByDependency?: Record<string, string>;
}

export interface TagsFieldConfig extends BaseFieldConfig {
  type: 'tags';
  value: string[];
  component: typeof TagsInput;
  props: {
    availableTags: TagType[];
    selectedTags: string[];
  };
}

export type FieldConfig =
  | InputFieldConfig
  | TextareaFieldConfig
  | KeyValueListFieldConfig
  | ApiKeysListFieldConfig
  | TokenInputFieldConfig
  | DropdownFieldConfig
  | TagsFieldConfig
  | NumberFieldConfig;

export type FormValues = Record<string, string | number | KeyValue[] | ApiKey[] | string[]>;

export interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (values: FormValues) => void;
  refreshToken?: (values: FormValues) => void;
  onVerify?: (value: string) => Promise<boolean>;
  isLoading?: boolean;
  formType: 'create' | 'update';
  formContext?: string;
  /** Optional form ID for external submit buttons using the form attribute */
  formId?: string;
  /** Hide the built-in submit button (useful when using external submit button) */
  hideSubmitButton?: boolean;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  onVerify,
  refreshToken,
  isLoading,
  formType,
  formContext = 'common',
  formId,
  hideSubmitButton = false,
}) => {
  const [filteredFields, setFilteredFields] = useState<FieldConfig[]>([]);
  const [values, setValues] = useState<FormValues>({});
  const { t } = useTranslation();
  const { getFieldConfig } = useAIAssistedStore();

  useEffect(() => {
    const newFilteredFields =
      formType === 'create'
        ? fields.filter((field) => field.visibility?.create === true)
        : fields;
    setFilteredFields(newFilteredFields);

    const initialValues: FormValues = {};
    newFilteredFields.forEach((field) => {
      if (field.type === 'tags') {
        initialValues[field.id] =
          (field as TagsFieldConfig).props.selectedTags || [];
      } else {
        initialValues[field.id] = field.value;
      }
    });

    setValues(initialValues);
  }, [fields, formType]);

  const handleRefreshToken = () => {
    if (refreshToken) refreshToken(values);
  };

  const handleChange = (
    id: string,
    newValue: string | number | KeyValue[] | ApiKey[] | string[]
  ) => {
    setValues((prevValues) => {
      const newValues = { ...prevValues, [id]: newValue };

      // Check if any other fields depend on this field
      filteredFields.forEach((field) => {
        if (field.type === 'dropdown') {
          const dropdownField = field as DropdownFieldConfig;
          if (dropdownField.dependsOn === id && dropdownField.optionsByDependency) {
            const dependencyValue = String(newValue);
            const availableOptions = dropdownField.optionsByDependency[dependencyValue] || dropdownField.options;
            const currentValue = prevValues[field.id];

            // Check if current value is valid for the new dependency
            const isValueValid = availableOptions.some(
              (opt) => opt.value === currentValue
            );

            // Reset to default if current value is not valid
            if (!isValueValid) {
              const defaultValue = dropdownField.defaultByDependency?.[dependencyValue] ||
                availableOptions[0]?.value ||
                dropdownField.value;
              newValues[field.id] = defaultValue;
            }
          }
        }
      });

      return newValues;
    });
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <form
      id={formId}
      className="flex flex-col space-y-4 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {filteredFields.map((field) => {
        const labelKey = `${formContext}.${field.key as string}`;
        const aiConfig = getFieldConfig(formContext, field.id);

        switch (field.type) {
          case 'textarea':
            return aiConfig ? (
              <AIAssistedTextareaContainer
                key={field.id}
                label={t(labelKey)}
                id={field.id}
                value={values[field.id] as string}
                onChange={(newValue) => handleChange(field.id, newValue)}
                systemPrompt={aiConfig.systemPrompt}
              />
            ) : (
              <TextareaWithLabel
                key={field.id}
                label={t(labelKey)}
                autogrow={true}
                id={field.id}
                value={values[field.id] as string}
                onChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          case 'api-key-list':
            return (
              <ApiKeyList
                key={field.id}
                title={t(`${formContext}.APIKeys.title`)}
                description={t(`${formContext}.APIKeys.description`)}
                initialData={values[field.id] as ApiKey[]}
                allApiKeysConfig={(field as ApiKeysListFieldConfig).value} // Pass the config for all API keys
                onVerify={onVerify || (() => Promise.resolve(true))}
                onDataChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          case 'key-value-list':
            return (
              <KeyValueList
                key={field.id}
                title={t(`${formContext}.identifiers.title`)}
                description={t(`${formContext}.identifiers.description`)}
                initialData={(values[field.id] as KeyValue[]) || []}
                onDataChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          case 'token-input':
            return (
              <TokenInput
                key={field.id}
                label={t(labelKey)}
                id={field.id}
                type="password"
                value={values[field.id] as string}
                onChange={(newValue: string) =>
                  handleChange(field.id, newValue)
                }
                onRefresh={() => {
                  handleRefreshToken();
                }}
              />
            );
          case 'dropdown': {
            const dropdownField = field as DropdownFieldConfig;
            let dropdownOptions = dropdownField.options;
            let selectKey = field.id;

            // If this field depends on another, filter options based on dependency value
            if (dropdownField.dependsOn && dropdownField.optionsByDependency) {
              const dependencyValue = String(values[dropdownField.dependsOn] || '');
              dropdownOptions = dropdownField.optionsByDependency[dependencyValue] || dropdownField.options;
              // Add dependency value to key to force re-render when dependency changes
              selectKey = `${field.id}-${dependencyValue}`;
            }

            // Ensure initialValue is valid - fallback to field default or first option
            let initialValue = values[field.id] as string | number;
            if (initialValue === undefined || initialValue === null || initialValue === '') {
              initialValue = dropdownField.value || dropdownOptions[0]?.value || '';
            }

            return (
              <SelectList
                key={selectKey}
                label={t(labelKey)}
                options={dropdownOptions}
                onSelect={(value) => handleChange(field.id, value)}
                initialValue={initialValue}
                placeholder={t(labelKey)}
              />
            );
          }
          case 'tags': {
            const tagsField = field as TagsFieldConfig;
            return (
              <TagsInput
                key={field.id}
                title={t(labelKey)}
                description={t(`${formContext}.${field.id}_description`)}
                selectedTags={values[field.id] as string[]}
                availableTags={tagsField.props.availableTags}
                onChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          }
          case 'number':
            return (
              <InputWithLabel
                key={field.id}
                type="number"
                label={t(labelKey)}
                id={field.id}
                value={String(values[field.id])} // Ensure value is a string for InputWithLabel
                onChange={(newValue) => handleChange(field.id, Number(newValue))}
              />
            );
          default: {
            const inputField = field as InputFieldConfig;
            return (
              <InputWithLabel
                key={field.id}
                type="text"
                label={t(labelKey)}
                id={field.id}
                value={values[field.id] as string}
                onChange={(newValue) => {
                  const transformedValue = inputField.transform
                    ? inputField.transform(newValue)
                    : newValue;
                  handleChange(field.id, transformedValue);
                }}
              />
            );
          }
        }
      })}

      {!hideSubmitButton && (
        <LoadingButton
          additionalClassName="mt-2"
          type="submit"
          isLoading={isLoading || false}
        >
          {t(`${formContext}.save`)}
        </LoadingButton>
      )}
    </form>
  );
};

export { DynamicForm };
