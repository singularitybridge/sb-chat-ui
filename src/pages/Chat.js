
import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro"; //eslint-disable-line
import AnimationRevealPage from "helpers/AnimationRevealPage.js";


import Hero from "components/hero/TwoColumnWithFeaturesAndTestimonial.js";
import Features from "components/features/ThreeColWithSideImage.js";
import MainFeature from "components/features/TwoColWithTwoHorizontalFeaturesAndButton.js";
import FeatureStats from "components/features/ThreeColCenteredStatsPrimaryBackground.js";
import Pricing from "components/pricing/TwoPlansWithDurationSwitcher.js";
import Blog from "components/blogs/GridWithFeaturedPost.js";
import Testimonial from "components/testimonials/TwoColumnWithImageAndRating.js";
import FAQ from "components/faqs/SingleCol.js";
import GetStarted from "components/cta/GetStartedLight.js";
import Footer from "components/footers/SimpleFiveColumn.js";
import { SectionHeading as HeadingTitle } from "../components/misc/Headings.js";
import ChatUI from "components/chat/ChatUI.js";

import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons.js";

const HighlightedText = tw.span`text-primary-500`
const Container = tw.div`relative`;
const SingleColumn = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24`;
const HeadingInfoContainer = tw.div`flex flex-col items-center`;
const HeadingDescription = tw.p`mt-4 font-medium text-gray-600 text-center max-w-sm`;
const Content = tw.div`mt-16`;

const Form = tw.form`mt-8 md:mt-10 text-sm flex flex-col lg:flex-row`
const Input = tw.input`border-2 px-5 py-3 rounded focus:outline-none font-medium transition duration-300 hocus:border-primary-500`

const MessageInputContainer = tw.div`
  fixed
  bottom-0
  left-0
  w-full
  p-4  
`;


const SubmitButton = tw(PrimaryButtonBase)`inline-block lg:ml-6 mt-6 lg:mt-0`


export default () => {

    const [messageInput, setMessageInput] = React.useState('');

    const [chatData, setChatData] = React.useState([
        {
            key : 'dajskkld7222232',
            author : 'Tom',
            text : 'hello',
            profilePic : 'https://i.ibb.co/8gHqSLN/av1.png'
        }, {
            key : 'bdasuiyd86324',
            author : 'Jerry',
            text : 'hi, how are you?',
            profilePic : 'https://i.ibb.co/H788Jxq/av2.png'
        }, {
            key : 'bdasuiyd86324',
            author : 'Tom',
            text : 'I am fine, how about you?',
            profilePic : 'https://i.ibb.co/8gHqSLN/av1.png'
        }, {
            key : 'bdasuiyd86324',
            author : 'Jerry',
            text : 'I am fine too, thanks for asking. want to go out for a walk?',
            profilePic : 'https://i.ibb.co/8gHqSLN/av1.png'
        }, {
            key : 'bdasuiyd86324',
            author : 'Tom',
            text : 'sure, let me get ready',
            profilePic : 'https://i.ibb.co/8gHqSLN/av1.png'
        }, {

            key : 'bdasuiyd86324',
            author : 'Jerry',
            text : 'ok, see you in 5 minutes',
            profilePic : 'https://i.ibb.co/8gHqSLN/av1.png'
        
        }
    ]);

  const handleSendMessage = (message) => {
    setChatData([...chatData, {
        key : 'bdasuiyd86324',
        author : 'Jerry',
        text : message,
        profilePic : 'https://i.ibb.co/8gHqSLN/av1.png'
    }]);
    setMessageInput('');
  }



  return (
    <>
      <Container>

        <SingleColumn>
          <HeadingInfoContainer>
            <HeadingTitle>Behavioral Challenges</HeadingTitle>
          </HeadingInfoContainer>

          <Content>

            <ChatUI chatData = {chatData} messageLimit= {15} />


            <MessageInputContainer>
              <Form>
                <Input value={messageInput} onChange={ (e) => setMessageInput(e.target.value) } type="text" placeholder="Type your message here..." />
                <SubmitButton type="button" onClick={ () => handleSendMessage(messageInput)} >Send</SubmitButton>
              </Form>
            </MessageInputContainer>

          </Content>
        </SingleColumn>
      </Container>
    </>
  );
}
