/// file_path= src/store/models/SessionStore.ts
import { types, flow, Instance } from 'mobx-state-tree';
import { Session } from './Session';
import { getActiveSession, changeSessionAssistant, endSession } from '../../services/api/sessionService';

const SessionStore = types
  .model({
    activeSession: types.maybeNull(Session),
    activeDialog: types.optional(types.string, ''),
    showOnboarding: types.optional(types.boolean, true)
  })
  .actions((self) => ({
    fetchActiveSession: flow(function* () {
      try {
        const sessionData = yield getActiveSession();
        self.activeSession = Session.create(sessionData);
      } catch (error) {
        console.error('Failed to fetch active session', error);
        self.activeSession = null;
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

    closeDialog() {
      self.activeDialog = '';
    },

    isDialogOpen(dialogName: string) {
      return self.activeDialog === dialogName;
    },

    setShowOnboarding(show: boolean) {
      self.showOnboarding = show;
    },
  }));

export interface ISessionStore extends Instance<typeof SessionStore> {}
export { SessionStore };
