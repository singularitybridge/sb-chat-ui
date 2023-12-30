import { types, flow, applySnapshot, Instance } from 'mobx-state-tree';
import { Chatbot } from './Chatbot';
import { ChatSession } from './ChatSession';
import { UserProfile } from './UserProfile';
import {
  createChatSession,
  getChatSessions,
  setChatSessionState,
} from '../../services/api/chatSessionService';
import { getChatbots } from '../../services/api/chatbotService';
import { Assistant, IAssistant } from './Assistant';
import { addAssistant, deleteAssistant, getAssistants, updateAssistant } from '../../services/api/assistantService';
import { emitter } from '../../services/mittEmitter';
import { EVENT_ASSISTANT_CREATED, EVENT_ASSISTANT_DELETED, EVENT_ASSISTANT_UPDATED, EVENT_CLOSE_MODAL } from '../../utils/eventNames';

const RootStore = types
  .model('RootStore', {
    /// refactor
    assistants: types.array(Assistant),
    assistantsLoaded: types.optional(types.boolean, false),

    /// old stuff blat
    chatbots: types.array(Chatbot),
    activeChatbot: types.maybe(types.reference(Chatbot)),
    chatbotsLoaded: types.optional(types.boolean, false),
    userProfile: types.maybe(UserProfile),
    chatSessions: types.array(ChatSession),
    chatSessionsLoaded: types.optional(types.boolean, false),
    selectedChatSession: types.maybe(types.reference(ChatSession)),
  })
  .actions((self) => ({
    /// refactor
    loadAssistants: flow(function* () {
      try {
        const assistants = yield getAssistants();        
        applySnapshot(self.assistants, assistants);
        self.assistantsLoaded = true;
      } catch (error) {
        console.error('Failed to load assistants', error);
      }
    }),

    createAssistant: flow(function* (assistant: IAssistant) {
      try {
        const newAssistant = yield addAssistant(assistant);
        self.assistants.push(newAssistant);
        emitter.emit(EVENT_ASSISTANT_CREATED, 'New assistant has been created successfully');
        emitter.emit(EVENT_CLOSE_MODAL); // Emit the close modal event
      } catch (error) {
        console.error('Failed to create assistant', error);
      }
    }),   

    updateAssistant: flow(function* (_id: string, assistant: IAssistant) {
      try {
        const updatedAssistant = yield updateAssistant(_id, assistant);
        const index = self.assistants.findIndex(ass => ass._id === _id);
        
        self.assistants[index] = updatedAssistant;
        emitter.emit(EVENT_ASSISTANT_UPDATED, 'Record has been updated successfully');

      } catch (error) {
        console.error('Failed to update assistant', error);
      }
    }),

    deleteAssistant: flow(function* (_id: string) {
      try {
        yield deleteAssistant(_id);
        const index = self.assistants.findIndex(assistant => assistant._id === _id);
        if (index !== -1) {
          self.assistants.splice(index, 1);
        }
        emitter.emit(EVENT_ASSISTANT_DELETED, 'Record has been deleted successfully');
      } catch (error) {
        console.error('Failed to delete assistant', error);
      }
    }),

    getAssistantById: (_id: string) => {
      return self.assistants.find((assistant) => assistant._id === _id);
    },

    

    /// old stuff blat
    loadChatbots: flow(function* () {
      try {
        const chatbots = yield getChatbots();
        applySnapshot(self.chatbots, chatbots);
        self.chatbotsLoaded = true;
      } catch (error) {
        console.error('Failed to load chatbots', error);
      }
    }),

    loadChatSessions: flow(function* (chatbotKey: string) {
      try {
        const chatSessions = yield getChatSessions(chatbotKey);
        applySnapshot(self.chatSessions, chatSessions);
        self.chatSessionsLoaded = true;
      } catch (error) {
        console.error('Failed to load chat sessions', error);
      }
    }),

    createChatSession: flow(function* () {
      try {
        if (self.userProfile && self.activeChatbot) {
          const chatSession = yield createChatSession({
            user_id: self.userProfile._id,
            chatbot_key: self.activeChatbot.key,
          });
          self.chatSessions.push(chatSession);
        } else {
          console.error(
            'Cannot create chat session without active user and chatbot.',
          );
        }
      } catch (error) {
        console.error('Failed to create chat session', error);
      }
    }),

    setActiveChatSession: (sessionId: string) => {
      const foundSession = self.chatSessions.find(
        (session) => session._id === sessionId,
      );
      if (foundSession) {
        self.selectedChatSession = foundSession;
      }
    },

    setActiveChatbot: (chatbotKey: string) => {
      const chatbot = self.chatbots.find(
        (chatbot) => chatbot.key === chatbotKey,
      );

      if (!chatbot) {
        console.error('Cannot set active chatbot, chatbot not found');
        return;
      }

      self.activeChatbot = chatbot;
    },

    getChatbot: (key: string) => {
      console.log('get chatbot', key);
      return self.chatbots.find((chatbot) => chatbot.key === key);
    },

    setChatSessionState: async (sessionId: string, state: string) => {
      try {
        await setChatSessionState(sessionId, state);
        const session = self.chatSessions.find((s) => s._id === sessionId);
        if (session) {
          session.setState(state);
        }
      } catch (error) {
        console.error(error);
      }
    },
  }));

export interface IRootStore extends Instance<typeof RootStore> {}
export { RootStore };
