import React from 'react';
import { useNavigate } from 'react-router';
import { useClerk } from '@clerk/clerk-react';
import { LogOutIcon } from 'lucide-react';
import { IconButton } from './admin/IconButton';
import { logout } from '../utils/logout';

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    // Clear local stores first
    const loggedOut = logout();

    // Sign out from Clerk
    try {
      await signOut();
    } catch (error) {
      console.error('Clerk signOut error:', error);
    }

    if (loggedOut) {
      navigate('/signup');
    }
  };

  return (
    <IconButton
      className="rounded-full w-9 h-9 flex items-center justify-center p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      icon={<LogOutIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />}
      onClick={handleLogout}
      aria-label="Log out"
    />
  );
};

export default LogoutButton;