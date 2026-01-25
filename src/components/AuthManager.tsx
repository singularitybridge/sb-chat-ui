import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '@clerk/clerk-react';
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
  const authInProgressRef = useRef(false);

  // Clerk auth state
  const { isLoaded: clerkLoaded, isSignedIn, getToken } = useAuth();

  // Subscribe to auth state
  const { isAuthenticated, checkAuthStatus, loadUserSessionInfo, authenticateWithClerk } = useAuthStore();

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
      // Wait for Clerk to load
      if (!clerkLoaded) return;

      // Prevent concurrent auth attempts
      if (authInProgressRef.current) return;

      const isEmbedRoute = location.pathname.startsWith('/embed/assistants/');
      const isDevRoute = location.pathname.startsWith('/dev');
      const isTestRoute = location.pathname.startsWith('/test/');
      const isSSOCallback = location.pathname === '/sso-callback';

      if (isEmbedRoute || isDevRoute || isTestRoute || location.pathname === '/health' || isSSOCallback) {
        setLoading(false);
        return;
      }

      // Check if user is signed in with Clerk
      if (isSignedIn) {
        // If already authenticated with backend, just load data
        if (isAuthenticated) {
          if (!initialDataLoadedRef.current) {
            try {
              await loadInitialData();
            } catch (error) {
              logger.error('Failed to load initial data', error);
              logout();
              navigate('/signup');
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
          return;
        }

        // Need to authenticate with backend
        authInProgressRef.current = true;
        try {
          const token = await getToken();
          if (token) {
            await authenticateWithClerk(token);
            await loadInitialData();
          }
        } catch (error) {
          logger.error('Failed to authenticate with Clerk', error);
          logout();
          navigate('/signup');
          setLoading(false);
        } finally {
          authInProgressRef.current = false;
        }
      } else {
        // Check legacy token auth (for existing sessions)
        const authenticated = await checkAuthStatus();
        if (!authenticated && location.pathname !== '/signup') {
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
          // On /signup without auth
          setLoading(false);
        }
      }
    };
    checkAuth();
  }, [navigate, location.pathname, clerkLoaded, isSignedIn, getToken, checkAuthStatus, loadUserSessionInfo, authenticateWithClerk, isAuthenticated]);

  useEffect(() => {
    if (!clerkLoaded) return;

    const isEmbedRoute = location.pathname.startsWith('/embed/assistants/');
    const isDevRoute = location.pathname.startsWith('/dev');
    const isTestRoute = location.pathname.startsWith('/test/');
    const isSSOCallback = location.pathname === '/sso-callback';

    // Don't redirect if Clerk says we're signed in or we have a legacy token
    const shouldRedirectToSignup =
      !isEmbedRoute &&
      !isDevRoute &&
      !isTestRoute &&
      !isSSOCallback &&
      !isAuthenticated &&
      !isSignedIn &&
      location.pathname !== '/signup' &&
      location.pathname !== '/health';

    if (shouldRedirectToSignup) {
      navigate('/signup');
    }
  }, [clerkLoaded, isAuthenticated, isSignedIn, navigate, location.pathname]);

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
