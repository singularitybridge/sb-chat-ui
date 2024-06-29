import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';

const LanguageToggle: React.FC = observer(() => {
  const rootStore = useRootStore();

  const toggleLanguage = (): void => {
    const newLanguage = rootStore.language === 'en' ? 'he' : 'en';
    rootStore.changeLanguage(newLanguage).then(() => {
      window.location.reload(); // Force reload of the application
    });
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