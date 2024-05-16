import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useRootStore } from '../store/common/RootStoreContext';
import { login } from '../services/api/loginService';
import { LOCALSTORAGE_SYSTEM_USER_ID, setLocalStorageItem, setSystemUserId } from '../services/api/sessionService';
import { useNavigate } from 'react-router-dom';


const LoginWithGoogle: React.FC = () => {
    const rootStore = useRootStore();
    const navigate = useNavigate();

    const onSuccess = async (res: any) => {
        try {
            await rootStore.loginSystemUser(res.credential);
            navigate('/admin');
        } catch (error) {
            console.error('Login failed:', error);
        }

    };

    const onError = (error: any) => {
        console.error('Login failed:', error);
    };

    return <GoogleLogin onSuccess={onSuccess} onError={() => onError} />;
};


export default LoginWithGoogle;
