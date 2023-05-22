import { Instance, applySnapshot, flow, types } from "mobx-state-tree";
import { Chatbot } from "./Chatbot";
import { ChatSession } from "./ChatSession";
import { ChatSessionMessage } from "./ChatSessionMessage";
import { ChatSessionStore } from "./ChatSessionStore";

const RootStore = types.model("RootStore", {
    chatbots: types.array(Chatbot),
    // activeChatbot: types.maybe(Chatbot),
    activeChatbot: types.maybe(types.reference(Chatbot)), 
    chatbotsLoaded: types.optional(types.boolean, false),  // Add this line

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
        self.chatbotsLoaded = true; // Add this line
      } catch (error) {
        console.error("Failed to load chatbots", error);
      }
    }),
    setActiveChatbot: (chatbot: Instance<typeof Chatbot>) => {
      self.activeChatbot = chatbot;
    },
    // get chatbot by key
    getChatbot: (key: string) => {

      // convert to json
      console.log('try to find chatbot with key', key, self.chatbots.toJSON());
      
      
      return self.chatbots.find((chatbot) => chatbot.key === key);
    },


    // ... other actions
  }));

  export interface IRootStore extends Instance<typeof RootStore> {}
  export { RootStore }