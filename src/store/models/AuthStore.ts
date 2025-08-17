/// file_path: src/store/models/AuthStore.ts
import { types, flow } from 'mobx-state-tree';
import {
  loginWithGoogle,
  verifyToken,
} from '../../services/api/authService';

const UserSessionInfo = types.model('UserSessionInfo', {
  userName: types.optional(types.string, ''),
  userRole: types.optional(types.string, ''),
  companyName: types.optional(types.string, ''),
  companyId: types.optional(types.string, ''),
});

export const AuthStore = types
  .model('AuthStore', {
    isAuthenticated: types.optional(types.boolean, false),
    isUserDataLoaded: types.optional(types.boolean, false),
    userSessionInfo: types.optional(UserSessionInfo, {}),
  })
  .views((self) => ({
    get isLoggedIn() {
      return self.isAuthenticated && self.isUserDataLoaded;
    },
  }))
  .actions((self) => ({
    setIsAuthenticated(value: boolean) {
      self.isAuthenticated = value;
    },

    setUserSessionInfo(info: Partial<typeof self.userSessionInfo>) {
      self.userSessionInfo = { ...self.userSessionInfo, ...info };
    },

    checkAuthStatus() {
      const token = localStorage.getItem('userToken');
      self.isAuthenticated = !!token;
      return self.isAuthenticated;
    },

    loadUserSessionInfo: flow(function* () {
      try {
        const response = yield verifyToken();
        const { user, company } = response;

        self.userSessionInfo = {
          userName: user.name,
          userRole: user.role,
          companyName: company.name,
          companyId: company._id || company.id || '',
        };

        self.isUserDataLoaded = true;
        self.isAuthenticated = true;
      } catch (error) {
        console.error('Failed to load user session info', error);
        (self as any).logout(); // Clear the invalid token and reset the auth state
        throw error;
      }
    }),

    authenticate: flow(function* (credential: string) {
      try {
        const response = yield loginWithGoogle(credential);
        const { user, sessionToken } = response;
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
        companyId: '',
      };
      return true; // Indicate successful logout
    },
  }));
