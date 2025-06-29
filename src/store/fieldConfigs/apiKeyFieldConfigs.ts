import { FieldConfig } from '../../components/DynamicForm';
import i18n from '../../i18n';

export const defaultApiKeyFieldConfigs: FieldConfig[] = [
  {
    id: 'name',
    key: 'name',
    type: 'input' as const,
    label: 'Name',
    value: '',
    visibility: {
      create: true,
      view: true,
      update: false,
    },
  },
  {
    id: 'expiresInDays',
    key: 'expiresInDays',
    type: 'dropdown' as const,
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
  return defaultApiKeyFieldConfigs.map((field) => {
    const baseField = {
      ...field,
      label: i18n.t(`apiKeyFieldConfigs.${String(field.key)}`, { lng: language }) || field.label,
    };

    if (field.type === 'dropdown' && 'options' in field) {
      return {
        ...baseField,
        options: field.options.map((option) => ({
          ...option,
          label: i18n.t(`apiKeyFieldConfigs.expirationOptions.${option.value}`, { lng: language }) || option.label,
        })),
      };
    }

    return baseField;
  });
};