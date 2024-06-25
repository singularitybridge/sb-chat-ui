import React from 'react';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { SessionView } from './SessionView';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';
import { useRootStore } from '../../store/common/RootStoreContext';
import Button from '../sb-core-ui-kit/Button';
import { createSession } from '../../services/api/sessionService';
import { TextComponent } from '../sb-core-ui-kit/TextComponent';

export const Menu = observer(() => {
  const rootStore = useRootStore();
  const userRole = rootStore.currentUser?.role;

  const clearSession = async () => {
    // rootStore.clearSession();

    if (!rootStore.sessionStore.activeSession) {
      return;
    }

    await rootStore.sessionStore.deleteSession(
      rootStore.sessionStore.activeSession._id
    );
    await createSession(
      rootStore.currentUser!._id,
      rootStore.currentUser!.companyId
    );
  };

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
      className="flex-no-wrap relative flex w-full items-center justify-between bg-white py-3"
      data-te-navbar-ref
    >
      <div className="flex w-full flex-wrap items-center justify-between px-3">
        <div
          className="!visible hidden flex-grow basis-[100%] items-center lg:!flex lg:basis-auto"
          id="navbarSupportedContent1"
          data-te-collapse-item
        >
          <a className=" px-8" href="#">
            <TextComponent
              size="subtitle"
              color="normal"
              text="Singularity Bridge"
            />
          </a>

          <ul
            className="list-style-none flex flex-col lg:flex-row "
            data-te-navbar-nav-ref
          >
            {filteredMenuItems.map((item) => {
              const isActive = isMenuItemActive(item.link);

              const menuStyle = isActive
                ? 'text-sm text-gray-700 hover:text-neutral-700 focus:text-neutral-700 disabled:text-black/30 dark:text-neutral-200 dark:hover:text-neutral-300 dark:focus:text-neutral-300 px-3'
                : 'text-sm text-neutral-400 hover:text-neutral-600 focus:text-neutral-600 disabled:text-black/30 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500 px-3';

              return (
                <li className=" " data-te-nav-item-ref key={item.name}>
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

        
        <div className=' space-x-1.5 flex'>
        <Button size='small' onClick={clearSession}>clear</Button>
        <LanguageToggle />
        <SessionView />
        </div>
      </div>
    </nav>
  );
});
