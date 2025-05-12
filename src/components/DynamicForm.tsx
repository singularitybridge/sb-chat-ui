import React, { useEffect, useState } from 'react';
import InputWithLabel from './sb-core-ui-kit/InputWithLabel';
import { TextareaWithLabel } from './sb-core-ui-kit/TextareaWithLabel';
import { KeyValue, KeyValueList } from './sb-core-ui-kit/KeyValueList';
import { ApiKey, ApiKeyList } from './ApiKeyList';
import LoadingButton from './core/LoadingButton';
import { AssistantKeys } from '../store/models/Assistant';
import { CompanyKeys } from '../store/models/Company';
import { UserKeys } from '../store/models/User';
import { TeamKeys } from '../store/models/Team';
import TokenInput from './admin/TokenInput';
import { useTranslation } from 'react-i18next';
import { useRootStore } from '../store/common/RootStoreContext';
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
  | 'tags';

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
  | TagsFieldConfig;

export interface FormValues
  extends Record<string, string | number | KeyValue[] | ApiKey[] | string[]> {}

export interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (values: FormValues) => void;
  refreshToken?: (values: FormValues) => void;
  onVerify?: (value: string) => Promise<boolean>;
  isLoading?: boolean;
  formType: 'create' | 'update';
  formContext?: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  onVerify,
  refreshToken,
  isLoading,
  formType,
  formContext = 'common',
}) => {
  const [filteredFields, setFilteredFields] = useState<FieldConfig[]>([]);
  const [values, setValues] = useState<FormValues>({});
  const { t } = useTranslation();
  const rootStore = useRootStore();

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
    refreshToken ? refreshToken(values) : null;
  };

  const handleChange = (
    id: string,
    newValue: string | number | KeyValue[] | ApiKey[] | string[]
  ) => {
    setValues((prevValues) => ({ ...prevValues, [id]: newValue }));
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <form
      className="flex flex-col space-y-4 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {filteredFields.map((field) => {
        const labelKey = `${formContext}.${field.key as string}`;
        const aiConfig = rootStore.aiAssistedConfigStore.getFieldConfig(
          formContext,
          field.id
        );

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
          case 'dropdown':
            return (
              <SelectList
                key={field.id}
                label={t(labelKey)}
                options={(field as DropdownFieldConfig).options}
                onSelect={(value) => handleChange(field.id, value)}
                initialValue={values[field.id] as string | number}
                placeholder={labelKey}
              />
            );
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
          default:
            return (
              <InputWithLabel
                key={field.id}
                type="text"
                label={t(labelKey)}
                id={field.id}
                value={values[field.id] as string}
                onChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
        }
      })}

      <LoadingButton
        additionalClassName="mt-2"
        type="submit"
        isLoading={isLoading || false}
      >
        {t(`${formContext}.save`)}
      </LoadingButton>
    </form>
  );
};

export { DynamicForm };
