import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  loginWithGoogle,
  verifyToken,
} from '../services/api/authService';
import { logger } from '../services/LoggingService';

interface UserSessionInfo {
  userId: string;
  userName: string;
  userRole: string;
  companyId: string;
  companyName: string;
}

interface AuthStoreState {
  isAuthenticated: boolean;
  isUserDataLoaded: boolean;
  userSessionInfo: UserSessionInfo;

  // Computed getter
  isLoggedIn: () => boolean;

  // Actions
  setIsAuthenticated: (value: boolean) => void;
  setUserSessionInfo: (info: Partial<UserSessionInfo>) => void;
  checkAuthStatus: () => Promise<boolean>;
  loadUserSessionInfo: () => Promise<void>;
  authenticate: (credential: string) => Promise<string>;
  logout: () => boolean;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false, // This will be derived from token presence initially
      isUserDataLoaded: false,
      userSessionInfo: {
        userId: '',
        userName: '',
        userRole: '',
        companyId: '',
        companyName: '',
      },
  
  // Computed value
  isLoggedIn: () => {
    const state = get();
    return state.isAuthenticated && state.isUserDataLoaded;
  },
  
  setIsAuthenticated: (value) => {
    set({ isAuthenticated: value });
  },
  
  setUserSessionInfo: (info) => {
    set(state => ({
      userSessionInfo: { ...state.userSessionInfo, ...info }
    }));
  },
  
  checkAuthStatus: async () => {
    const token = localStorage.getItem('userToken');
    const isAuthenticated = !!token;
    // If token exists, but user data isn't loaded, set isAuthenticated to true
    // but rely on loadUserSessionInfo to fully confirm and load data.
    if (isAuthenticated && !get().isUserDataLoaded) {
      set({ isAuthenticated: true });
    } else {
      set({ isAuthenticated });
    }
    return isAuthenticated;
  },
  
  loadUserSessionInfo: async () => {
    try {
      const response = await verifyToken();
      const { user, company } = response;

      set({
        userSessionInfo: {
          userId: user._id || user.id || '',
          userName: user.name,
          userRole: user.role,
          companyId: company._id || company.id || '',
          companyName: company.name,
        },
        isUserDataLoaded: true,
        isAuthenticated: true,
      });
    } catch (error) {
      logger.error('Failed to load user session info', error);
      // Clear the invalid token and reset the auth state
      get().logout();
      throw error;
    }
  },
  
  authenticate: async (credential: string) => {
    try {
      const response = await loginWithGoogle(credential);
      const { user, sessionToken } = response;
      localStorage.setItem('userToken', sessionToken);
      set({ isAuthenticated: true });
      return user.role;
    } catch (error) {
      logger.error('Authentication failed', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('userToken');
    set({
      isAuthenticated: false,
      isUserDataLoaded: false,
      userSessionInfo: {
        userId: '',
        userName: '',
        userRole: '',
        companyId: '',
        companyName: '',
      },
    });
    return true; // Indicate successful logout
  },
}),
    {
      name: 'auth-storage', // unique name for localStorage key
      partialize: (state) => ({
        // isAuthenticated will be re-evaluated by checkAuthStatus based on token
        // We persist userSessionInfo and isUserDataLoaded to quickly restore UI state
        userSessionInfo: state.userSessionInfo,
        isUserDataLoaded: state.isUserDataLoaded,
        isAuthenticated: state.isAuthenticated, // Persist this to avoid flicker if token is present
      }),
      onRehydrateStorage: () => {
        // This function is called when the storage is rehydrated.
        // We can trigger checkAuthStatus here to ensure isAuthenticated is correctly set based on the token.
        return (state) => { // Removed _error parameter
          if (state) {
            // Trigger checkAuthStatus after rehydration
            // This needs to be done carefully to avoid loops if checkAuthStatus itself modifies persisted state
            // For now, we'll rely on AuthManager to call checkAuthStatus
            // state.checkAuthStatus(); // Potentially problematic if checkAuthStatus modifies persisted state directly
          }
        };
      },
    }
  )
);
