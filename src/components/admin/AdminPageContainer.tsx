import React, { ReactNode } from 'react';

interface AdminPageContainerProps {
  children: ReactNode;
}

const AdminPageContainer: React.FC<AdminPageContainerProps> = ({ children }) => {
  return (
    <div className="h-full w-full flex justify-center">
      <div className="w-full max-w-7xl bg-card rounded-2xl overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminPageContainer;
