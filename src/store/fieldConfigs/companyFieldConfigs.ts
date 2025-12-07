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
      },
      {
        key: 'jira_api_token', // Matches apiKeyName in jira.config.json and getApiKey call
        value: '-',
      },
      {
        key: 'jira_domain', // Matches getApiKey call
        value: '-',
      },
      {
        key: 'jira_email', // Matches getApiKey call
        value: '-',
      },
      {
        key: 'anthropic_api_key',
        value: '-',
      },
      {
        key: 'replicate_api_key',
        value: '-',
      },
      {
        key: 'ai_context_service_base_url',
        value: '-',
      },
      {
        key: 'ai_context_service_auth_token',
        value: '-',
      },
      {
        key: 'codesandbox_api_key',
        value: '-',
      },
      {
        key: 'aws_access_key_id',
        value: '-',
      },
      {
        key: 'aws_secret_access_key',
        value: '-',
      },
      {
        key: 'aws_bedrock_kb_id',
        value: '-',
      },
      {
        key: 'aws_region',
        value: '-',
      },
      {
        key: 'nylas_api_key',
        value: '-',
      },
      {
        key: 'nylas_grant_id',
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
