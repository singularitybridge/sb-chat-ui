/// file_path: src/components/AuthManager.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import { observer } from 'mobx-react-lite';
import { ClipLoader } from 'react-spinners';

const AuthManager: React.FC<{ children: React.ReactNode }> = observer(({ children }) => {
  const rootStore = useRootStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const loadInitialData = async () => {

    await rootStore.authStore.loadUserSessionInfo();
    await rootStore.loadAssistants();
    await rootStore.loadUsers();
    await rootStore.loadActions();

    setLoading(false);
  }

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await rootStore.authStore.checkAuthStatus();
      if (!isAuthenticated && location.pathname !== '/signup') {
        navigate('/signup');
      } else if (isAuthenticated && location.pathname === '/signup') {
        navigate('/admin/assistants');
      } else if (isAuthenticated) {
        await loadInitialData();
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate, rootStore, location.pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <ClipLoader color="#123abc" loading={true} size={50} />
      </div>
    );
  }

  return <>{children}</>;
});

export default AuthManager;