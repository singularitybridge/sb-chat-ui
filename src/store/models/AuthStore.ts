/// file_path=src/store/models/AuthStore.ts
import { types, flow, getParent } from 'mobx-state-tree';
import { User } from './User';
import { loginWithGoogle } from '../../services/api/authService';
import {
  LOCALSTORAGE_USER_ID,
  LOCALSTORAGE_COMPANY_ID,
  setLocalStorageItem,
  getLocalStorageItem,
} from '../../services/api/sessionService';

export const AuthStore = types
  .model('AuthStore', {
    isAuthenticated: types.optional(types.boolean, false),
    isUserDataLoaded: types.optional(types.boolean, false),
  })
  .actions((self) => ({

    setIsAuthenticated(value: boolean) {
      self.isAuthenticated = value;
    },

    getToken() {
      return localStorage.getItem('userToken');
    },

    checkAuthStatus: flow(function* () {
      const token = localStorage.getItem('userToken');
      self.isAuthenticated = !!token;
      return self.isAuthenticated;
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
    },
  }));
