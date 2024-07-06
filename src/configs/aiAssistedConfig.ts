import { AIAssistedFormConfig } from '../store/models/AIAssistedFieldConfig';

export const aiAssistedConfigs: Record<string, AIAssistedFormConfig> = {
  assistantFieldConfigs: {
    formContext: 'assistantFieldConfigs',
    fields: [
      {
        fieldKey: 'name',
        systemPrompt: 'You are an AI assistant naming expert. Suggest a creative and fitting name for an AI assistant based on its description and purpose.',
      },
      {
        fieldKey: 'description',
        systemPrompt: 'You are an AI assistant description expert. Help create a concise and informative description for an AI assistant based on its intended purpose and capabilities.',
      },
      {
        fieldKey: 'introMessage',
        systemPrompt: 'You are an AI communication expert. Craft a friendly and engaging introductory message for an AI assistant to greet users.',
      },
      {
        fieldKey: 'llmPrompt',
        systemPrompt: 'You are an AI prompt engineering expert. Help create an effective system prompt for an AI language model to guide its behavior and responses.',
      },
      // Add more fields as needed
    ],
  },
  // You can add more form contexts here in the future
};