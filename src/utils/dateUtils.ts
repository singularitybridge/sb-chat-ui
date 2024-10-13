import { formatDistanceToNow } from 'date-fns';
import { enUS, he } from 'date-fns/locale';
import i18n from '../i18n';

const locales = {
  en: enUS,
  he: he,
};

export const formatRelativeTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const currentLanguage = i18n.language as keyof typeof locales;
  
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: locales[currentLanguage] || enUS // fallback to English if the language is not supported
  });
};
