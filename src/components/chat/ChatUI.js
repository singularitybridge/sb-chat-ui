import React, { useRef, useEffect } from "react";
import ChatUIRow from "./ChatUIRow";
import tw from "twin.macro";
import styled from "styled-components";

const ChatUIContainer = styled.div`
  ${tw`flex flex-col overflow-y-auto`}
  height: 490px;
`;

function ChatUI(props) {
  const { chatData, messageLimit } = props;
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    container.scrollTo(0, container.scrollHeight - container.clientHeight);
  }, [chatData]);

  return (
    <ChatUIContainer ref={chatContainerRef}>
      {chatData.slice(0, messageLimit).map((row, index) => (
        <ChatUIRow
          key={index}
          author={row.author}
          text={row.text}
          profilePic={row.profilePic}
        />
      ))}
    </ChatUIContainer>
  );
}

export default ChatUI;
