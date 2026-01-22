import { FieldConfig } from '../../components/DynamicForm';
import { SelectListOption } from '../../components/sb-core-ui-kit/SelectList';
import { TagsInput } from '../../components/TagsInput';
import apiCaller from '../../services/AxiosService';

/**
 * Transform function to sanitize name to URL-safe format.
 * Only allows lowercase letters, numbers, and hyphens.
 */
const sanitizeToUrlSafe = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '')     // Remove any non-alphanumeric except hyphens
    .replace(/-+/g, '-')            // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');         // Remove leading/trailing hyphens
};

// Models grouped by provider
const openaiModels: SelectListOption[] = [
  // GPT-5.x family (stable)
  { value: 'gpt-5.2', label: 'GPT-5.2' },
  { value: 'gpt-5', label: 'GPT-5' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  // GPT-4.x family
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
];

const googleModels: SelectListOption[] = [
  // Gemini 3 (preview only - no stable version yet)
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (preview)' },
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (preview)' },
  // Gemini 2.5 (stable)
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
  // Gemini 2.0 (legacy)
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
];

const anthropicModels: SelectListOption[] = [
  // Claude 4.5 (latest)
  { value: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  { value: 'claude-opus-4-5', label: 'Claude Opus 4.5' },
  // Claude 4.1
  { value: 'claude-opus-4-1', label: 'Claude Opus 4.1' },
  // Claude 4
  { value: 'claude-sonnet-4-0', label: 'Claude Sonnet 4' },
  { value: 'claude-opus-4-0', label: 'Claude Opus 4' },
  // Claude 3 (legacy)
  { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
];

// Combined list for fallback
const llmModelOptions: SelectListOption[] = [
  ...openaiModels,
  ...googleModels,
  ...anthropicModels,
];

// Models organized by provider for dependent dropdown
export const modelsByProvider: Record<string, SelectListOption[]> = {
  openai: openaiModels,
  google: googleModels,
  anthropic: anthropicModels,
};

// Default model for each provider
export const defaultModelByProvider: Record<string, string> = {
  openai: 'gpt-4.1-mini',
  google: 'gemini-2.5-flash',
  anthropic: 'claude-sonnet-4-5',
};

const llmProviderOptions: SelectListOption[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'google', label: 'Google' },
  { value: 'anthropic', label: 'Anthropic' },
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
export const fetchAllowedActionOptions = async (
  language: string = 'en'
): Promise<ActionOption[]> => {
  if (actionOptionsCache[language]) {
    return actionOptionsCache[language];
  }

  try {
    const response = await apiCaller.get<any[]>(
      `/integrations/discover?language=${language}`
    );
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
      parameters: action.parameters || {
        type: 'object',
        properties: {},
        required: [],
      },
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
export const getAssistantFieldConfigs = async (
  language: string = 'en'
): Promise<FieldConfig[]> => {
  const allowedActionOptions = await fetchAllowedActionOptions(language);

  return [
    {
      id: 'name',
      label: 'assistantFieldConfigs.name',
      key: 'name',
      type: 'input',
      value: 'new-assistant',
      transform: sanitizeToUrlSafe,
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
      id: 'llmProvider',
      key: 'llmProvider',
      label: 'assistant.llmProvider',
      type: 'dropdown',
      value: 'openai',
      options: llmProviderOptions,
      visibility: { create: true, view: true, update: true },
    },
    {
      id: 'llmModel',
      key: 'llmModel',
      label: 'LLM Model',
      type: 'dropdown',
      value: 'gpt-4.1-mini',
      options: llmModelOptions,
      dependsOn: 'llmProvider',
      optionsByDependency: modelsByProvider,
      defaultByDependency: defaultModelByProvider,
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
      id: 'maxTokens',
      key: 'maxTokens',
      label: 'Max Tokens',
      type: 'number',
      value: 25000,
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
      visibility: { create: false, view: true, update: true },
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
    label: 'assistantFieldConfigs.name',
    key: 'name',
    type: 'input',
    value: 'new-assistant',
    transform: sanitizeToUrlSafe,
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
    id: 'llmProvider',
      key: 'llmProvider',
      label: 'assistant.llmProvider',
      type: 'dropdown',
      value: 'openai',
      options: llmProviderOptions,
      visibility: { create: true, view: true, update: true },
    },
    {
      id: 'llmModel',
      key: 'llmModel',
      label: 'LLM Model',
      type: 'dropdown',
      value: 'gpt-4.1-mini',
      options: llmModelOptions,
      dependsOn: 'llmProvider',
      optionsByDependency: modelsByProvider,
      defaultByDependency: defaultModelByProvider,
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
    id: 'maxTokens',
    key: 'maxTokens',
    label: 'Max Tokens',
    type: 'number',
    value: 25000,
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
    visibility: { create: false, view: true, update: true },
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
