import React from 'react';
import { observer } from 'mobx-react-lite';
import { ContentContainer } from '../components/ContentContainer';
import { Menu } from '../components/admin/Menu';
import { Outlet } from 'react-router-dom';

const Admin: React.FC = observer(() => {
  return (
    <>
      <Menu />
      <ContentContainer className="px-8 py-4 bg-gray-100">
        <Outlet />
      </ContentContainer>
    </>
  );
});

export { Admin };
