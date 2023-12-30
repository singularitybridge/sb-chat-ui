import { FieldConfig } from '../../components/DynamicForm';

export const assistantFieldConfigs: FieldConfig[] = [
  {
    id: 'assistantId',
    label: 'Assistant ID',
    key: 'assistantId',
    type: 'input',
    value: '-',
    visibility: { create: false, view: true, update: true },
  },
  {
    id: 'name',
    label: 'Name',
    key: 'name',
    type: 'input',
    value: 'New Assistant',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'description',
    key: 'description',
    label: 'Description',
    type: 'textarea',
    value: 'New Assistant Description',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'introMessage',
    key: 'introMessage',
    label: 'Intro Message',
    type: 'input',
    value: 'New Assistant Intro Message',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'voice',
    key: 'voice',
    label: 'Voice',
    type: 'input',
    value: 'Polly.Emma',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'language',
    key: 'language',
    label: 'Language',
    type: 'input',
    value: 'en-US',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'llmModel',
    key: 'llmModel',
    label: 'LLM Model',
    type: 'input',
    value: 'gpt-3.5-turbo-1106',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'llmPrompt',
    key: 'llmPrompt',
    label: 'LLM Prompt',
    type: 'textarea',
    value:
      'You are chatting with an AI assistant. The assistant is helpful, creative, clever, and very friendly.',
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
