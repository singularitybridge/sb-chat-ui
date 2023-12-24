import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { ContentContainer } from '../components/ContentContainer';
import Menu from '../components/admin/Menu';
import { ChatbotCard } from '../components/admin/chatbots/ChatbotCard';
import { ChatSessionCard } from '../components/admin/chatSessions/ChatSessionCard';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { Outlet } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';

const Admin: React.FC = observer(() => {
  return (
    <>
      <Menu />
      <ContentContainer className="px-4 py-4">
        <BreadCrumbs />
        <Outlet />
      </ContentContainer>
    </>
  );
});

export { Admin };
