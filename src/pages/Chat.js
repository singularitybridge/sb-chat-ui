import React from "react";
import tw from "twin.macro";
import { SectionHeading as HeadingTitle } from "../components/misc/Headings.js";
import ChatUI from "components/chat/ChatUI.js";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons.js";


const Container = tw.div`relative`;
const SingleColumn = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24`;
const HeadingInfoContainer = tw.div`flex flex-col items-center`;
const Content = tw.div`mt-16`;
const Form = tw.form`mt-8 md:mt-10 text-sm flex flex-col lg:flex-row`;
const Input = tw.input`border-2 px-5 py-3 rounded focus:outline-none font-medium transition duration-300 hocus:border-primary-500`;

const MessageInputContainer = tw.div`
  fixed
  bottom-0
  left-0
  w-full
  p-4  
`;

const SubmitButton = tw(PrimaryButtonBase)`inline-block lg:ml-6 mt-6 lg:mt-0`;

export default () => {
  const [messageInput, setMessageInput] = React.useState("");

  const [chatData, setChatData] = React.useState([]);

  const handleSendMessage = (message) => {
    setChatData([
      ...chatData,
      {
        key: Math.random().toString(36).substr(2, 9),
        author: "Jerry",
        text: message,
        profilePic: "https://i.ibb.co/8gHqSLN/av1.png",
      },
    ]);
    setMessageInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage(messageInput);
    }
  };

  return (
    <>
      <Container>
        <SingleColumn>
          <HeadingInfoContainer>
            <HeadingTitle>Behavioral Challenges</HeadingTitle>
          </HeadingInfoContainer>

          <Content>
            <ChatUI chatData={chatData} messageLimit={150} />

            <MessageInputContainer>
              <Form>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="text"
                  placeholder="Type your message here..."
                />
                <SubmitButton
                  type="button"
                  onClick={() => handleSendMessage(messageInput)}
                >
                  Send
                </SubmitButton>
              </Form>
            </MessageInputContainer>
          </Content>
        </SingleColumn>
      </Container>
    </>
  );
};
