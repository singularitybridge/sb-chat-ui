import React from 'react';
import LoginWithGoogle from '../../components/LoginWithGoogle';
import { useRootStore } from '../../store/common/RootStoreContext';
import { LOCALSTORAGE_SYSTEM_USER_ID, getLocalStorageItem } from '../../services/api/sessionService';

const LoginPage: React.FC = () => {
    const rootStore = useRootStore();
    rootStore.logoutSystemUser(getLocalStorageItem(LOCALSTORAGE_SYSTEM_USER_ID) || '');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-4">Login to Singularity Bridge</h1>
                <p className="text-center mb-6">Please log in with your Google account to continue.</p>
                <div className="flex justify-center">
                    <LoginWithGoogle />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
