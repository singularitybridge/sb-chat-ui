import { FieldConfig } from '../../components/DynamicForm';

export const companyFieldConfigs: FieldConfig[] = [
  {
    id: 'name',
    key: 'name',
    label: 'Name',
    type: 'input',
    value: 'name',
    visibility: { create: true, view: true, update: true },
  },
];
