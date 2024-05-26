import React, { useEffect, useState } from 'react';
import InputWithLabel from './admin/InputWithLabel';
import { TextareaWithLabel } from './admin/TextareaWithLabel';
import { KeyValue, KeyValueList } from './KeyValueList';
import { ApiKey, ApiKeyList } from './ApiKeyList';
import LoadingButton from './core/LoadingButton';
import { AssistantKeys } from '../store/models/Assistant';
import { CompanyKeys } from '../store/models/Company';
import { UserKeys } from '../store/models/User';
import { ActionKeys } from '../store/models/Action';
import TokenInput from './admin/TokenInput';
import { useTranslation } from 'react-i18next';

export type FieldType =
  | 'input'
  | 'textarea'
  | 'key-value-list'
  | 'verified-input'
  | 'api-key-list'
  | 'token-input';
export type FormType = 'create' | 'update';

export interface FieldVisibility {
  create: boolean;
  view: boolean;
  update: boolean;
}

export interface BaseFieldConfig {
  id: string;
  key: AssistantKeys | CompanyKeys | UserKeys | ActionKeys;
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

export type FieldConfig =
  | InputFieldConfig
  | TextareaFieldConfig
  | KeyValueListFieldConfig
  | ApiKeysListFieldConfig
  | TokenInputFieldConfig;

export interface FormValues
  extends Record<string, string | KeyValue[] | ApiKey[]> { }

export interface DynamicFormProps {
  fields: FieldConfig[];
  onSubmit: (values: FormValues) => void;
  refreshToken?: (values: FormValues) => void;
  onVerify: (value: string) => Promise<boolean>;
  isLoading?: boolean;
  formType: FormType;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  onSubmit,
  onVerify,
  refreshToken,
  isLoading,
  formType,
}) => {
  const [filteredFields, setFilteredFields] = useState<FieldConfig[]>([]);
  const [values, setValues] = useState<FormValues>({});

  useEffect(() => {
    const newFilteredFields =
      formType === 'create'
        ? fields.filter((field) => field.visibility?.create === true)
        : fields;
    setFilteredFields(newFilteredFields);

    const initialValues: FormValues = {};
    newFilteredFields.forEach((field) => {
      initialValues[field.id] = field.value;
    });

    setValues(initialValues);
  }, [fields, formType]);

  const handleRefreshToken = () => {    
    refreshToken ? refreshToken(values) : null;
  };

  const handleChange = (id: string, newValue: string | KeyValue[]) => {
    setValues((prevValues) => ({ ...prevValues, [id]: newValue }));
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  const { t } = useTranslation();


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      {filteredFields.map((field) => {
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
          case 'api-key-list':
            return (
              <ApiKeyList
                key={field.id}
                title={t('CreateNewCompanyPage.APIKeys.title')}
                description={t('CreateNewCompanyPage.APIKeys.description')}
                initialData={values[field.id] as ApiKey[]}
                onVerify={onVerify}
                onDataChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          case 'key-value-list':
            return (
              <KeyValueList
                key={field.id}
                title="CreateNewCompanyPage.Identifiers.title"
                description="CreateNewCompanyPage.Identifiers.description"
                initialData={(values[field.id] as KeyValue[]) || []}
                onDataChange={(newValue) => handleChange(field.id, newValue)}
              />
            );
          case 'token-input':
            return (
              <TokenInput
                key={field.id}
                label={field.label}
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
          default:
            return (
              <InputWithLabel
                key={field.id}
                type="text"
                label={t(field.label)}
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
        {t('CreateNewCompanyPage.save')}
      </LoadingButton>
    </form>
  );
};

export { DynamicForm };
