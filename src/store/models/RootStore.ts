import { types, flow, applySnapshot, Instance } from "mobx-state-tree";
import { Chatbot } from "./Chatbot";
import { ChatSession, IChatSession } from "./ChatSession";
import { ChatSessionMessage } from "./ChatSessionMessage";
import { ChatSessionStore } from "./ChatSessionStore";
import { UserProfile } from "./UserProfile";
import { createChatSession, getChatSessions } from "../../services/api/chatSessionService";

const RootStore = types.model("RootStore", {
  chatbots: types.array(Chatbot),
  activeChatbot: types.maybe(types.reference(Chatbot)),
  chatbotsLoaded: types.optional(types.boolean, false),
  userProfile: types.maybe(UserProfile),
  chatSessions: types.array(ChatSession),
  chatSessionsLoaded: types.optional(types.boolean, false),
  selectedChatSession: types.maybe(types.reference(ChatSession)),
})
.actions((self) => ({
  loadChatbots: flow(function* () {
    try {
      const response = yield fetch('http://127.0.0.1:5000/chatbots');
      const chatbots = yield response.json();
      applySnapshot(self.chatbots, chatbots);
      self.chatbotsLoaded = true;
    } catch (error) {
      console.error("Failed to load chatbots", error);
    }
  }),


  loadChatSessions: flow(function* () {
    try {
      const chatSessions = yield getChatSessions();
      // Adjust chatSessions and apply snapshot...
    } catch (error) {
      console.error("Failed to load chat sessions", error);
    }
  }),
  
  createChatSession: flow(function* () {
    try {
      if (self.userProfile && self.activeChatbot) {
        const chatSession = yield createChatSession({ user_id: self.userProfile._id, chatbot_key: self.activeChatbot.key });
        self.chatSessions.push(chatSession);
      } else {
        console.error("Cannot create chat session without active user and chatbot.");
      }
    } catch (error) {
      console.error("Failed to create chat session", error);
    }
  }),
  


  setSelectedChatSession: (sessionId: string) => {
    const foundSession = self.chatSessions.find(session => session._id === sessionId);
    if(foundSession) {
      self.selectedChatSession = foundSession;
    }
  },

  setActiveChatbot: (chatbot: Instance<typeof Chatbot>) => {
    self.activeChatbot = chatbot;
  },
  getChatbot: (key: string) => {
    return self.chatbots.find((chatbot) => chatbot.key === key);
  },
}));

export interface IRootStore extends Instance<typeof RootStore> {}
export { RootStore };
