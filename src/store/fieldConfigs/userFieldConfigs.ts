import { FieldConfig } from '../../components/DynamicForm';

export const userFieldConfigs: FieldConfig[] = [
  {
    id: 'name',
    key: 'name',
    label: 'CreateNewUser.name',
    type: 'input',
    value: 'Bob Smith', // Default value for name
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'nickname',
    key: 'nickname',
    label: 'CreateNewUser.nickname',
    type: 'input',
    value: 'Bob', // Default value for nickname
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'identifiers',
    key: 'identifiers',
    label: 'Identifiers',
    type: 'key-value-list',
    value: [
      {
        key: 'phone',
        value: '+972xxxxxxxxx',
      },
    ],
    visibility: { create: true, view: true, update: true },
  },  
];
