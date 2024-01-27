import { types, flow, applySnapshot, Instance } from 'mobx-state-tree';
import { Assistant, IAssistant } from './Assistant';
import {
  addAssistant,
  deleteAssistant,
  getAssistants,
  updateAssistant,
} from '../../services/api/assistantService';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_CLOSE_MODAL,
  EVENT_ERROR,
  EVENT_SHOW_NOTIFICATION,
} from '../../utils/eventNames';
import { Company, ICompany } from './Company';
import {
  addCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from '../../services/api/companyService';
import {
  LOCALSTORAGE_COMPANY_ID,
  getLocalStorageItem,
} from '../../services/api/sessionService';
import { IUser, User } from './User';
import {
  addUser,
  deleteUser,
  getAllUsers,
} from '../../services/api/userService';
import { SessionStore } from './SessionStore';
import { getInboxMessages } from '../../services/api/inboxService';
import { InboxSession } from './Inbox';
import { Action, IAction } from './Action';
import {
  addAction,
  deleteAction,
  getActions,
  updateAction,
} from '../../services/api/actionService';

const RootStore = types
  .model('RootStore', {
    assistants: types.array(Assistant),
    companies: types.array(Company),
    companiesLoaded: types.optional(types.boolean, false),
    users: types.array(User),
    assistantsLoaded: types.optional(types.boolean, false),
    sessionStore: types.optional(SessionStore, {}),

    inboxSessions: types.array(InboxSession),
    inboxSessionsLoaded: types.optional(types.boolean, false),

    actions: types.array(Action),
    actionsLoaded: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    loadActions: flow(function* () {
      try {
        const actions = yield getActions();
        applySnapshot(self.actions, actions);
        self.actionsLoaded = true;
      } catch (error) {
        console.error('Failed to load actions', error);
      }
    }),
    addAction: flow(function* (action: IAction) {
      try {
        const newAction = yield addAction(action);
        self.actions.push(newAction);
        emitter.emit(EVENT_SHOW_NOTIFICATION, 'Action added successfully');
        emitter.emit(EVENT_CLOSE_MODAL); // Emit the close modal event
      } catch (error: any) {
        console.error('Failed to add action', error);
        emitter.emit(EVENT_ERROR, 'Failed to add user: ' + error.message);
      }
    }),
    updateAction: flow(function* (actionId: string, action: IAction) {
      try {
        const updatedAction = yield updateAction(actionId, action);
        const index = self.actions.findIndex((act) => act._id === actionId);
        if (index !== -1) {
          self.actions[index] = updatedAction;
          emitter.emit(EVENT_SHOW_NOTIFICATION, 'Action updated successfully');
        }
      } catch (error) {
        console.error('Failed to update action', error);
      }
    }),
    deleteAction: flow(function* (actionId: string) {
      try {
        yield deleteAction(actionId);
        self.actions.replace(
          self.actions.filter((act) => act._id !== actionId)
        );
        emitter.emit(EVENT_SHOW_NOTIFICATION, 'Action deleted successfully');
      } catch (error) {
        console.error('Failed to delete action', error);
      }
    }),

    getActionById: (actionId: string) => {
      return self.actions.find((act) => act._id === actionId);
    },

    loadInboxMessages: flow(function* () {
      try {
        const inboxMessages = yield getInboxMessages(
          self.sessionStore.activeSession?.companyId || ''
        );
        applySnapshot(self.inboxSessions, inboxMessages);
        self.inboxSessionsLoaded = true;
      } catch (error) {
        console.error('Failed to load inboxMessages', error);
      }
    }),

    loadAssistants: flow(function* () {
      try {
        const assistants = yield getAssistants(
          getLocalStorageItem(LOCALSTORAGE_COMPANY_ID) || ''
        );
        applySnapshot(self.assistants, assistants);
        self.assistantsLoaded = true;
      } catch (error) {
        console.error('Failed to load assistants', error);
      }
    }),

    loadCompanies: flow(function* () {
      try {
        const companies = yield getCompanies();
        applySnapshot(self.companies, companies);
        self.companiesLoaded = true; // Set this to true after loading companies
      } catch (error) {
        console.error('Failed to load companies', error);
      }
    }),

    getCompanyById: (_id: string) => {
      return self.companies.find((company) => company._id === _id);
    },
    updateCompany: flow(function* (_id: string, company: ICompany) {
      try {
        const updatedCompany = yield updateCompany(_id, company);
        const index = self.companies.findIndex((comp) => comp._id === _id);
        if (index !== -1) {
          self.companies[index] = updatedCompany;
          emitter.emit(
            EVENT_SHOW_NOTIFICATION,
            'Company has been updated successfully'
          );
        }
      } catch (error) {
        console.error('Failed to update company', error);
      }
    }),

    loadUsers: flow(function* () {
      try {
        const users = yield getAllUsers();
        applySnapshot(self.users, users);
      } catch (error) {
        console.error('Failed to load assistants', error);
      }
    }),

    addUser: flow(function* (user: IUser) {
      try {
        const newUser = yield addUser(user);
        self.users.push(newUser);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          'New user has been created successfully'
        );

        emitter.emit(EVENT_CLOSE_MODAL); // Emit the close modal event
      } catch (error: any) {
        console.error('Failed to create user', error);
        emitter.emit(EVENT_ERROR, 'Failed to add user: ' + error.message);
      }
    }),

    deleteUser: flow(function* (_id: string) {
      try {
        yield deleteUser(_id);
        const index = self.users.findIndex((user) => user._id === _id);
        if (index !== -1) {
          self.users.splice(index, 1);
        }
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          'User has been deleted successfully'
        );
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }),

    addCompany: flow(function* (company: ICompany) {
      try {
        const newCompany = yield addCompany(company);
        self.companies.push(newCompany);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          'New company has been created successfully'
        );
        emitter.emit(EVENT_CLOSE_MODAL); // Emit the close modal event
      } catch (error: any) {
        console.error('Failed to create company', error);
        emitter.emit(EVENT_ERROR, 'Failed to add company: ' + error.message);
      }
    }),

    deleteCompany: flow(function* (_id: string) {
      try {
        yield deleteCompany(_id);
        const index = self.companies.findIndex(
          (company) => company._id === _id
        );
        if (index !== -1) {
          self.companies.splice(index, 1);
        }
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          'Company has been deleted successfully'
        );
      } catch (error) {
        console.error('Failed to delete assistant', error);
      }
    }),

    createAssistant: flow(function* (assistant: IAssistant) {
      try {
        // set companyId to activeSession companyId
        assistant.companyId =
          getLocalStorageItem(LOCALSTORAGE_COMPANY_ID) || '';
        const newAssistant = yield addAssistant(assistant);
        self.assistants.push(newAssistant);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          'New assistant has been created successfully'
        );
        emitter.emit(EVENT_CLOSE_MODAL); // Emit the close modal event
      } catch (error: any) {
        console.error('Failed to create assistant', error);
        emitter.emit(EVENT_ERROR, 'Failed to add assistant: ' + error.message);
      }
    }),

    updateAssistant: flow(function* (_id: string, assistant: IAssistant) {
      try {
        const updatedAssistant = yield updateAssistant(_id, assistant);
        const index = self.assistants.findIndex((ass) => ass._id === _id);

        self.assistants[index] = updatedAssistant;
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          'assistant has been deleted successfully'
        );
      } catch (error) {
        console.error('Failed to update assistant', error);
      }
    }),

    deleteAssistant: flow(function* (_id: string) {
      try {
        yield deleteAssistant(_id);
        const index = self.assistants.findIndex(
          (assistant) => assistant._id === _id
        );
        if (index !== -1) {
          self.assistants.splice(index, 1);
        }
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          'Assistant has been deleted successfully'
        );
      } catch (error) {
        console.error('Failed to delete assistant', error);
      }
    }),

    getAssistantById: (_id: string) => {
      return self.assistants.find((assistant) => assistant._id === _id);
    },
  }));

export interface IRootStore extends Instance<typeof RootStore> {}
export { RootStore };
