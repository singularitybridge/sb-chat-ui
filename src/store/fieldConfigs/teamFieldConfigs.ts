import { FieldConfig } from '../../components/DynamicForm';
import i18n from '../../i18n';

export const defaultTeamFieldConfigs: FieldConfig[] = [
  {
    id: 'name',
    key: 'name',
    type: 'input',
    label: 'Name',
    value: '',
    visibility: {
      create: true,
      view: true,
      update: true,
    },
  },
  {
    id: 'description',
    key: 'description',
    type: 'textarea',
    label: 'Description',
    value: '',
    visibility: {
      create: true,
      view: true,
      update: true,
    },
  },
  {
    id: 'icon',
    key: 'icon',
    type: 'input',
    label: 'Icon',
    value: 'Users', // Default icon
    visibility: {
      create: true,
      view: true,
      update: true,
    },
  },
];

export const getTeamFieldConfigs = async (
  language: string = 'en'
): Promise<FieldConfig[]> => {
  // In a real implementation, this might fetch from an API
  // For now, we'll just return the default configs
  return defaultTeamFieldConfigs.map((field) => ({
    ...field,
    label: i18n.t(`teamFieldConfigs.${String(field.key)}`, { lng: language }) || field.label,
  }));
};
