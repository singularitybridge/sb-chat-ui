import { create } from 'zustand';
import {
  getTeams,
  addTeam,
  updateTeam,
  deleteTeam,
  assignAssistantToTeam,
  removeAssistantFromTeam,  
} from '../services/api/teamService';
import { ITeam } from './models/Team';
import { logger } from '../services/LoggingService';

// Use MST model type instead of defining our own
export type Team = ITeam;

interface TeamStoreState {
  teams: Team[];
  teamsLoaded: boolean;
  isLoading: boolean;
  
  // Actions
  loadTeams: () => Promise<void>;
  addTeam: (teamData: Partial<Team>) => Promise<Team>;
  createTeam: (teamData: Partial<Team>) => Promise<Team>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  assignAssistant: (teamId: string, assistantId: string) => Promise<void>;
  removeAssistant: (teamId: string, assistantId: string) => Promise<void>;
  
  // Getters
  getTeamById: (id: string) => Team | undefined;
  getTeamsByCompany: (companyId: string) => Team[];
}

export const useTeamStore = create<TeamStoreState>((set, get) => ({
  teams: [],
  teamsLoaded: false,
  isLoading: false,
  
  loadTeams: async () => {
    set({ isLoading: true });
    try {
      const teams = await getTeams();
      set({ 
        teams: teams || [], 
        teamsLoaded: true,
        isLoading: false 
      });
    } catch (error) {
      logger.error('Failed to load teams', error);
      set({ teamsLoaded: true, isLoading: false });
      throw error;
    }
  },
  
  addTeam: async (teamData) => {
    set({ isLoading: true });
    try {
      // Convert partial data to required format for API
      const dataForAPI = teamData as ITeam;
      const newTeam = await addTeam(dataForAPI);
      set(state => ({
        teams: [...state.teams, newTeam],
        isLoading: false
      }));
      return newTeam;
    } catch (error) {
      logger.error('Failed to add team', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  createTeam: async (teamData) => {
    set({ isLoading: true });
    try {
      // Convert partial data to required format for API
      const dataForAPI = teamData as ITeam;
      const newTeam = await addTeam(dataForAPI);
      set(state => ({
        teams: [...state.teams, newTeam],
        isLoading: false
      }));
      return newTeam;
    } catch (error) {
      logger.error('Failed to create team', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateTeam: async (teamId, updates) => {
    // Optimistic update
    const previousTeam = get().teams.find(t => t._id === teamId);
    if (previousTeam) {
      set(state => ({
        teams: state.teams.map(t => 
          t._id === teamId ? { ...t, ...updates } : t
        )
      }));
    }
    
    set({ isLoading: true });
    try {
      // Convert partial updates to required format for API
      const updatesForAPI = updates as ITeam;
      const updatedTeam = await updateTeam(teamId, updatesForAPI);
      set(state => ({
        teams: state.teams.map(t => 
          t._id === teamId ? updatedTeam : t
        ),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to update team', error);
      // Rollback on error
      if (previousTeam) {
        set(state => ({
          teams: state.teams.map(t => 
            t._id === teamId ? previousTeam : t
          ),
          isLoading: false
        }));
      }
      throw error;
    }
  },
  
  deleteTeam: async (teamId) => {
    set({ isLoading: true });
    try {
      await deleteTeam(teamId);
      set(state => ({
        teams: state.teams.filter(t => t._id !== teamId),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to delete team', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  assignAssistant: async (teamId, assistantId) => {
    set({ isLoading: true });
    try {
      await assignAssistantToTeam(teamId, assistantId);
      set({ isLoading: false });
      // The assistant store should be updated separately
    } catch (error) {
      logger.error('Failed to assign assistant to team', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  removeAssistant: async (teamId, assistantId) => {
    set({ isLoading: true });
    try {
      await removeAssistantFromTeam(teamId, assistantId);
      set({ isLoading: false });
      // The assistant store should be updated separately
    } catch (error) {
      logger.error('Failed to remove assistant from team', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  getTeamById: (id) => {
    return get().teams.find(t => t._id === id);
  },
  
  getTeamsByCompany: (companyId) => {
    return get().teams.filter(t => t.companyId === companyId);
  },
}));
