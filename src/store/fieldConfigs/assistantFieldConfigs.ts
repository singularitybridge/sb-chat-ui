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

// --- Dynamic model fetching from API ---

interface ModelsApiResponse {
  providers: string[];
  models: Record<string, Array<{ id: string; label: string; description: string }>>;
  defaults: Record<string, string>;
}

let modelsCache: ModelsApiResponse | null = null;

/**
 * Fetches available LLM models from the backend API.
 * Cached after first successful fetch.
 */
const fetchModels = async (): Promise<ModelsApiResponse> => {
  if (modelsCache) {
    return modelsCache;
  }

  try {
    const response = await apiCaller.get<ModelsApiResponse>('/api/models');
    modelsCache = response.data;
    return modelsCache;
  } catch (error) {
    console.error('Error fetching models from API, using fallback:', error);
    // Return fallback so the UI still works
    return {
      providers: ['openai', 'google', 'anthropic'],
      models: {
        openai: [
          { id: 'gpt-5.1', label: 'GPT-5.1', description: 'GPT-5.1 model' },
        ],
        google: [
          { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (preview)', description: 'Fast' },
        ],
        anthropic: [
          { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', description: 'Balanced' },
        ],
      },
      defaults: {
        openai: 'gpt-5.1',
        google: 'gemini-3-flash-preview',
        anthropic: 'claude-sonnet-4-5',
      },
    };
  }
};

const toSelectOptions = (
  models: Array<{ id: string; label: string }>,
): SelectListOption[] => {
  return models.map((m) => ({ value: m.id, label: m.label }));
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
 * This function fetches the allowed action options and available models from the server.
 *
 * @param language - The language code to use for fetching action options (default: 'en')
 * @returns A promise that resolves to an array of FieldConfig objects
 */
export const getAssistantFieldConfigs = async (
  language: string = 'en'
): Promise<FieldConfig[]> => {
  const [allowedActionOptions, modelsData] = await Promise.all([
    fetchAllowedActionOptions(language),
    fetchModels(),
  ]);

  // Build model options from API response
  const modelsByProvider: Record<string, SelectListOption[]> = {};
  const allModelOptions: SelectListOption[] = [];

  for (const provider of modelsData.providers) {
    const providerModels = modelsData.models[provider] || [];
    const options = toSelectOptions(providerModels);
    modelsByProvider[provider] = options;
    allModelOptions.push(...options);
  }

  const defaultModelByProvider = modelsData.defaults;

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
      value: defaultModelByProvider['openai'] || 'gpt-5.1',
      options: allModelOptions,
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
 * Default assistant field configurations without server-fetched data.
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
    value: 'gpt-5.1',
    options: [],
    dependsOn: 'llmProvider',
    optionsByDependency: {},
    defaultByDependency: {},
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
