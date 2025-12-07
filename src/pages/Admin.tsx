import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ContentContainer } from '../components/ContentContainer';
import { Menu } from '../components/admin/Menu';
import { Outlet, useLocation } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import DynamicBackground, { setDynamicBackground } from '../components/DynamicBackground';

const Admin: React.FC = observer(() => {
  const rootStore = useRootStore();
  const location = useLocation();

  // Check if we're on a workspace route
  const isWorkspacePage = location.pathname.includes('/workspace');

  const backgroundProps = setDynamicBackground(
    'https://cdn.midjourney.com/41d91483-76a4-41f1-add2-638ff6f552e8/0_0.png',
    [
      { color: 'rgba(255, 255, 255, 0.95)', position: '0%' },
      { color: 'rgba(255, 255, 255, 0.8)', position: '8%' },
      { color: 'rgba(255, 255, 255, 0)', position: '100%' },
    ],
    [
      { color: '#CACACA', stop: '0%', opacity: 0.5 },
      { color: '#878787', stop: '50%', opacity: 0.6 },
      { color: '#202022', stop: '100%', opacity: 0.7 },
    ],
    'multiply'
  );

  useEffect(() => {
    if (rootStore.isInitialDataLoaded) {
      rootStore.fetchOnboardingStatus();
    }
  }, [rootStore.isInitialDataLoaded]);

  return (
    <div className="h-screen flex flex-col relative">
      <DynamicBackground {...backgroundProps} />
      <div className="relative z-10 flex flex-col h-full">
        <Menu />
        {isWorkspacePage ? (
          // Workspace pages manage their own layout but use same padding as other pages
          <div className="flex-1 min-h-0 overflow-hidden px-14 py-10">
            <Outlet />
          </div>
        ) : (
          // Regular admin pages use ContentContainer with padding and scroll
          <ContentContainer className="px-14 py-10 flex-grow overflow-hidden">
            <Outlet />
          </ContentContainer>
        )}
      </div>
    </div>
  );
});

export { Admin };
