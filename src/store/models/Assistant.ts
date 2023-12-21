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
type AssistantKeys = keyof IAssistant;

const createDummyInstance = () => {
  return Assistant.create({
    _id: "dummy",
    assistantId: "dummy",
    name: "dummy",
    description: "dummy",
    introMessage: "dummy",
    voice: "dummy",
    language: "dummy",
    identifiers: [],
  });
};

const getFields = (fields: AssistantKeys[]): string[] => {
  const dummyInstance = createDummyInstance();
  const tempSnapshot = getSnapshot(dummyInstance);
  return fields
    .filter((field) => field in tempSnapshot)
    .map((field) => field as string);
};

export { Assistant, getFields };
export type { IAssistant, AssistantSnapshotIn, AssistantSnapshotOut };
