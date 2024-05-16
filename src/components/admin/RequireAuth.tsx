import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRootStore } from '../../store/common/RootStoreContext';

interface RequireAuthProps {
    children: ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
    const rootStore = useRootStore();
    const location = useLocation();

    const isAuthenticated = rootStore.isAuthenticated;

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>; // Render the children if the user is authenticated
};

export default RequireAuth;
