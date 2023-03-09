interface ChatFooterContainerProps {
  children: React.ReactNode;
}

const ChatFooterContainer: React.FC<ChatFooterContainerProps> = ({
  children,
}) => {
  return (
    <footer className="p-3 text-center text-base font-light">{children}</footer>
  );
};

export { ChatFooterContainer };
