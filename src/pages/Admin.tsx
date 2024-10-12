import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ContentContainer } from '../components/ContentContainer';
import { Menu } from '../components/admin/Menu';
import { Outlet } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import { root } from 'postcss';

// Add this style to your global CSS file or create a new CSS module
const styles = `
  .bg-dot-pattern {
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23D1D5DB' /%3E%3C/svg%3E");
    background-color: #F3F4F6;
  }
`;

const Admin: React.FC = observer(() => {
  const rootStore = useRootStore();

  useEffect(() => {    
    if (rootStore.isInitialDataLoaded) {
      rootStore.fetchOnboardingStatus();
    }    
  }, [rootStore.isInitialDataLoaded]);

  return (
    <div className="bg-dot-pattern min-h-screen">
      <style>{styles}</style>
      <Menu />
      <ContentContainer className="px-8 py-4">
        <Outlet />
      </ContentContainer>
    </div>
  );
});

export { Admin };
