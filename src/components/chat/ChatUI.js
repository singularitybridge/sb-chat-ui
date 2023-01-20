import React, { useRef, useEffect } from "react";
import ChatUIRow from "./ChatUIRow";
import tw from "twin.macro";
import styled from "styled-components";

const ChatUIContainer = styled.div`
  ${tw`flex flex-col-reverse overflow-y-auto`}
  height: 490px;
`;

function ChatUI(props) {
  const { chatData, messageLimit } = props;
  const chatContainerRef = useRef(null);

  useEffect(() => {
    chatContainerRef.current.scrollIntoView({ behavior: "smooth" });
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
