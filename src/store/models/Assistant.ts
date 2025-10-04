import {
  types,
  Instance,
  SnapshotIn,
  SnapshotOut,
} from 'mobx-state-tree';

const Identifier = types.model('Identifier', {
  _id: types.optional(types.identifier, '-'),
  key: types.string,
  value: types.string,
});

const Assistant = types.model('Assistant', {
  _id: types.identifier,  
  name: types.string, // Used for both display and URL routing (must be URL-safe)
  description: types.string,
  companyId: types.string,
  voice: types.string,
  language: types.string,  
  llmModel: types.optional(types.string, ''),
  llmProvider: types.optional(types.string, 'openai'),
  llmPrompt: types.optional(types.string, ''),
  maxTokens: types.optional(types.number, 25000),
  avatarImage: types.optional(types.string, ''),
  allowedActions: types.optional(types.array(types.string), []),
  conversationStarters: types.optional(types.array(Identifier), []),
  teams: types.optional(types.array(types.string), []), // Array of team IDs
});

type IAssistant = Instance<typeof Assistant>;
type AssistantSnapshotIn = SnapshotIn<typeof Assistant>;
type AssistantSnapshotOut = SnapshotOut<typeof Assistant>;
export type AssistantKeys = keyof IAssistant;

export { Assistant, Identifier };
export type { IAssistant, AssistantSnapshotIn, AssistantSnapshotOut };
