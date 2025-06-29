import { FieldConfig } from '../../components/DynamicForm';
import i18n from '../../i18n';

export const defaultApiKeyFieldConfigs: FieldConfig[] = [
  {
    id: 'name',
    key: 'name',
    type: 'input',
    label: 'Name',
    value: '',
    required: true,
    placeholder: 'Production API Key',
    visibility: {
      create: true,
      view: true,
      update: false,
    },
  },
  {
    id: 'expiresInDays',
    key: 'expiresInDays',
    type: 'dropdown',
    label: 'Expiration',
    value: '365',
    options: [
      { value: '7', label: '7 days' },
      { value: '30', label: '30 days' },
      { value: '90', label: '90 days' },
      { value: '365', label: '1 year' },
    ],
    visibility: {
      create: true,
      view: true,
      update: false,
    },
  },
];

export const getApiKeyFieldConfigs = async (
  language: string = 'en'
): Promise<FieldConfig[]> => {
  return defaultApiKeyFieldConfigs.map((field) => ({
    ...field,
    label: i18n.t(`apiKeyFieldConfigs.${String(field.key)}`, { lng: language }) || field.label,
    placeholder: field.placeholder ? i18n.t(`apiKeyFieldConfigs.${String(field.key)}Placeholder`, { lng: language }) || field.placeholder : undefined,
    options: field.options?.map(option => ({
      ...option,
      label: i18n.t(`apiKeyFieldConfigs.expirationOptions.${option.value}`, { lng: language }) || option.label,
    })),
  }));
};