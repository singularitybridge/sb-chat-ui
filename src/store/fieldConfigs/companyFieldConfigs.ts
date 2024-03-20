import { FieldConfig } from '../../components/DynamicForm';

export const companyFieldConfigs: FieldConfig[] = [
  {
    id: 'name',
    key: 'name',
    label: 'Name',
    type: 'input',
    value: 'New Company',
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
        label: 'OpenAI API Key',
        value: 'your OpenAI API key here',
      },
      {
        key: 'gcp_key',
        label: 'GCP Key',
        value: 'your GCP key here',
      },
      {
        key: 'notion_api_key',
        label: 'Notion API Key',
        value: 'your Notion API key here',
      },
      {
        key: 'labs11_api_key',
        label: '11Labs API Key',
        value: 'your 11Labs API key here',
      },
      {
        key: 'twilio_account_sid',
        label: 'Twilio Account SID',
        value: 'your Twilio account SID here',
      },
      {
        key: 'twilio_auth_token',
        label: 'Twilio Auth Token',
        value: 'your Twilio auth token here',
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
