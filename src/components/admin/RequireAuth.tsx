import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Navigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { root } from 'postcss';

const RequireAuth: React.FC<{ children: React.ReactNode }> = observer(
  ({ children }) => {

    const rootStore = useRootStore();

    const [isLoading, setIsLoading] = useState(
      !rootStore.authStore.isAuthenticated
    );

    useEffect(() => {
      const initializeAdminData = async () => {

        if (!rootStore.authStore.isAuthenticated) {
          setIsLoading(false);
          return;
        }

        if (!rootStore.authStore.isUserDataLoaded) {
          rootStore.loadAssistants();
        }
        setIsLoading(false);
      };

      initializeAdminData();
    }, [rootStore.authStore]);

    if (!rootStore.authStore.isAuthenticated) {
      return <Navigate to="/signup" replace />;
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-gray-200">
          <ClipLoader color="#123abc" loading={true} size={50} />
        </div>
      );
    }

    return <>{children}</>;
  }
);

export default RequireAuth;
