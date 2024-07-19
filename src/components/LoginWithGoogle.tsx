/// file_path=src/components/LoginWithGoogle.tsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useRootStore } from '../store/common/RootStoreContext';
import { useNavigate } from 'react-router-dom';

const LoginWithGoogle: React.FC = () => {
  const rootStore = useRootStore();
  const navigate = useNavigate();

  const onSuccess = async (res: any) => {
    try {
      await rootStore.authStore.authenticate(res.credential);
      navigate('/admin'); // Add this line to redirect after successful login
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
