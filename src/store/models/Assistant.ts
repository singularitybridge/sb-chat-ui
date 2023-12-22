import {
  flow,
  types,
  Instance,
  SnapshotIn,
  SnapshotOut,
  getSnapshot,
} from "mobx-state-tree";

const Identifier = types.model("Identifier", {
  _id: types.identifier,
  type: types.string,
  value: types.string,
});

const Assistant = types.model("Assistant", {
  _id: types.identifier,
  assistantId: types.string,
  name: types.string,
  description: types.string,
  introMessage: types.string,
  voice: types.string,
  language: types.string,
  identifiers: types.array(Identifier),
});

type IAssistant = Instance<typeof Assistant>;
type AssistantSnapshotIn = SnapshotIn<typeof Assistant>;
type AssistantSnapshotOut = SnapshotOut<typeof Assistant>;
export type AssistantKeys = keyof IAssistant;


export { Assistant };
export type { IAssistant, AssistantSnapshotIn, AssistantSnapshotOut };
