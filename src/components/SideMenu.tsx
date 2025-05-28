import React, { SVGProps } from 'react';
import {
  ChatBubbleBottomCenterTextIcon,
  AcademicCapIcon,
  UsersIcon,
  Cog8ToothIcon,
  BookOpenIcon, // Added BookOpenIcon
} from '@heroicons/react/24/solid';
import { observer } from 'mobx-react-lite';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom'; // Added useNavigate

interface SideMenuProps {
  isOpen: boolean;
  closeMenu: () => void;
}

interface SideMenuItemProps {
  icon: React.FC<SVGProps<SVGSVGElement>>;
  text: string;
  onClick?: () => void;
}

const SideMenuItem: React.FC<SideMenuItemProps> = ({
  icon: Icon,
  text,
  onClick, // onClick is already defined, good.
}) => (
  <div className="hover:bg-slate-300 h-12 cursor-pointer" onClick={onClick}>
    <div className="flex mb-4 p-5 items-center"> {/* Added items-center for better alignment */}
      <Icon className="h-5 w-5 text-gray-600 mr-3" /> {/* Adjusted icon size and color */}
      <li className="text-sm text-gray-700">{text}</li> {/* Adjusted text style */}
    </div>
  </div>
);

const SideMenu: React.FC<SideMenuProps> = observer(({ isOpen, closeMenu }) => { // Added closeMenu to props
  const navigate = useNavigate();
  // const { activeChatbot } = useRootStore();

  const handleNavigate = (path: string) => {
    navigate(path);
    closeMenu(); // Close menu on navigation
  };

  return (
    <aside
      className={`fixed z-10 inset-0  bg-orange-100 transform transition-all w-60 p-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } duration-300`}
    >
      <header className="flex items-center justify-between p-4 mt-4">
        <img
          src="/vite.svg" // Placeholder image, as original was commented out
          alt="Logo"
          className="w-[6rem] object-contain h-auto" // Adjusted size
        />
        <button onClick={closeMenu} className="p-1 rounded-full hover:bg-slate-200 w-10 h-10 flex items-center justify-center">
          <XMarkIcon className="h-6 w-6 text-slate-500" />
        </button>
      </header>

      <nav className="p-0 mt-4"> {/* Added margin-top */}
        <ul className="font-light space-y-1"> {/* Added space-y for item separation */}
          {/* TODO: Update these routes and texts as per actual application structure */}
          <SideMenuItem icon={AcademicCapIcon} text="Assistants" onClick={() => handleNavigate('/admin/assistants')} />
          <SideMenuItem icon={UsersIcon} text="Users" onClick={() => handleNavigate('/admin/users')} />
          <SideMenuItem icon={ChatBubbleBottomCenterTextIcon} text="Teams" onClick={() => handleNavigate('/admin/teams')} />
          <SideMenuItem icon={BookOpenIcon} text="Memory" onClick={() => handleNavigate('/admin/memory')} />
          <SideMenuItem icon={Cog8ToothIcon} text="Settings" onClick={() => handleNavigate('/admin/settings')} /> 
          {/* Assuming a settings page, adjust as needed */}
        </ul>
      </nav>
    </aside>
  );
});

export { SideMenu };
