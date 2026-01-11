import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import { logger } from '../services/LoggingService';

const LoginWithGoogle: React.FC = () => {
  const { authenticate, loadUserSessionInfo } = useAuthStore();
  const navigate = useNavigate();

  const onSuccess = async (res: any) => {
    try {
      await authenticate(res.credential);
      // Load user session info immediately after auth to avoid "Loading..." flash
      await loadUserSessionInfo();
      navigate('/admin/assistants');
    } catch (error) {
      logger.error('Login failed:', error);
    }
  };

  const onError = (error?: any) => {
    console.error('Login failed:', error);
  };

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={onError}
      type="standard"
      shape="rectangular"
      size="large"
    />
  );
};

export default LoginWithGoogle;
