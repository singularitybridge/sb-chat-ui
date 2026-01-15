import React from 'react';
import { useNavigate } from 'react-router';
import { LogOutIcon } from 'lucide-react';
import { IconButton } from './admin/IconButton';
import { logout } from '../utils/logout';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const loggedOut = logout();
    if (loggedOut) {
      navigate('/signup');
    }
  };

  return (
    <IconButton
      className="bg-fuchsia-100 hover:bg-fuchsia-200 dark:bg-fuchsia-900/50 dark:hover:bg-fuchsia-800/60 rounded-full w-9 h-9 flex items-center justify-center p-2 transition-colors"
      icon={<LogOutIcon className="w-5 h-5 text-fuchsia-700 dark:text-fuchsia-300" />}
      onClick={handleLogout}
      aria-label="Log out"
    />
  );
};

export default LogoutButton;