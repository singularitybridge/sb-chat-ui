import React from 'react';
import { useLocation } from 'react-router';
import { useAssistantStore } from '../store/useAssistantStore';
import { useTranslation } from 'react-i18next';

const BreadCrumbs: React.FC = () => {
  const location = useLocation();
  const { getAssistantById } = useAssistantStore();
  const pathParts = location.pathname.split('/');
  const currentPage = pathParts[2];
  const assistantId = pathParts[3];
  const assistant = assistantId ? getAssistantById(assistantId) : null;
  const { t } = useTranslation();

  return (
    <nav className="w-full rounded-md mb-5">
      <ol className="list-reset flex">
        <li>
          <a
            href="/admin"
            className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
          >
            {t('Navigation.home')}
            
          </a>
        </li>
        <li>
          <span className="mx-2 text-neutral-500 dark:text-neutral-400">/</span>
        </li>
        <li className="text-neutral-500 dark:text-neutral-400">
          {t(`Navigation.${currentPage}`)}
          {/* {capitalizeFirstLetter(currentPage)} */}
        </li>
        {assistant && (
          <>
            <li>
              <span className="mx-2 text-neutral-500 dark:text-neutral-400">/</span>
            </li>
            <li className="text-neutral-500 dark:text-neutral-400">
              {assistant.name}
            </li>
          </>
        )}
      </ol>
    </nav>
  );
};
export { BreadCrumbs };
