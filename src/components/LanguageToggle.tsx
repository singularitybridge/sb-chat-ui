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
      const storedLang = localStorage.getItem('preferredLanguage');
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
    <div
      onClick={toggleLanguage}
      className='bg-blue-100 rounded-full px-3 py-2 text-xs mx-2 cursor-pointer flex items-center justify-center min-w-[2rem] min-h-[2rem]'
    >
      {language === 'en' ? 'en' : 'עברית'}
    </div>
  );
};

export default LanguageToggle;
