import { FieldConfig } from '../../components/DynamicForm';
import { SelectListOption } from '../../components/sb-core-ui-kit/SelectList';
import { TagsInput } from '../../components/TagsInput';

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
  { value: 'o1-preview', label: 'GPT o1 Preview' },
  { value: 'o1-mini', label: 'GPT o1 Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'chatgpt-4o-latest', label: 'ChatGPT-4o Latest' },
];

const allowedActionOptions = [
  { 
    id: 'getJournalEntries',
    name: 'Get recent journal entries',
    icon: '📅',
    title: 'Fetch Journal Entries',
    description: 'Retrieves the most recent journal entries',
    serviceName: 'Journal Service'
  },
  { 
    id: 'getFriendlyJournalEntries',
    name: 'Get recent journal entries in a friendly format',
    icon: '🤗',
    title: 'Fetch Friendly Journal Entries',
    description: 'Retrieves recent journal entries in a more user-friendly format',
    serviceName: 'Journal Service'
  },
  { 
    id: 'createJournalEntry',
    name: 'Create a journal entry',
    icon: '✍️',
    title: 'Create Journal Entry',
    description: 'Creates a new journal entry',
    serviceName: 'Journal Service'
  },
  { 
    id: 'sendEmail',
    name: 'Send Email',
    icon: '📧',
    title: 'Send an Email',
    description: 'Sends an email to specified recipients',
    serviceName: 'Email Service'
  },
  { 
    id: 'perplexitySearch',
    name: 'Run Perplexity Search',
    icon: '🔍',
    title: 'Perplexity Search',
    description: 'Performs a search using the Perplexity API',
    serviceName: 'Perplexity API'
  },
  { 
    id: 'removeBackground',
    name: 'Remove Background',
    icon: '🖼️',
    title: 'Remove Image Background',
    description: 'Removes the background from an image',
    serviceName: 'Image Processing Service'
  },
  { 
    id: 'fetchIssues',
    name: 'Fetch Linear Issues',
    icon: '🐛',
    title: 'Fetch Linear Issues',
    description: 'Retrieves issues from Linear project management tool',
    serviceName: 'Linear API'
  },
  { 
    id: 'createJSONBinFile',
    name: 'Create JSON Bin File',
    icon: '📁',
    title: 'Create JSON Bin File',
    description: 'Creates a new JSON Bin file',
    serviceName: 'JSON Bin'
  },
  { 
    id: 'updateJSONBinFile',
    name: 'Update JSON Bin File',
    icon: '🔄',
    title: 'Update JSON Bin File',
    description: 'Updates an existing JSON Bin file',
    serviceName: 'JSON Bin'
  },
  { 
    id: 'readJSONBinFile',
    name: 'Read JSON Bin File',
    icon: '👀',
    title: 'Read JSON Bin File',
    description: 'Reads the contents of a JSON Bin file',
    serviceName: 'JSON Bin'
  },
  { 
    id: 'updateJSONBinArrayElement',
    name: 'Update JSON Bin Array Element',
    icon: '🔧',
    title: 'Update JSON Bin Array Element',
    description: 'Updates a specific element in a JSON Bin array',
    serviceName: 'JSON Bin'
  },
  { 
    id: 'deleteJSONBinArrayElement',
    name: 'Delete JSON Bin Array Element',
    icon: '🗑️',
    title: 'Delete JSON Bin Array Element',
    description: 'Deletes a specific element from a JSON Bin array',
    serviceName: 'JSON Bin'
  },
  { 
    id: 'insertJSONBinArrayElement',
    name: 'Insert JSON Bin Array Element',
    icon: '➕',
    title: 'Insert JSON Bin Array Element',
    description: 'Inserts a new element into a JSON Bin array',
    serviceName: 'JSON Bin'
  },
  { 
    id: 'cloneJSONBinFile',
    name: 'Clone JSON Bin File',
    icon: '🐑',
    title: 'Clone JSON Bin File',
    description: 'Creates a copy of an existing JSON Bin file',
    serviceName: 'JSON Bin'
  },
  { 
    id: 'generateFluxImage',
    name: 'Generate Flux Image',
    icon: '🎨',
    title: 'Generate Flux Image',
    description: 'Generates an image using Flux AI',
    serviceName: 'Flux AI'
  },
  { 
    id: 'generateElevenLabsAudio',
    name: 'Generate Eleven Labs Audio',
    icon: '🎵',
    title: 'Generate Eleven Labs Audio',
    description: 'Generates audio using Eleven Labs AI',
    serviceName: 'Eleven Labs'
  },
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
