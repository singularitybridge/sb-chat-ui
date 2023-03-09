interface ChatFooterContainerProps {
  children: React.ReactNode;
}

const ChatFooterContainer: React.FC<ChatFooterContainerProps> = ({
  children,
}) => {
  return (
    <footer className="text-center font-light">{children}</footer>
  );
};

export { ChatFooterContainer };
