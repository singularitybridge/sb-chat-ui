import { types, flow, Instance } from 'mobx-state-tree';
import { Session } from './Session';
import { getActiveSession, changeSessionAssistant, endSession } from '../../services/api/sessionService';

const SessionStore = types
  .model({
    activeSession: types.maybeNull(Session),
    activeDialog: types.optional(types.string, ''),    
    isApiKeyMissing: types.optional(types.boolean, false)
  })
  .actions((self) => ({
    fetchActiveSession: flow(function* () {
      try {
        const response = yield getActiveSession();        
        if (response && response._id && response.assistantId) {
          self.activeSession = Session.create(response);
          self.isApiKeyMissing = false;
        } else if (response && response.keyMissing) {
          self.isApiKeyMissing = true;
          self.activeSession = null;
          console.log(response.message || 'API key is missing');
        } else {
          console.error('Unexpected response format', response);
          self.activeSession = null;
        }
      } catch (error: any) {
        console.error('Failed to fetch active session', error);
        self.activeSession = null;
        if (error.response && error.response.status >= 400) {
          console.log(`Error fetching active session: ${error.response.data.message || error.message}`);
        }
      }
    }),

    changeAssistant: flow(function* (assistantId: string) {
      if (!self.activeSession) {
        console.error('No active session to change assistant');
        return;
      }
      try {
        const updatedSession = yield changeSessionAssistant(self.activeSession._id, assistantId);
        self.activeSession.assistantId = updatedSession.assistantId;
      } catch (error) {
        console.error('Failed to change assistant', error);
      }
    }),

    endActiveSession: flow(function* () {
      if (!self.activeSession) {
        console.error('No active session to end');
        return;
      }
      try {
        yield endSession(self.activeSession._id);
        self.activeSession = null;
      } catch (error) {
        console.error('Failed to end session', error);
      }
    }),

    clearActiveSession() {
      self.activeSession = null;
    },

    showDialog(dialogName: string) {
      self.activeDialog = dialogName;
    },

    isDialogOpen(dialogName: string) {
      return self.activeDialog === dialogName;
    }

  }));

export interface ISessionStore extends Instance<typeof SessionStore> {}
export { SessionStore };
