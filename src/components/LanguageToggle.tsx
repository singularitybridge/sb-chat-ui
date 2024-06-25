import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../store/common/RootStoreContext';
import Button from './sb-core-ui-kit/Button';

const LanguageToggle: React.FC = observer(() => {
  const rootStore = useRootStore();

  const toggleLanguage = (): void => {
    const newLanguage = rootStore.language === 'en' ? 'he' : 'en';
    rootStore.changeLanguage(newLanguage).then(() => {
      window.location.reload(); // Force reload of the application
    });
  };

  return (
    <Button size='small' onClick={toggleLanguage}>
      {rootStore.language === 'en' ? 'he' : 'en'}
    </Button>
  );
});

export default LanguageToggle;
