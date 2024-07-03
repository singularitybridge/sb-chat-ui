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
  {
    id: 'token',
    key: 'token',
    label: 'Token',
    type: 'token-input',
    value: '************',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'api_keys',
    key: 'api_keys',
    label: 'API Keys',
    type: 'api-key-list',
    value: [
      {
        key: 'openai_api_key',
        value: '-',
      },
      {
        key: 'gcp_key',
        value: '-',
      },
      {
        key: 'notion_api_key',
        value: '-',
      },
      {
        key: 'labs11_api_key',
        value: '-',
      },
      {
        key: 'twilio_account_sid',
        value: '-',
      },
      {
        key: 'twilio_auth_token',
        value: '-',
      },
    ],
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
