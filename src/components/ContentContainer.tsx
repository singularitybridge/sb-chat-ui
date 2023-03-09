interface ContentContainerProps {
  children: React.ReactNode;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-scroll antialiased ">{children}</main>
  );
};

export { ContentContainer };
