import React from 'react';

interface ContentPageContainerProps {
  children: React.ReactNode;
}

const ContentPageContainer: React.FC<ContentPageContainerProps> = ({
  children,
}) => {
  return <main className="p-5">{children}</main>;
};

export { ContentPageContainer };
