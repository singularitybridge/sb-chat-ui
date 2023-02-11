import React, { useRef, useEffect, useState } from "react";
import ChatUIRow from "./ChatUIRow";
import tw from "twin.macro";
import styled from "styled-components";

const ChatUIContainer = styled.div`
  ${tw`flex flex-col overflow-y-scroll`}
  height: 55%;
`;


function ChatUI(props) {
  const { chatData, messageLimit } = props;
  const chatContainerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(window.innerHeight * 0.55);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatData]);

  return (
    <ChatUIContainer ref={chatContainerRef} style={{ height: `${height}px` }}>
      {chatData
        .slice(-1 * messageLimit)
        .map((row, index) => (
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