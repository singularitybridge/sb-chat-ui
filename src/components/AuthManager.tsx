/// file_path: src/components/AuthManager.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import { observer } from 'mobx-react-lite';
import { ClipLoader } from 'react-spinners';
import { emitter } from '../services/mittEmitter';
import { EVENT_SHOW_ONBOARDING_MODAL } from '../utils/eventNames';
import { OnboardingStatus } from '../store/models/RootStore';

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
    await rootStore.loadCompanies();
    await rootStore.aiAssistedConfigStore.initialize();
    await rootStore.sessionStore.fetchActiveSession();
    await rootStore.loadInboxMessages();
    await rootStore.fetchOnboardingStatus();
    await rootStore.setInitialDataLoaded();
    setLoading(false);
  }

  useEffect(() => {
    const checkAuth = async () => {
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
    if (!rootStore.authStore.isAuthenticated && location.pathname !== '/signup') {
      navigate('/signup');
    }
  }, [rootStore.authStore.isAuthenticated, navigate, location.pathname]);

  useEffect(() => {
    if (rootStore.authStore.isLoggedIn) {
      if (rootStore.onboardingStatus !== OnboardingStatus.READY_FOR_ASSISTANTS) {
        console.log('show onboarding');
        emitter.emit(EVENT_SHOW_ONBOARDING_MODAL, { title: 'Onboarding' });
      }
    }
  }, [rootStore.authStore.isLoggedIn, rootStore.onboardingStatus]);

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
