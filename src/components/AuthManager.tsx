/// file_path: src/components/AuthManager.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import { useSessionStore } from '../store/useSessionStore'; // Import Zustand session store
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
    await rootStore.loadCompanies();
    await rootStore.aiAssistedConfigStore.initialize();
    console.log('AuthManager - fetching active session...');
    await useSessionStore.getState().fetchActiveSession(); // Use Zustand store action
    console.log('AuthManager - active session after fetch:', useSessionStore.getState().activeSession);
    await rootStore.loadInboxMessages();
    await rootStore.setInitialDataLoaded();    
    setLoading(false);
  }

  useEffect(() => {
    const checkAuth = async () => {
      const isEmbedRoute = location.pathname.startsWith('/embed/assistants/');
      if (isEmbedRoute) {
        // For embed routes, we might not require full user authentication
        // but we still need to load essential data if an API key is present or for public assistants
        // This logic will be expanded when API key handling is added to EmbedChatPage
        setLoading(false); // Assume loading is done for now for embed, or handle specific embed loading
        return;
      }

      const isAuthenticated = await rootStore.authStore.checkAuthStatus();
      if (!isAuthenticated && location.pathname !== '/signup') {
        navigate('/signup');
      } else if (isAuthenticated) {
        try {
          if (!rootStore.isInitialDataLoaded) {
            await loadInitialData();
          }
        } catch (error) {
          console.error('Failed to load initial data', error);
          rootStore.authStore.logout();
          navigate('/signup');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate, rootStore, location.pathname]);

  useEffect(() => {
    const isEmbedRoute = location.pathname.startsWith('/embed/assistants/');
    if (!isEmbedRoute && !rootStore.authStore.isAuthenticated && location.pathname !== '/signup') {
      navigate('/signup');
    }
  }, [rootStore.authStore.isAuthenticated, navigate, location.pathname]);

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
