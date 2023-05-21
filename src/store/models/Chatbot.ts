import { flow, types, Instance, SnapshotIn, SnapshotOut } from "mobx-state-tree";
import { applySnapshot } from 'mobx-state-tree';

const Processor = types.model("Processor", {
  _id: types.identifier,
  processor_data: types.map(types.frozen()),
  processor_name: types.string,
  type: types.string,
});

const State = types.model("State", {
  _id: types.identifier,
  chatbotKey: types.string,
  model: types.string,
  name: types.string,
  prompt: types.maybe(types.string),
  temperature: types.optional(types.number, 0.8),
  processors: types.array(Processor),
});

const Chatbot = types.model("Chatbot", {
  _id: types.identifier,
  key: types.string,
  name: types.string,
  description: types.string,
  namespace: types.string,
  maxTokens: types.integer,
  states: types.array(State),
  avatarImage: types.string,
  backgroundImage: types.string,
}).actions((self) => ({
  load: flow(function* load(chatbotKey) {
    const response = yield window.fetch(`http://127.0.0.1:5000/chatbots/${chatbotKey}`);
    const chatbotData = yield response.json();
    applySnapshot(self, chatbotData);
  }),
  // ... other actions
}));

type IChatbot = Instance<typeof Chatbot>;
type ChatbotSnapshotIn = SnapshotIn<typeof Chatbot>;
type ChatbotSnapshotOut = SnapshotOut<typeof Chatbot>;

export { Chatbot, State, Processor }
export type { IChatbot, ChatbotSnapshotIn, ChatbotSnapshotOut }
