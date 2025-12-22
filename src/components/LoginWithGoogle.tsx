import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const LoginWithGoogle: React.FC = () => {
  const { authenticate } = useAuthStore();
  const navigate = useNavigate();

  const onSuccess = async (res: any) => {
    try {
      await authenticate(res.credential);
      navigate('/admin/assistants');
    } catch (error) {
      console.error('Login failed:', error);
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
