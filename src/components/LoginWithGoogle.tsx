import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useRootStore } from '../store/common/RootStoreContext';
import { useNavigate } from 'react-router-dom';


const LoginWithGoogle: React.FC = () => {
    const rootStore = useRootStore();
    const navigate = useNavigate();

    const onSuccess = async (res: any) => {
        try {
            await rootStore.loginSystemUser(res.credential);

            if (rootStore.currentUser?.role === 'CompanyUser') {
                navigate('/admin/users');
            } else if (rootStore.currentUser?.role === 'Admin') {
                navigate('/admin');
            }
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
