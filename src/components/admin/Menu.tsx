import React, { useState } from 'react';
import { useLocation, Link } from 'react-router';
import { Menu as MenuIcon } from 'lucide-react';
import { SessionView } from './SessionView';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../LanguageToggle';
import ThemeToggle from '../ThemeToggle';
import { TextComponent } from '../sb-core-ui-kit/TextComponent';
import LogoutButton from '../LogoutButton';
import ShowOnboardingButton from '../ShowOnboardingButton';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { useIsMobile } from '../../hooks/useMediaQuery';

export const Menu: React.FC = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();
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

  const renderMenuItems = (inSheet = false) => (
    <ul
      className={inSheet ? 'flex flex-col space-y-2' : 'list-style-none flex flex-row bg-transparent space-x-1'}
      data-te-navbar-nav-ref
    >
      {menuItems.map((item) => {
        const isActive = isMenuItemActive(item.link);

        const menuStyle = inSheet
          ? `block text-base py-3 px-4 rounded-lg transition-colors ${
              isActive
                ? 'bg-accent text-foreground font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`
          : `text-sm px-3 py-2 bg-transparent transition-colors ${
              isActive
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`;

        return (
          <li className={inSheet ? '' : 'bg-transparent'} data-te-nav-item-ref key={item.name}>
            <Link
              to={item.link}
              className={menuStyle}
              data-te-nav-link-ref
              onClick={() => inSheet && setIsSheetOpen(false)}
            >
              {t(`Menu.${item.name}`)}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav
      className="flex-no-wrap relative flex w-full items-center justify-between pt-4 md:pt-8 pb-3 px-4 md:px-8 lg:px-14 bg-transparent"
      data-te-navbar-ref
    >
      <div className="flex w-full flex-wrap items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8 py-2 rounded-2xl">
          <Link to="/admin" className="bg-transparent">
            <TextComponent
              size="title"
              color="normal"
              className='text-violet-700 dark:text-violet-400 font-bold bg-transparent'
              text={t('common.appName')}
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            {renderMenuItems(false)}
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <SessionView />
          <LanguageToggle />
          <ThemeToggle />
          <ShowOnboardingButton />
          <LogoutButton />
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>{t('common.appName')}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col h-full">
                {/* Session View */}
                <div className="mb-6 pb-4 border-b border-border">
                  <SessionView />
                </div>

                {/* Navigation Links */}
                <nav className="flex-1">
                  {renderMenuItems(true)}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <ShowOnboardingButton />
                  <LogoutButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
