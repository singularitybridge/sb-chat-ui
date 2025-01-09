import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import { changeSessionLanguage } from '../services/api/sessionService';

const LanguageToggle: React.FC = observer(() => {
  const rootStore = useRootStore();

  const toggleLanguage = async (): Promise<void> => {
    const newLanguage = rootStore.language === 'en' ? 'he' : 'en';
    
    try {
      // Change the language in the root store and wait for it to complete
      await rootStore.changeLanguage(newLanguage);

      // If there's an active session, update its language
      const activeSessionId = rootStore.sessionStore.activeSessionId;
      if (activeSessionId) {
        await changeSessionLanguage(activeSessionId, newLanguage);
      }

      // Small delay to ensure all language changes are persisted
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify language was persisted before reload
      const storedLang = localStorage.getItem('appLanguage');
      if (storedLang === newLanguage) {
        window.location.reload();
      } else {
        console.error('Language change not persisted correctly');
      }
    } catch (error) {
      console.error('Failed to change language:', error);
      // Handle the error (e.g., show an error message to the user)
    }
  };

  return (
    <div 
      onClick={toggleLanguage} 
      className='bg-blue-100 rounded-full px-3 py-2 text-xs mx-2 cursor-pointer flex items-center justify-center min-w-[2rem] min-h-[2rem]'
    >
      {rootStore.language === 'en' ? 'en' : 'עברית'}
    </div>
  );
});

export default LanguageToggle;
