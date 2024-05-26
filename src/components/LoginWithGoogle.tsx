//File: src/components/LoginWithGoogle.tsx
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { useRootStore } from '../store/common/RootStoreContext';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LOCALSTORAGE_COMPANY_ID, LOCALSTORAGE_USER_ID, getLocalStorageItem, getSessionByCompanyAndUserId } from '../services/api/sessionService';



const LoginWithGoogle: React.FC = () => {
    const rootStore = useRootStore();
    const navigate = useNavigate();

    const onSuccess = async (res: any) => {
        debugger
        try {
            await rootStore.loadUsers();
            await rootStore.loginSystemUser(res.credential);
            debugger;
            const user = jwtDecode(res.credential);

            if (rootStore.needsOnboarding) {
                navigate('/onboarding', { state: { user } });
            } else {
                const companyId = getLocalStorageItem(LOCALSTORAGE_COMPANY_ID) || '';
                const userId = getLocalStorageItem(LOCALSTORAGE_USER_ID) || '';
                const sessionData = await getSessionByCompanyAndUserId(companyId, userId);
                rootStore.sessionStore.setActiveSession(sessionData);
                await rootStore.loadAssistants();
                await rootStore.loadInboxMessages();

                rootStore.currentUser?.role === 'Admin' ? navigate('/admin') : navigate('/admin/users');
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
