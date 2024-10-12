import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ContentContainer } from '../components/ContentContainer';
import { Menu } from '../components/admin/Menu';
import { Outlet } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import DynamicBackground, { setDynamicBackground } from '../components/DynamicBackground';

const Admin: React.FC = observer(() => {
  const rootStore = useRootStore();

  const backgroundProps = setDynamicBackground(
    'https://cdn.midjourney.com/41d91483-76a4-41f1-add2-638ff6f552e8/0_0.png',
    [
      { color: 'rgba(255, 255, 255, 1)', position: '0%' },
      { color: 'rgba(255, 255, 255, 0.5)', position: '10%' },
      { color: 'rgba(255, 255, 255, 0)', position: '100%' },
    ],
    [],
    'multiply'
  );

  useEffect(() => {    
    if (rootStore.isInitialDataLoaded) {
      rootStore.fetchOnboardingStatus();
    }    
  }, [rootStore.isInitialDataLoaded]);

  return (
    <div className="min-h-screen relative">
      <DynamicBackground {...backgroundProps} />
      <div className="relative z-10">
        <Menu />
        <ContentContainer className="px-8 py-4">
          <Outlet />
        </ContentContainer>
      </div>
    </div>
  );
});

export { Admin };
