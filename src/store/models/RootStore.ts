import { Instance, applySnapshot, flow, types } from "mobx-state-tree";
import { Chatbot } from "./Chatbot";
import { ChatSession } from "./ChatSession";
import { ChatSessionMessage } from "./ChatSessionMessage";
import { ChatSessionStore } from "./ChatSessionStore";

const RootStore = types.model("RootStore", {
    chatbots: types.array(Chatbot),
    // sessions: types.map(ChatSession),
    // messages: types.map(ChatSessionMessage),
    // stores: types.map(ChatSessionStore),
  })
  .actions( (self) => ({
    loadChatbots: flow(function* () {
      try {
        const response = yield fetch('http://127.0.0.1:5000/chatbots');
        const chatbots = yield response.json();
        console.log('got chatbots', chatbots);
        applySnapshot(self.chatbots, chatbots);
      } catch (error) {
        console.error("Failed to load chatbots", error);
      }
    }),
    // ... other actions
  }));

  export interface IRootStore extends Instance<typeof RootStore> {}
  export { RootStore }