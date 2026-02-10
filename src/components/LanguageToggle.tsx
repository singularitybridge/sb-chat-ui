import React from 'react';
import { Languages } from 'lucide-react';
import { IconButton } from './admin/IconButton';
import { useLanguageStore } from '../store/useLanguageStore';
import { logger } from '../services/LoggingService';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();

  const toggleLanguage = async (): Promise<void> => {
    const newLanguage = language === 'en' ? 'he' : 'en';

    try {
      await setLanguage(newLanguage);

      await new Promise(resolve => setTimeout(resolve, 100));

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
    <IconButton
      className="rounded-full w-9 h-9 flex items-center justify-center p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      icon={<Languages className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />}
      onClick={toggleLanguage}
      aria-label="Toggle language"
    />
  );
};

export default LanguageToggle;
