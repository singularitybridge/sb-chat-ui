import { types, flow, applySnapshot, Instance } from "mobx-state-tree";
import { Chatbot } from "./Chatbot";
import { ChatSession, IChatSession } from "./ChatSession";
import { ChatSessionMessage } from "./ChatSessionMessage";
import { ChatSessionStore } from "./ChatSessionStore";
import { UserProfile } from "./UserProfile";

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
      const response = yield fetch('http://127.0.0.1:5000/chat_sessions');
      const chatSessions = yield response.json();
  
      const adjustedChatSessions = chatSessions.map((session: IChatSession) => ({
        _id: session._id,
        chatbot_key: session.chatbot_key,
        user_id: session.user_id,
        created_at: new Date(session.created_at),
        updated_at: new Date(session.updated_at),
        active: session.active,
        current_state: session.current_state,
      }));

      applySnapshot(self.chatSessions, adjustedChatSessions);
      self.chatSessionsLoaded = true;
      if(!self.selectedChatSession) {
        self.selectedChatSession = self.chatSessions[0];
      }
    } catch (error) {
      console.error("Failed to load chat sessions", error);
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
