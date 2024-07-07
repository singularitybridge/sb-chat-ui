import { AIAssistedFormConfig } from '../store/models/AIAssistedFieldConfig';

export const aiAssistedConfigs: Record<string, AIAssistedFormConfig> = {
  assistantFieldConfigs: {
    formContext: 'assistantFieldConfigs',
    fields: [
      {
        fieldKey: 'name',
        systemPrompt: 'The name of the AI assistant. It should be catchy, memorable, and reflect the assistant\'s purpose or personality.',
      },
      {
        fieldKey: 'description',
        systemPrompt: 'A brief overview of the AI assistant\'s purpose, capabilities, and key features. This helps users understand what the assistant can do.',
      },
      {
        fieldKey: 'introMessage',
        systemPrompt: 'The first message the AI assistant sends to users. It should be welcoming, set the tone for interaction, and briefly explain how the assistant can help.',
      },
      {
        fieldKey: 'llmPrompt',
        systemPrompt: 'The system prompt that guides the AI\'s behavior and responses. It sets the context and rules for how the AI should interact and what kind of information it should provide.',
      },
      // Add more fields as needed
    ],
  },
  // You can add more form contexts here in the future
};