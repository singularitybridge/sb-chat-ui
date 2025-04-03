import { FieldConfig } from '../../components/DynamicForm';
import { SelectListOption } from '../../components/sb-core-ui-kit/SelectList';
import { TagsInput } from '../../components/TagsInput';
import apiCaller from '../../services/AxiosService';

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
  { value: 'o3-mini-low', label: 'GPT o3 Mini (low)' },
  { value: 'o3-mini-medium', label: 'GPT o3 Mini (medium)' },
  { value: 'o3-mini-high', label: 'GPT o3 Mini (high)' },
];

interface ActionParameter {
  type: string;
  description: string;
}

interface ActionParameters {
  type: string;
  properties: {
    [key: string]: ActionParameter;
  };
  required?: string[];
}

export interface ActionOption {
  id: string;
  name: string;
  title: string;
  description: string;
  iconName: string;
  serviceName: string;
  category: string;
  value: string;
  label: string;
  parameters: ActionParameters;
}

export type TagType = ActionOption;

// Cache for storing fetched action options
const actionOptionsCache: Record<string, ActionOption[]> = {};

/**
 * Fetches allowed action options from the server for a given language.
 * Uses caching to avoid unnecessary API calls.
 * 
 * @param language - The language code for which to fetch action options
 * @returns A promise that resolves to an array of ActionOption objects
 */
export const fetchAllowedActionOptions = async (language: string = 'en'): Promise<ActionOption[]> => {
  if (actionOptionsCache[language]) {
    return actionOptionsCache[language];
  }

  try {
    const response = await apiCaller.get<any[]>(`/integrations/discover?language=${language}`);
    const actionOptions = response.data.map((action: any) => ({
      id: action.id,
      name: action.actionTitle,
      title: action.actionTitle,
      description: action.description,
      iconName: action.icon,
      serviceName: action.serviceName,
      category: action.serviceName,
      value: action.id,
      label: action.actionTitle,
      parameters: action.parameters || { type: 'object', properties: {}, required: [] }
    }));

    actionOptionsCache[language] = actionOptions;
    return actionOptions;
  } catch (error) {
    console.error('Error fetching allowed action options:', error);
    return [];
  }
};

/**
 * Asynchronously generates the assistant field configurations.
 * This function fetches the allowed action options from the server based on the specified language.
 * 
 * @param language - The language code to use for fetching action options (default: 'en')
 * @returns A promise that resolves to an array of FieldConfig objects
 */
export const getAssistantFieldConfigs = async (language: string = 'en'): Promise<FieldConfig[]> => {
  const allowedActionOptions = await fetchAllowedActionOptions(language);

  return [
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
      value: language,
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
    {
      id: 'conversationStarters',
      key: 'conversationStarters',
      label: 'Conversation Starters',
      type: 'key-value-list',
      value: [],
      visibility: { create: true, view: true, update: true },
    },
  ];
};

/**
 * Default assistant field configurations without server-fetched action options.
 * This can be used as a fallback when async loading is not possible or during initial renders.
 */
export const defaultAssistantFieldConfigs: FieldConfig[] = [
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
    value: 'en',
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
      availableTags: [],
      selectedTags: [],
    },
    visibility: { create: true, view: true, update: true },
  },
  {
    id: 'conversationStarters',
    key: 'conversationStarters',
    label: 'Conversation Starters',
    type: 'key-value-list',
    value: [],
    visibility: { create: true, view: true, update: true },
  },
];
