// hooks/useCustomTranslation.ts
import { useTranslation } from 'react-i18next';

interface CustomTranslationHook {
  t: (key: string) => string;
  changeLanguage: (newLanguage: string) => Promise<void>;
}

export function useCustomTranslation(): CustomTranslationHook {
  const { t, i18n } = useTranslation();

  const changeLanguage = async (newLanguage: string): Promise<void> => {
    await i18n.changeLanguage(newLanguage);
    localStorage.setItem('appLanguage', newLanguage);
  };

  return { t, changeLanguage };
}
