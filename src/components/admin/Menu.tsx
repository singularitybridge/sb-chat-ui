import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { observer } from 'mobx-react';
import { SessionView } from './SessionView';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';
import { TextComponent } from '../sb-core-ui-kit/TextComponent';
import LogoutButton from '../LogoutButton';
import ShowOnboardingButton from '../ShowOnboardingButton';

export const Menu = observer(() => {
  const menuItems = [
    { name: 'Agents', link: '/admin/assistants' },
    { name: 'Teams', link: '/admin/teams' },
    { name: 'ApiKeys', link: '/admin/api-keys' },
    { name: 'Costs', link: '/admin/costs' },
  ];

  const { t } = useTranslation();
  const location = useLocation();

  const isMenuItemActive = (menuItemLink: string) => {
    if (menuItemLink === '/admin') {
      return location.pathname === menuItemLink;
    }
    return location.pathname.startsWith(menuItemLink);
  };

  return (
    <nav
      className="flex-no-wrap relative flex w-full items-center justify-between pt-8 pb-3 px-14 bg-transparent"
      data-te-navbar-ref
    >
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex items-center rtl:space-x-reverse space-x-8 py-2 rounded-2xl">
          <Link to="/admin" className="bg-transparent">
            <TextComponent
              size="title"
              color="normal"
              className='text-violet-800 font-medium bg-transparent'
              text={t('common.appName')}
            />
          </Link>

          <ul
            className="list-style-none flex flex-row bg-transparent space-x-1"
            data-te-navbar-nav-ref
          >
            {menuItems.map((item) => {
              const isActive = isMenuItemActive(item.link);

              const menuStyle = `text-sm ${
                isActive
                  ? 'text-gray-700 hover:text-neutral-700 focus:text-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-600 focus:text-neutral-600'
              } disabled:text-black/30 dark:text-neutral-200 dark:hover:text-neutral-300 dark:focus:text-neutral-300 px-3 py-2 bg-transparent`;

              return (
                <li className="bg-transparent" data-te-nav-item-ref key={item.name}>
                  <Link
                    to={item.link}
                    className={menuStyle}
                    data-te-nav-link-ref
                  >
                    {t(`Menu.${item.name}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <SessionView />
          <LanguageToggle />
          <ShowOnboardingButton />
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
});
