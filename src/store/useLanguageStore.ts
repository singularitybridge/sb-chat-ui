import { create } from 'zustand';
import i18n from '../i18n';
import { logger } from '../services/LoggingService';

type Language = 'en' | 'he';

interface LanguageStoreState {
  language: Language;
  
  // Actions
  setLanguage: (language: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageStoreState>((set, get) => ({
  language: 'en',
  
  setLanguage: async (language) => {
    try {
      await i18n.changeLanguage(language);
      set({ language });
      
      // Update document direction for RTL support
      document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
      
      // Store preference - use 'appLanguage' to match i18n.ts
      localStorage.setItem('appLanguage', language);
    } catch (error) {
      logger.error('Failed to change language', error);
      throw error;
    }
  },
  
  toggleLanguage: async () => {
    const currentLanguage = get().language;
    const newLanguage = currentLanguage === 'en' ? 'he' : 'en';
    await get().setLanguage(newLanguage);
  },
  
  initializeLanguage: () => {
    // Check for stored preference - use 'appLanguage' to match i18n.ts
    const storedLanguage = localStorage.getItem('appLanguage') as Language;
    if (storedLanguage && ['en', 'he'].includes(storedLanguage)) {
      get().setLanguage(storedLanguage);
    } else {
      // Default to browser language or English
      const browserLang = navigator.language.split('-')[0];
      const defaultLang = browserLang === 'he' ? 'he' : 'en';
      get().setLanguage(defaultLang);
    }
  },
}));