import { create } from 'zustand';
import { aiAssistedConfigs } from '../configs/aiAssistedConfig';

export interface AIAssistedFieldConfig {
  fieldKey: string;
  systemPrompt: string;
  // Add other AI-related parameters here in the future
}

export interface AIAssistedFormConfig {
  formContext: string;
  fields: AIAssistedFieldConfig[];
}

interface AIAssistedStoreState {
  configs: Map<string, AIAssistedFormConfig>;
  
  // Actions
  initialize: () => void;
  setConfig: (formContext: string, config: AIAssistedFormConfig) => void;
  getConfig: (formContext: string) => AIAssistedFormConfig | undefined;
  getFieldConfig: (formContext: string, fieldKey: string) => AIAssistedFieldConfig | undefined;
}

export const useAIAssistedStore = create<AIAssistedStoreState>((set, get) => ({
  configs: new Map(),
  
  initialize: () => {
    const newConfigs = new Map<string, AIAssistedFormConfig>();
    Object.entries(aiAssistedConfigs).forEach(([key, config]) => {
      newConfigs.set(key, config);
    });
    set({ configs: newConfigs });
  },
  
  setConfig: (formContext, config) => {
    set(state => {
      const newConfigs = new Map(state.configs);
      newConfigs.set(formContext, config);
      return { configs: newConfigs };
    });
  },
  
  getConfig: (formContext) => {
    return get().configs.get(formContext);
  },
  
  getFieldConfig: (formContext, fieldKey) => {
    const formConfig = get().configs.get(formContext);
    return formConfig?.fields.find(field => field.fieldKey === fieldKey);
  },
}));