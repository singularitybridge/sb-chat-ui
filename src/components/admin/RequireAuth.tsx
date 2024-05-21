import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import { Navigate } from 'react-router-dom';

const RequireAuth: React.FC<{ children: React.ReactNode }> = observer(({ children }) => {
  const rootStore = useRootStore();

  if (!rootStore.isAuthenticated) {
    return <Navigate to="/signup" replace />;
  }

  return <>{children}</>;
});

export default RequireAuth;
