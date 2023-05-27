import { Instance, SnapshotIn, SnapshotOut, getParent, types } from "mobx-state-tree";
import { Chatbot } from "./Chatbot";

const ChatSession = types
  .model("ChatSession", {
    _id: types.identifier,
    chatbot_key: types.reference(Chatbot),
    user_id: types.string,
    created_at: types.Date,
    updated_at: types.Date,
    active: types.boolean,
    current_state: types.string,
  })
  .views((self) => ({
    // get chatbot() {
    //   return getParent(self, 2).chatbots.get(self.chatbot_key);
    // },
  }))
  .actions((self) => ({
    // ... actions to manipulate the session
  }));

type IChatSession = Instance<typeof ChatSession>;
type ChatSessionSnapshotIn = SnapshotIn<typeof ChatSession>;
type ChatSessionSnapshotOut = SnapshotOut<typeof ChatSession>;


export { ChatSession };
export type { IChatSession, ChatSessionSnapshotIn, ChatSessionSnapshotOut }
