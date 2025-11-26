import { types, flow, applySnapshot, Instance } from 'mobx-state-tree';
import { toJS } from 'mobx';
import { Assistant, IAssistant } from './Assistant';
import { Team, ITeam } from './Team';
import {
  addAssistant,
  deleteAssistant,
  getAssistants,
  updateAssistant,
} from '../../services/api/assistantService';
import {
  getTeams,
  addTeam,
  updateTeam,
  deleteTeam,
  assignAssistantToTeam,
  removeAssistantFromTeam,
  getTeamAssistants,
} from '../../services/api/teamService';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_CLOSE_MODAL,
  EVENT_ERROR,
  EVENT_SHOW_NOTIFICATION,
  EVENT_SHOW_ONBOARDING_MODAL,
} from '../../utils/eventNames';
import { Company, ICompany } from './Company';
import {
  addCompany,
  deleteCompany,
  getCompany,
  refreshCompanyToken,
  updateCompany,
} from '../../services/api/companyService';

import { IUser, User } from './User';
import {
  addUser,
  deleteUser,
  getAllUsers,
} from '../../services/api/userService';
// import { SessionStore } from './SessionStore'; // Removed SessionStore import
import { addInboxMessage, addInboxResponse, getInboxMessages } from '../../services/api/inboxService';
import { IInboxSession, InboxSession } from './Inbox';
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
    // sessionStore: types.optional(SessionStore, {}), // Removed sessionStore property
    aiAssistedConfigStore: types.optional(AIAssistedConfigStore, {}),
    inboxSessions: types.array(InboxSession),
    inboxSessionsLoaded: types.optional(types.boolean, false),
    currentUser: types.maybe(types.reference(User)),
    language: types.optional(types.string, 'en'),
    // Add these new properties
    onboardingStatus: types.optional(types.enumeration(Object.values(OnboardingStatus)), OnboardingStatus.CREATED),
    onboardedModules: types.optional(types.array(types.string), []),
    // Teams properties
    teams: types.array(Team),
    teamsLoaded: types.optional(types.boolean, false),
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
    getTeamById: (id: string) => {
      return self.teams.find((team) => team._id === id);
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

        if (self.onboardingStatus !== OnboardingStatus.READY_FOR_ASSISTANTS) {        
          console.log('Showing onboarding modal');                      
          emitter.emit(EVENT_SHOW_ONBOARDING_MODAL, { title: i18n.t('dialogTitles.onboarding') });
        }

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
        
      } catch (error) {
        console.error('Failed to update onboarding status', error);
        emitter.emit(EVENT_ERROR, 'Failed to update onboarding status: ' + (error as Error).message);
      }
    }),

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
        const company: ICompany = yield getCompany();
        return company;
      } catch (error) {
        console.error('Failed to load company', error);
        return null;
      }
    }),

    updateCompany: flow(function* (company: Partial<ICompany>) {
      try {
        // Ensure we're sending the full company information
        const currentCompany = toJS(self.companies[0]);
        const updatedCompanyData = { ...currentCompany, ...company };
        
        console.log('Updating company with data:', JSON.stringify(updatedCompanyData));
        
        const updatedCompany: ICompany = yield updateCompany(updatedCompanyData);
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
        
        // Create a new array of API keys
        const currentApiKeys = toJS(self.activeCompany.api_keys);
        const updatedApiKeys = currentApiKeys
          .filter(key => key.key !== 'openai_api_key')
          .concat([{ key: 'openai_api_key', value: apiKey }]);
        
        // Create a minimal update object with just the ID and API keys
        const updateData = {
          _id: self.activeCompany._id,
          api_keys: updatedApiKeys
        };
        
        // Send the update to the server with a type assertion to bypass type checking
        const updatedCompany: ICompany = yield updateCompany(updateData as any);
        
        // Update the local state
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
      } catch (error: unknown) {
        console.error('Failed to create user', error);
        emitter.emit(EVENT_ERROR, 'Failed to add user: ' + (error instanceof Error ? error.message : String(error)));
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
        // Handle token properly
        if (newCompany.token && typeof newCompany.token === 'object' && 'value' in newCompany.token) {
          newCompany.token = newCompany.token.value;
        }
        applySnapshot(self.companies, [newCompany]);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.companyCreated')
        );
        emitter.emit(EVENT_CLOSE_MODAL);
        return newCompany;
      } catch (error: unknown) {
        console.error('Failed to create company', error);
        emitter.emit(EVENT_ERROR, 'Failed to add company: ' + (error instanceof Error ? error.message : String(error)));
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
      } catch (error: unknown) {
        console.error('Failed to create assistant', error);
        emitter.emit(EVENT_ERROR, 'Failed to add assistant: ' + (error instanceof Error ? error.message : String(error)));
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

    getAssistantById: (identifier: string) => {
      console.log('getAssistantById called with:', identifier);
      console.log('Available assistants:', self.assistants.map(a => ({ _id: a._id, name: a.name })));
      
      // First try to find by name if the identifier doesn't look like an ObjectID
      const isObjectId = /^[a-f\d]{24}$/i.test(identifier);
      console.log('Is ObjectID format:', isObjectId);
      
      if (!isObjectId) {
        // Try to find by name first (for URL routing)
        const byName = self.assistants.find((assistant) => assistant.name === identifier);
        console.log('Found by name:', byName);
        if (byName) return byName;
      }
      
      // Fallback to finding by _id (works for both ObjectIDs and as a fallback)
      const byId = self.assistants.find((assistant) => assistant._id === identifier);
      console.log('Found by _id:', byId);
      return byId;
    },

    // Team-related actions
    loadTeams: flow(function* () {
      try {
        const teams = yield getTeams();
        applySnapshot(self.teams, teams);
        self.teamsLoaded = true;
      } catch (error) {
        console.error('Failed to load teams', error);
      }
    }),

    createTeam: flow(function* (team: Omit<ITeam, '_id'>) {
      try {
        const newTeam = yield addTeam(team);
        self.teams.push(newTeam);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.teamCreated') || 'Team created successfully'
        );
        emitter.emit(EVENT_CLOSE_MODAL);
        return newTeam;
      } catch (error: unknown) {
        console.error('Failed to create team', error);
        emitter.emit(EVENT_ERROR, 'Failed to add team: ' + (error instanceof Error ? error.message : String(error)));
        return null;
      }
    }),

    updateTeam: flow(function* (id: string, team: ITeam) {
      try {
        const updatedTeam = yield updateTeam(id, team);
        const index = self.teams.findIndex((t) => t._id === id);
        if (index !== -1) {
          self.teams[index] = updatedTeam;
        }
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.teamUpdated') || 'Team updated successfully'
        );
        return updatedTeam;
      } catch (error) {
        console.error('Failed to update team', error);
        emitter.emit(EVENT_ERROR, 'Failed to update team: ' + (error as Error).message);
        return null;
      }
    }),

    deleteTeam: flow(function* (id: string) {
      try {
        yield deleteTeam(id);
        const index = self.teams.findIndex((team) => team._id === id);
        if (index !== -1) {
          self.teams.splice(index, 1);
        }
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.teamDeleted') || 'Team deleted successfully'
        );
      } catch (error) {
        console.error('Failed to delete team', error);
        emitter.emit(EVENT_ERROR, 'Failed to delete team: ' + (error as Error).message);
      }
    }),

    assignAssistantToTeam: flow(function* (teamId: string, assistantId: string) {
      try {
        yield assignAssistantToTeam(teamId, assistantId);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.assistantAssignedToTeam') || 'Assistant assigned to team successfully'
        );
      } catch (error) {
        console.error('Failed to assign assistant to team', error);
        emitter.emit(EVENT_ERROR, 'Failed to assign assistant to team: ' + (error as Error).message);
      }
    }),

    removeAssistantFromTeam: flow(function* (teamId: string, assistantId: string) {
      try {
        yield removeAssistantFromTeam(teamId, assistantId);
        emitter.emit(
          EVENT_SHOW_NOTIFICATION,
          i18n.t('Notifications.assistantRemovedFromTeam') || 'Assistant removed from team successfully'
        );
      } catch (error) {
        console.error('Failed to remove assistant from team', error);
        emitter.emit(EVENT_ERROR, 'Failed to remove assistant from team: ' + (error as Error).message);
      }
    }),

    loadAssistantsByTeam: flow(function* (teamId: string) {
      try {
        const assistants: IAssistant[] = yield getTeamAssistants(teamId);
        return assistants;
      } catch (error) {
        console.error('Failed to load team assistants', error);
        emitter.emit(EVENT_ERROR, 'Failed to load team assistants: ' + (error as Error).message);
        return [];
      }
    }),
  }));

export interface IRootStore extends Instance<typeof RootStore> { }
export { RootStore };
