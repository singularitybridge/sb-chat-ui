import { FieldConfig } from '../../components/DynamicForm';

export const companyFieldConfigs: FieldConfig[] = [
  {
    id: 'name',
    label: 'Name',
    key: 'name',
    type: 'input',
    value: 'New Company',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'openai_api_key',
    key: 'openai_api_key',
    label: 'Intro openai_api_key',
    type: 'input',
    value: 'New Assistant Intro Message',
    visibility: { create: true, view: true, update: true },
  },
];
