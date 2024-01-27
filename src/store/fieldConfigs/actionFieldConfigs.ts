import { FieldConfig } from '../../components/DynamicForm';

export const actionFieldConfigs: FieldConfig[] = [
  {
    id: 'type',
    label: 'Type',
    key: 'type',
    type: 'input',
    value: 'message',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'name',
    key: 'name',
    label: 'Name',
    type: 'input',
    value: 'New Action',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'description',
    key: 'description',
    label: 'Description',
    type: 'input',
    value: 'New Action Description',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'parameters',
    key: 'parameters',
    label: 'Parameters',
    type: 'textarea',
    value: '',
    visibility: { create: true, view: true, update: true },
  },
];
