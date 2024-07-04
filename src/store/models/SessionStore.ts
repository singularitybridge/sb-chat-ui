// src/store/models/SessionStore.ts
import { types, flow, Instance, applySnapshot, clone } from 'mobx-state-tree';
import { Session } from './Session';
import {
  deleteSession,
  getAllSessions,
  getLocalStorageItem,
  LOCALSTORAGE_COMPANY_ID,
} from '../../services/api/sessionService';

const SessionStore = types
  .model({
    sessions: types.array(Session),
    activeSession: types.maybeNull(Session)
  })
  .actions((self) => ({
    loadSessions: flow(function* () {
      try {
        const sessions = yield getAllSessions(
          getLocalStorageItem(LOCALSTORAGE_COMPANY_ID) || ''
        );
        applySnapshot(self.sessions, sessions);
      } catch (error) {
        
        console.error('Failed to load sessions', error);
      }
    }),

    setActiveSession(session: any) {
      self.activeSession = Session.create(session);
    },
    clearActiveSession() {
      self.activeSession = null;
    },

    setActiveSessionById: (_id: string) => {
      const session = self.sessions.find((session) => session._id === _id);
      if (session) {
        self.activeSession = clone(session);
      } else {
        console.error('Session not found with ID:', _id);
      }
    },

    deleteSession: flow(function* (_id: string) {
      try {
        yield deleteSession(_id);
        const index = self.sessions.findIndex((session) => session._id === _id);
        if (index !== -1) {
          self.sessions[index].active = false;
        }
      } catch (error) {
        console.error('Failed to delete session', error);
      }
    }),
  }));

export interface ISessionStore extends Instance<typeof SessionStore> {}
export { SessionStore };
