import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import { useSessionStore } from '../store/useSessionStore';
import { useAssistantStore } from '../store/useAssistantStore';
import { useUserStore } from '../store/useUserStore';
import { useCompanyStore } from '../store/useCompanyStore';
import { useTeamStore } from '../store/useTeamStore';
import { useInboxStore } from '../store/useInboxStore';
import { useAIAssistedStore } from '../store/useAIAssistedStore';
import { logout } from '../utils/logout';
import { ClipLoader } from 'react-spinners';
import { logger } from '../services/LoggingService';

const AuthManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const initialDataLoadedRef = useRef(false);

  // Subscribe to auth state
  const { isAuthenticated, checkAuthStatus, loadUserSessionInfo } = useAuthStore();

  const loadInitialData = async () => {
    if (initialDataLoadedRef.current) {
      setLoading(false);
      return; // Already loaded
    }

    logger.info('AuthManager - Loading initial data...');

    // Load user session info first - this sets isUserDataLoaded
    await loadUserSessionInfo();

    // Load all stores in parallel for better performance
    await Promise.all([
      useAssistantStore.getState().loadAssistants(),
      useUserStore.getState().loadUsers(),
      useCompanyStore.getState().loadCompanies(),
      useTeamStore.getState().loadTeams(),
    ]);

    // Initialize AI assisted configs
    useAIAssistedStore.getState().initialize();

    // Fetch active session
    logger.debug('AuthManager - fetching active session...');
    await useSessionStore.getState().fetchActiveSession();
    logger.debug('AuthManager - active session after fetch:', useSessionStore.getState().activeSession);

    // Load inbox messages
    await useInboxStore.getState().loadInboxSessions();

    initialDataLoadedRef.current = true;
    logger.info('AuthManager - Initial data loaded successfully');
    setLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const isEmbedRoute = location.pathname.startsWith('/embed/assistants/');
      const isDevRoute = location.pathname.startsWith('/dev');
      const isTestRoute = location.pathname.startsWith('/test/');
      if (isEmbedRoute || isDevRoute || isTestRoute || location.pathname === '/health') {
        // For embed/dev/test routes, we might not require full user authentication
        // but we still need to load essential data if an API key is present or for public assistants
        setLoading(false);
        return;
      }

      const authenticated = await checkAuthStatus();
      if (!authenticated && location.pathname !== '/signup' && location.pathname !== '/health') {
        navigate('/signup');
        setLoading(false);
      } else if (authenticated) {
        try {
          await loadInitialData();
        } catch (error) {
          logger.error('Failed to load initial data', error);
          logout();
          navigate('/signup');
          setLoading(false);
        }
      } else {
        // On /signup or /health without auth
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate, location.pathname, checkAuthStatus, loadUserSessionInfo]);

  useEffect(() => {
    const isEmbedRoute = location.pathname.startsWith('/embed/assistants/');
    const isDevRoute = location.pathname.startsWith('/dev');
    const isTestRoute = location.pathname.startsWith('/test/');
    if (!isEmbedRoute && !isDevRoute && !isTestRoute && !isAuthenticated && location.pathname !== '/signup' && location.pathname !== '/health') {
      navigate('/signup');
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-accent">
        <ClipLoader color="#123abc" loading={true} size={50} />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthManager;
