import { FieldConfig } from '../../components/DynamicForm';
import { SelectListOption } from '../../components/sb-core-ui-kit/SelectList';
import { TagsInput } from '../../components/InputTags';

const voiceOptions: SelectListOption[] = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' },
];

const languageOptions: SelectListOption[] = [
  { value: 'he', label: 'Hebrew' },
  { value: 'en', label: 'English' },
];

const llmModelOptions: SelectListOption[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'chatgpt-4o-latest', label: 'ChatGPT-4o Latest' },
];

const allowedActionOptions = [
  { id: 'add-user', name: 'Add User' },
  { id: 'remove-user', name: 'Remove User' },
  // Add more actions as needed
];

export const assistantFieldConfigs: FieldConfig[] = [
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
    value: 'This is a new assistant.',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'introMessage',
    key: 'introMessage',
    label: 'Intro Message',
    type: 'input',
    value: 'Hello! How can I help you today?',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'voice',
    key: 'voice',
    label: 'Voice',
    type: 'dropdown',
    value: 'alloy',
    options: voiceOptions,
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'language',
    key: 'language',
    label: 'Language',
    type: 'dropdown',
    value: 'he',
    options: languageOptions,
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'llmModel',
    key: 'llmModel',
    label: 'LLM Model',
    type: 'dropdown',
    value: 'gpt-4o-mini',
    options: llmModelOptions,
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'llmPrompt',
    key: 'llmPrompt',
    label: 'LLM Prompt',
    type: 'textarea',
    value: 'This is a new assistant.',
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'allowedActions',
    key: 'allowedActions',
    label: 'Allowed Actions',
    type: 'tags',
    value: [],
    component: TagsInput,
    props: {
      availableTags: allowedActionOptions,
      selectedTags: [],
    },
    visibility: { create: true, view: true, update: true },
  },
];
