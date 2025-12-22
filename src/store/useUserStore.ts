import { create } from 'zustand';
import {
  getAllUsers,
  addUser,
  deleteUser,
} from '../services/api/userService';
import { IUser, IIdentifier } from '../types/entities';
import { logger } from '../services/LoggingService';

// Re-export types for convenience
export type User = IUser;
export type Identifier = IIdentifier;

export const UserKeys = {
  name: 'name',
  nickname: 'nickname',
  email: 'email',
  googleId: 'googleId',
  role: 'role',
  companyId: 'companyId',
  identifiers: 'identifiers',
} as const;

interface UserStoreState {
  users: User[];
  usersLoaded: boolean;
  isLoading: boolean;
  
  // Actions
  loadUsers: () => Promise<void>;
  addUser: (userData: Partial<User>) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Getters
  getUserById: (id: string) => User | undefined;
  getUsersByRole: (role: string) => User[];
  getCurrentUser: () => User | undefined;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  users: [],
  usersLoaded: false,
  isLoading: false,
  
  loadUsers: async () => {
    set({ isLoading: true });
    try {
      const users = await getAllUsers();
      set({ 
        users, 
        usersLoaded: true,
        isLoading: false 
      });
    } catch (error) {
      logger.error('Failed to load users', error);
      set({ usersLoaded: true, isLoading: false });
      throw error;
    }
  },
  
  addUser: async (userData) => {
    set({ isLoading: true });
    try {
      // Convert partial data to required format for API
      const dataForAPI = userData as IUser;
      const newUser = await addUser(dataForAPI);
      set(state => ({
        users: [...state.users, newUser],
        isLoading: false
      }));
      return newUser;
    } catch (error) {
      logger.error('Failed to add user', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  deleteUser: async (userId) => {
    set({ isLoading: true });
    try {
      await deleteUser(userId);
      set(state => ({
        users: state.users.filter(u => u._id !== userId),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to delete user', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  getUserById: (id) => {
    return get().users.find(u => u._id === id);
  },
  
  getUsersByRole: (role) => {
    return get().users.filter(u => u.role === role);
  },
  
  getCurrentUser: () => {
    // This could be enhanced to track the current logged-in user
    // For now, returning undefined
    return undefined;
  },
}));
