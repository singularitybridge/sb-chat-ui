import { FieldConfig } from '../../components/DynamicForm';

export const actionFieldConfigs: FieldConfig[] = [
  {
    id: 'type',
    label: 'CreateNewAction.type',
    key: 'type',
    type: 'input',
    value: 'message',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'name',
    key: 'name',
    label: 'CreateNewAction.name',
    type: 'input',
    value: 'New Action',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'description',
    key: 'description',
    label: 'CreateNewAction.description',
    type: 'input',
    value: 'New Action Description',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'parameters',
    key: 'parameters',
    label: 'CreateNewAction.parameters',
    type: 'textarea',
    value: '',
    visibility: { create: true, view: true, update: true },
  },
];
