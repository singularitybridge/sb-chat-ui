export interface AIAssistedFieldConfig {
    fieldKey: string;
    systemPrompt: string;
    // Add other AI-related parameters here in the future
  }
  
  export interface AIAssistedFormConfig {
    formContext: string;
    fields: AIAssistedFieldConfig[];
  }