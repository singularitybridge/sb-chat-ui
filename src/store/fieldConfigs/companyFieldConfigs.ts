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
        key: 'labs11_api_key',
        value: '-',
      },
      {
        key: 'google_api_key',
        value: '-',
      },
      {
        key: 'twilio_api_key',
        value: '-',
      },
      {
        key: 'jsonbin_api_key',
        value: '-',
      },
      {
        key: 'getimg_api_key',
        value: '-',
      },
      {
        key: 'perplexity_api_key',
        value: '-',
      },
      {
        key: 'sendgrid_api_key',
        value: '-',
      },
      {
        key: 'photoroom_api_key',
        value: '-',
      },
      {
        key: 'telegram_bot_api_key',
        value: '-',
      },
      {
        key: 'linear_api_key',
        value: '-',
      },
      {
        key: 'executor_agent_url',
        value: '-',
      },
      {
        key: 'executor_agent_token',
        value: '-',
      }
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
