import { types, Instance } from 'mobx-state-tree';
import { AIAssistedFieldConfig, AIAssistedFormConfig } from './AIAssistedFieldConfig';
import { aiAssistedConfigs } from '../../configs/aiAssistedConfig';

const AIAssistedConfigStore = types
  .model('AIAssistedConfigStore', {
    configs: types.map(types.frozen<AIAssistedFormConfig>()),
  })
  .actions((self) => ({
    initialize() {
      Object.entries(aiAssistedConfigs).forEach(([key, config]) => {
        self.configs.set(key, config);
      });
    },
    setConfig(formContext: string, config: AIAssistedFormConfig) {
      self.configs.set(formContext, config);
    },
    getConfig(formContext: string): AIAssistedFormConfig | undefined {
      return self.configs.get(formContext);
    },
    getFieldConfig(formContext: string, fieldKey: string): AIAssistedFieldConfig | undefined {
      const formConfig = self.configs.get(formContext);
      return formConfig?.fields.find(field => field.fieldKey === fieldKey);
    },
  }));

export interface IAIAssistedConfigStore extends Instance<typeof AIAssistedConfigStore> {}

export { AIAssistedConfigStore };