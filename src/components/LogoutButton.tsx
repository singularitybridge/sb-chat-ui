import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      className="bg-fuchsia-100 hover:bg-fuchsia-200 rounded-full w-9 h-9 m-auto flex items-center justify-center p-2"
      icon={<LogOutIcon className="w-5 h-5 text-zinc-500" />}
      onClick={handleLogout}
    />
  );
};

export default LogoutButton;