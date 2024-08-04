/// file_path: src/store/models/Assistant.ts
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
  assistantId: types.string,
  name: types.string,
  description: types.string,
  introMessage: types.string,
  companyId: types.string,
  voice: types.string,
  language: types.string,  
  llmModel: types.optional(types.string, ''),
  llmPrompt: types.optional(types.string, ''),
});

type IAssistant = Instance<typeof Assistant>;
type AssistantSnapshotIn = SnapshotIn<typeof Assistant>;
type AssistantSnapshotOut = SnapshotOut<typeof Assistant>;
export type AssistantKeys = keyof IAssistant;

export { Assistant, Identifier };
export type { IAssistant, AssistantSnapshotIn, AssistantSnapshotOut };
