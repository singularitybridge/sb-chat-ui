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
import { ApiKey, Company, ICompany, Token } from './Company';
import {
  addCompany,
  deleteCompany,
  getCompany,
  getDecryptedCompanyById,
  refreshCompanyToken,
  updateCompany,
} from '../../services/api/companyService';

import { IUser, User } from './User';
import {
  addUser,
  deleteUser,
  getAllUsers,
} from '../../services/api/userService';
import { SessionStore } from './SessionStore';
import { addInboxMessage, addInboxResponse, getInboxMessages } from '../../services/api/inboxService';
import { IInboxSession, InboxSession } from './Inbox';
import { Action, IAction } from './Action';
import {
  addAction,
  deleteAction,
  getActions,
  updateAction,
} from '../../services/api/actionService';
import i18n from '../../i18n';
import { AIAssistedConfigStore } from './AIAssistedConfigStore';
import { AuthStore } from './AuthStore';
import { getOnboardingStatus, updateOnboardingStatus } from '../../services/api/onboardingService';


// Add this enum
export enum OnboardingStatus {
  CREATED = 'created',
  API_KEY_REQUIRED = 'api_key_required',
  READY_FOR_ASSISTANTS = 'ready_for_assistants',
  USING_BASIC_FEATURES = 'using_basic_features',
  ADVANCED_USER = 'advanced_user',
  EXPERT_USER = 'expert_user'
}

const RootStore = types
  .model('RootStore', {
    authStore: types.optional(AuthStore, {}),
    isInitialDataLoaded: types.optional(types.boolean, false),
    assistants: types.array(Assistant),
    companies: types.array(Company),
    companiesLoaded: types.optional(types.boolean, false),
    users: types.array(User),
    assistantsLoaded: types.optional(types.boolean, false),
    sessionStore: types.optional(SessionStore, {}),
    aiAssistedConfigStore: types.optional(AIAssistedConfigStore, {}),
    inboxSessions: types.array(InboxSession),
    inboxSessionsLoaded: types.optional(types.boolean, false),
    currentUser: types.maybe(types.reference(User)),
    actions: types.array(Action),
    actionsLoaded: types.optional(types.boolean, false),
    language: types.optional(types.string, 'en'),
    // Add these new properties
    onboardingStatus: types.optional(types.enumeration(Object.values(OnboardingStatus)), OnboardingStatus.CREATED),
    onboardedModules: types.optional(types.array(types.string), []),
  })
  .views((self) => ({
    get isAdmin() {
      return self.currentUser?.role === 'Admin';
    },
    get isCompanUser() {
      return self.currentUser?.role === 'CompanyUser';
    },
    get activeCompany() {
      return self.companies[0];
    },
  }))
  .actions((self) => ({
    setInitialDataLoaded() {
      self.isInitialDataLoaded = true;
    },
    
    translate: (key: string) => i18n.t(key),
    setCurrentUser(user: IUser) {
      self.currentUser = user;
    },
    changeLanguage: flow(function* (newLanguage: string) {
      self.language = newLanguage;
      yield i18n.changeLanguage(newLanguage);
      localStorage.setItem('appLanguage', newLanguage);
    }),

    fetchOnboardingStatus: flow(function* () {
      try {
        const { onboardingStatus, onboardedModules } = yield getOnboardingStatus();
        self.onboardingStatus = onboardingStatus;
        self.onboardedModules.replace(onboardedModules);
        
        // Set showOnboarding based on the fetched status
        self.sessionStore.setShowOnboarding(self.onboardingStatus !== OnboardingStatus.READY_FOR_ASSISTANTS);
      } catch (error) {
        console.error('Failed to fetch onboarding status', error);
      }
    }),

    updateOnboardingStatus: flow(function* () {
      try {
        // Update the status on the server
        const { onboardingStatus, onboardedModules } = yield updateOnboardingStatus();

        // Update the local state
        self.onboardingStatus = onboardingStatus;
        self.onboardedModules.replace(onboardedModules);

        emitter.emit(EVENT_SHOW_NOTIFICATION, i18n.t('Notifications.onboardingStatusUpdated'));
      } catch (error) {
        console.error('Failed to update onboarding status', error);
        emitter.emit(EVENT_ERROR, 'Failed to update onboarding status: ' + (error as Error).message);
      }
    }),

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
        emitter.emit(EVENT_SHOW_NOTIFICATION, i18n.t('Notifications.actionCreated'));
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
          emitter.emit(EVENT_SHOW_NOTIFICATION, i18n.t('Notifications.actionUpdated'));
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
        emitter.emit(EVENT_SHOW_NOTIFICATION, i18n.t('Notifications.actionDeleted'));
      } catch (error) {
        console.error('Failed to delete action', error);
      }
    }),

    getActionById: (actionId: string) => {
      return self.actions.find((act) => act._id === actionId);
    },

    loadInboxMessages: flow(function* () {
      try {
        const inboxMessages: IInboxSession[] = yield getInboxMessages();
        applySnapshot(self.inboxSessions, inboxMessages);
        self.inboxSessionsLoaded = true;
      } catch (error) {
        console.error('Failed to load inboxMessages', error);
      }
    }),

    addInboxMessage: flow(function* (sessionId: string, message: string) {
      try {
        const updatedSession: IInboxSession = yield addInboxMessage(sessionId, message);
        const sessionIndex = self.inboxSessions.findIndex(
          (session) => session.sessionId === sessionId
        );
        if (sessionIndex !== -1) {
          applySnapshot(self.inboxSessions[sessionIndex], updatedSession);
        } else {
          self.inboxSessions.push(updatedSession);
        }
        emitter.emit(EVENT_SHOW_NOTIFICATION, i18n.t('Notifications.messageSent'));
      } catch (error) {
        console.error('Failed to add inbox message', error);
        emitter.emit(EVENT_ERROR, 'Failed to send message: ' + (error as Error).message);
      }
    }),

    addInboxResponse: flow(function* (sessionId: string, message: string, inboxMessageId: string) {
      try {
        const updatedSession: IInboxSession = yield addInboxResponse(sessionId, message, inboxMessageId);
        const sessionIndex = self.inboxSessions.findIndex(
          (session) => session.sessionId === sessionId
        );
        if (sessionIndex !== -1) {
          applySnapshot(self.inboxSessions[sessionIndex], updatedSession);
        }
        emitter.emit(EVENT_SHOW_NOTIFICATION, i18n.t('Notifications.responseAdded'));
      } catch (error) {
        console.error('Failed to add inbox response', error);
        emitter.emit(EVENT_ERROR, 'Failed to add response: ' + (error as Error).message);
      }
    }),

    loadAssistants: flow(function* () {
      try {
        const assistants = yield getAssistants();
        applySnapshot(self.assistants, assistants);
        self.assistantsLoaded = true;
      } catch (error) {
        console.error('Failed to load assistants', error);
      }
    }),

    loadCompanies: flow(function* () {
      if (!self.companiesLoaded) {
        try {
          const company = yield getCompany();
          applySnapshot(self.companies, [company]); // Wrap the single company in an array
          self.companiesLoaded = true;
        } catch (error: any) {
          console.error('Failed to load company', error);
          if (error.message === 'OpenAI API key is not set') {
            throw new Error('OpenAI API key is not set. Please configure the API key to use this feature.');
          } else {
            throw error; // Rethrow other errors
          }
        }
      }
    }),

    getCompanyById: flow(function* () {
      try {
        const decryptedCompany: ICompany = yield getDecryptedCompanyById();
        return decryptedCompany;
      } catch (error) {
        console.error('Failed to load decrypted company', error);
        return null;
      }
    }),

    updateCompany: flow(function* (company: Partial<ICompany>) {
      try {
        // Ensure we're sending the full company information
        
        const updatedCompany = yield updateCompany(company);
        applySnapshot(self.companies, [updatedCompany]);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.companyUpdated')
        );
      } catch (error) {
        console.error('Failed to update company', error);
        emitter.emit(EVENT_ERROR, 'Failed to update company: ' + (error as Error).message);
      }
    }),

    refreshToken: flow(function* () {
      try {
        const updatedCompany: ICompany = yield refreshCompanyToken();
        applySnapshot(self.companies, [updatedCompany]);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.tokenRefreshed')
        );
        return updatedCompany;
      } catch (error) {
        console.error('Failed to update company', error);
      }
    }),

    updateCompanyApiKey: flow(function* (apiKey: string) {
      try {
        if (!self.activeCompany) {
          throw new Error('No active company');
        }
        
        const updatedApiKeys = types.array(ApiKey).create(
          self.activeCompany.api_keys.filter(key => key.key !== 'openai_api_key')
        );
        updatedApiKeys.push({ key: 'openai_api_key', value: apiKey });


        console.log('try to update company', updatedApiKeys);
    
        const updatedCompany = yield updateCompany({
          api_keys: updatedApiKeys
        });
    
        applySnapshot(self.companies, [updatedCompany]);
        return updatedCompany;
      } catch (error) {
        console.error('Failed to update company API key', error);
        throw error;
      }
    }),

    loadUsers: flow(function* () {
      try {
        const users = yield getAllUsers();
        applySnapshot(self.users, users);
      } catch (error) {
        console.error('Failed to load users', error);
      }
    }),

    addUser: flow(function* (user: IUser) {
      try {
        const newUser = yield addUser(user);
        self.users.push(newUser);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.userCreated')
        );

        emitter.emit(EVENT_CLOSE_MODAL);
        return newUser;
      } catch (error: any) {
        console.error('Failed to create user', error);
        emitter.emit(EVENT_ERROR, 'Failed to add user: ' + error.message);
        return null;
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
          i18n.t('Notifications.userDeleted')
        );
      } catch (error) {
        console.error('Failed to delete user', error);
      }
    }),

    addCompany: flow(function* (company: ICompany) {
      try {
        const newCompany = yield addCompany(company);
        newCompany.token = newCompany.token.value;
        applySnapshot(self.companies, [newCompany]);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.companyCreated')
        );
        emitter.emit(EVENT_CLOSE_MODAL);
        return newCompany;
      } catch (error: any) {
        console.error('Failed to create company', error);
        emitter.emit(EVENT_ERROR, 'Failed to add company: ' + error.message);
        return null;
      }
    }),

    deleteCompany: flow(function* () {
      try {
        yield deleteCompany();
        applySnapshot(self.companies, []);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.companyDeleted')
        );
      } catch (error) {
        console.error('Failed to delete company', error);
      }
    }),

    createAssistant: flow(function* (assistant: IAssistant) {
      try {
        const newAssistant = yield addAssistant(assistant);
        self.assistants.push(newAssistant);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.agentCreated')
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
          i18n.t('Notifications.agentUpdated')
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
          i18n.t('Notifications.agentDeleted')
        );
      } catch (error) {
        console.error('Failed to delete assistant', error);
      }
    }),

    getAssistantById: (_id: string) => {
      return self.assistants.find((assistant) => assistant._id === _id);
    },

  }));

export interface IRootStore extends Instance<typeof RootStore> { }
export { RootStore };
