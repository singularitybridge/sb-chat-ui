import React from 'react';
import logo from '../../assets/l3.png';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { SessionView } from './SessionView';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';
import { useRootStore } from '../../store/common/RootStoreContext';
import Button from '../core/Button';
import { createSession } from '../../services/api/sessionService';

export const Menu = observer(() => {

  const rootStore = useRootStore(); 
  const userRole = rootStore.currentUser?.role; 


  const clearSession = async () => {
    // rootStore.clearSession();

    if (!rootStore.sessionStore.activeSession) {
      return;
    }

    console.log(`Clearing session ${rootStore.sessionStore.activeSession._id}`);
    await rootStore.sessionStore.deleteSession(rootStore.sessionStore.activeSession._id);
    console.log(`Creating new session for user ${rootStore.currentUser!._id} and company ${rootStore.currentUser!.companyId}`);
    await createSession(rootStore.currentUser!._id, rootStore.currentUser!.companyId);

  }

  const menuItems = [
    {
      name: 'Home',
      link: '/admin',
    },
    {
      name: 'Companies',
      link: '/admin/companies',
    },
    {
      name: 'Assistants',
      link: '/admin/assistants',
    },
    {
      name: 'Users',
      link: '/admin/users',
    },
    {
      name: 'Sessions',
      link: '/admin/sessions',
    },
    {
      name: 'Inbox',
      link: '/admin/inbox',
    },
    {
      name: 'Actions',
      link: '/admin/actions',
    },
  ];

  const { t } = useTranslation();

  const location = useLocation();
  const isMenuItemActive = (menuItemLink: string) => {
    if (menuItemLink === '/admin') {
      return location.pathname === menuItemLink;
    }
    return location.pathname.startsWith(menuItemLink);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    if (userRole === 'CompanyUser') {
      return item.name === 'Users' || item.name === 'Assistants';
    }
    return true;
  });

  return (
    <nav
      className="flex-no-wrap relative flex w-full items-center justify-between bg-neutral-100 py-2 shadow-md shadow-black/5 dark:bg-neutral-600 dark:shadow-black/10 lg:flex-wrap lg:justify-start lg:py-4"
      data-te-navbar-ref
    >
      <div className="flex w-full flex-wrap items-center justify-between px-3">
        <button
          className="block border-0 bg-transparent px-2 text-neutral-500 hover:no-underline hover:shadow-none focus:no-underline focus:shadow-none focus:outline-none focus:ring-0 dark:text-neutral-200 lg:hidden"
          type="button"
          data-te-collapse-init
          data-te-target="#navbarSupportedContent1"
          aria-controls="navbarSupportedContent1"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="[&>svg]:w-7">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        <div
          className="!visible hidden flex-grow basis-[100%] items-center lg:!flex lg:basis-auto"
          id="navbarSupportedContent1"
          data-te-collapse-item
        >
          <a
            className="mb-4 mt-4 mr-5 flex items-center lg:mb-0 lg:mt-0"
            href="#"
          >
            <img className="h-6 mr-2" src={logo} loading="lazy" />
            <h5 className="text-blue-900 text-xl">Singularity Bridge</h5>
          </a>

          <ul
            className="list-style-none flex flex-col pl-0 lg:flex-row"
            data-te-navbar-nav-ref
          >
            {filteredMenuItems.map((item) => {
              const isActive = isMenuItemActive(item.link);

              const menuStyle = isActive
                ? 'text-sm text-blue-300 hover:text-neutral-700 focus:text-neutral-700 disabled:text-black/30 dark:text-neutral-200 dark:hover:text-neutral-300 dark:focus:text-neutral-300 lg:px-2'
                : 'text-sm text-neutral-500 hover:text-neutral-700 focus:text-neutral-700 disabled:text-black/30 dark:text-neutral-200 dark:hover:text-neutral-300 dark:focus:text-neutral-300 lg:px-2';

              return (
                <li
                  className="mb-4 lg:mb-0 lg:pr-2"
                  data-te-nav-item-ref
                  key={item.name}
                >
                  <a
                    className={menuStyle}
                    href={item.link}
                    data-te-nav-link-ref
                  >
                    {t(`Menu.${item.name}`)}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>


        <Button onClick={clearSession}>
          clear
        </Button>

        <LanguageToggle />
        {/* <ClearSession /> */}
        <SessionView />
      </div>
    </nav>
  );
});
