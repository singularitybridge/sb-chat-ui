import { create } from 'zustand';
import {
  getCompany,
  addCompany,
  updateCompany,
  deleteCompany,
  refreshCompanyToken,
} from '../services/api/companyService';
import { ICompany, IApiKey, IToken, IIdentifier, CompanyKeys as CompanyKeyType } from '../types/entities';
import { logger } from '../services/LoggingService';

// Re-export types for convenience
export type Company = ICompany;
export type ApiKey = IApiKey;
export type Token = IToken;
export type Identifier = IIdentifier;

export const CompanyKeys = {
  name: 'name',
  description: 'description',
  api_keys: 'api_keys',
  identifiers: 'identifiers',
} as const;

interface CompanyStoreState {
  companies: Company[];
  companiesLoaded: boolean;
  isLoading: boolean;
  
  // Actions
  loadCompanies: () => Promise<void>;
  addCompany: (companyData: Partial<Company>) => Promise<Company>;
  updateCompany: (companyId: string, updates: Partial<Company>) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  refreshToken: (companyId: string) => Promise<void>;
  updateCompanyApiKey: (apiKey: string) => Promise<void>;
  
  // Getters
  getCompanyById: (id: string) => Company | undefined;
  updateCompanyLocally: (companyId: string, updates: Partial<Company>) => void;
  activeCompany: Company | undefined;
}

export const useCompanyStore = create<CompanyStoreState>((set, get) => ({
  companies: [],
  companiesLoaded: false,
  isLoading: false,
  
  get activeCompany() {
    return get().companies[0]; // Assuming first company is active
  },
  
  loadCompanies: async () => {
    set({ isLoading: true });
    try {
      const company = await getCompany();
      set({ 
        companies: company ? [company] : [], 
        companiesLoaded: true,
        isLoading: false 
      });
    } catch (error) {
      logger.error('Failed to load companies', error);
      set({ companiesLoaded: true, isLoading: false });
      throw error;
    }
  },
  
  addCompany: async (companyData) => {
    set({ isLoading: true });
    try {
      // Convert partial data to required format for API
      const dataForAPI = companyData as ICompany;
      const newCompany = await addCompany(dataForAPI);
      set(state => ({
        companies: [...state.companies, newCompany],
        isLoading: false
      }));
      return newCompany;
    } catch (error) {
      logger.error('Failed to add company', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateCompany: async (companyId, updates) => {
    set({ isLoading: true });
    try {
      // Convert partial updates to required format for API
      const updatesForAPI = updates as Partial<ICompany>;
      const updatedCompany = await updateCompany(updatesForAPI);
      set(state => ({
        companies: state.companies.map(c => 
          c._id === companyId ? updatedCompany : c
        ),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to update company', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  deleteCompany: async (companyId) => {
    set({ isLoading: true });
    try {
      await deleteCompany();
      set(state => ({
        companies: state.companies.filter(c => c._id !== companyId),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to delete company', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  refreshToken: async (companyId) => {
    set({ isLoading: true });
    try {
      const updatedCompany = await refreshCompanyToken();
      set(state => ({
        companies: state.companies.map(c => 
          c._id === companyId ? updatedCompany : c
        ),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to refresh company token', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateCompanyApiKey: async (apiKey) => {
    const activeCompany = get().activeCompany;
    if (!activeCompany) {
      throw new Error('No active company found');
    }
    
    set({ isLoading: true });
    try {
      // Convert MST array to plain array for manipulation
      const currentApiKeys = activeCompany.api_keys.slice();
      const existingKeyIndex = currentApiKeys.findIndex(k => k.key === 'openai_api_key');
      
      if (existingKeyIndex >= 0) {
        currentApiKeys[existingKeyIndex] = { key: 'openai_api_key', value: apiKey };
      } else {
        currentApiKeys.push({ key: 'openai_api_key', value: apiKey });
      }
      
      // Convert back to MST format for API
      const updatesForAPI = { api_keys: currentApiKeys } as Partial<ICompany>;
      const updatedCompany = await updateCompany(updatesForAPI);
      set(state => ({
        companies: state.companies.map(c => 
          c._id === activeCompany._id ? updatedCompany : c
        ),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to update company API key', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  getCompanyById: (id) => {
    return get().companies.find(c => c._id === id);
  },
  
  updateCompanyLocally: (companyId, updates) => {
    set(state => ({
      companies: state.companies.map(c => 
        c._id === companyId ? { ...c, ...updates } : c
      )
    }));
  },
}));
