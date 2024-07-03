import { FieldConfig } from '../../components/DynamicForm';

export const assistantFieldConfigs: FieldConfig[] = [
  {
    id: 'assistantId',
    label: 'Assistant ID', // 'Assistant ID
    key: 'assistantId',
    type: 'input',
    value: '-',
    visibility: { create: false, view: true, update: true },
  },
  {
    id: 'name',
    label: 'Name', // 'Name'
    key: 'name',
    type: 'input',
    value: 'New Assistant',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'description',
    key: 'description',
    label: 'Description', // 'Description'
    type: 'textarea',
    value: 'This is a new assistant.',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'introMessage',
    key: 'introMessage',
    label: 'Intro Message', // 'Intro Message'
    type: 'input',
    value: 'Hello! How can I help you today?',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'voice',
    key: 'voice',
    label: 'Voice', // 'Voice'
    type: 'input',
    value: 'Polly.Emma',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'language',
    key: 'language',
    label: 'Language', // 'Language'
    type: 'input',
    value: 'en-US',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'llmModel',
    key: 'llmModel',
    label: 'LLM Model', // 'LLM Model'
    type: 'input',
    value: 'gpt-3.5-turbo-1106',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'llmPrompt',
    key: 'llmPrompt',
    label: 'LLM Prompt', // 'LLM Prompt'
    type: 'textarea',
    value: 'This is a new assistant.',
    visibility: { create: true, view: true, update: true },
  }
];