import React from 'react';
import { useLanguageStore } from '../store/useLanguageStore';
import { useSessionStore } from '../store/useSessionStore';
import { changeActiveSessionLanguage } from '../services/api/sessionService';
import { logger } from '../services/LoggingService';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();
  const activeSession = useSessionStore(state => state.activeSession);

  const toggleLanguage = async (): Promise<void> => {
    const newLanguage = language === 'en' ? 'he' : 'en';

    try {
      // Change the language in the language store
      await setLanguage(newLanguage);

      // If there's an active session, update its language
      if (activeSession) {
        await changeActiveSessionLanguage(newLanguage);
      }

      // Small delay to ensure all language changes are persisted
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify language was persisted before reload
      const storedLang = localStorage.getItem('appLanguage');
      if (storedLang === newLanguage) {
        window.location.reload();
      } else {
        logger.error('Language change not persisted correctly');
      }
    } catch (error) {
      logger.error('Failed to change language:', error);
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className='bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/60 rounded-full w-9 h-9 text-xs cursor-pointer flex items-center justify-center transition-colors text-blue-700 dark:text-blue-300 font-medium'
      aria-label="Toggle language"
    >
      {language === 'en' ? 'en' : 'he'}
    </button>
  );
};

export default LanguageToggle;
