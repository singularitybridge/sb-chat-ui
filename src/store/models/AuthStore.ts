/// file_path: src/store/models/AuthStore.ts
import { types, flow } from 'mobx-state-tree';
import { getToken, loginWithGoogle, verifyToken } from '../../services/api/authService';
import {
  LOCALSTORAGE_USER_ID,
  LOCALSTORAGE_COMPANY_ID,
  setLocalStorageItem,
  getLocalStorageItem,
} from '../../services/api/sessionService';

const UserSessionInfo = types.model('UserSessionInfo', {
  userName: types.optional(types.string, ''),
  userRole: types.optional(types.string, ''),
  companyName: types.optional(types.string, ''),  
});


export const AuthStore = types
  .model('AuthStore', {

    isAuthenticated: types.optional(types.boolean, false),
    isUserDataLoaded: types.optional(types.boolean, false),
    userSessionInfo: types.optional(UserSessionInfo, {}),

  })
  .actions((self) => ({
    setIsAuthenticated(value: boolean) {
      self.isAuthenticated = value;
    },

    setUserSessionInfo(info: Partial<typeof self.userSessionInfo>) {
      self.userSessionInfo = { ...self.userSessionInfo, ...info };
    },

    checkAuthStatus: flow(function* () {
      const token = localStorage.getItem('userToken');
      self.isAuthenticated = !!token;
      return self.isAuthenticated;
    }),

    loadUserSessionInfo: flow(function* () {

      try {

        const response = yield verifyToken();
        const { user, company, decryptedApiKey } = response;

        self.userSessionInfo = {
          userName: user.name,
          userRole: user.role,
          companyName: company.name,
        };

        self.isUserDataLoaded = true;

      } catch (error) {
        console.error('Failed to load user session info', error);
        throw error;
      }

    }),    

    authenticate: flow(function* (credential: string) {
      try {
        const response = yield loginWithGoogle(credential);
        const { user, sessionToken } = response;

        setLocalStorageItem(LOCALSTORAGE_USER_ID, user._id);
        setLocalStorageItem(LOCALSTORAGE_COMPANY_ID, user.companyId);
        localStorage.setItem('userToken', sessionToken);
        self.isAuthenticated = true;
        return user.role;
      } catch (error) {
        console.error('Authentication failed', error);
        throw error;
      }
    }),

    logout() {

      localStorage.removeItem('userToken');

      self.isAuthenticated = false;
      self.isUserDataLoaded = false;
      self.userSessionInfo = {
        userName: '',
        userRole: '',
        companyName: '',
      };
      
    },

  }));