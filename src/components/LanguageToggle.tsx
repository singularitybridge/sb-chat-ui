import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import clsx from 'clsx';

const LanguageToggle: React.FC = observer(() => {
  const rootStore = useRootStore();

  const toggleLanguage = (): void => {
    const newLanguage = rootStore.language === 'en' ? 'he' : 'en';
    rootStore.changeLanguage(newLanguage).then(() => {
        window.location.reload(); // Force reload of the application
      });
  };
  const className = clsx(
    'bg-primary',
    'text-white',
    'px-2.5',
    'py-1.5',
    'mr-2 mb-2',
    'rounded-md',
    'text-base',
);

  return (
    <button
      onClick={toggleLanguage}
      className={className}
    >
      Switch to {rootStore.language === 'en' ? 'Hebrew' : 'English'}
    </button>
  );
});

export default LanguageToggle;
