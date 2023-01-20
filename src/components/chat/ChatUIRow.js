import React from "react";

import tw from "twin.macro";
import styled, { css } from "styled-components/macro"; //eslint-disable-line

const CustomerInfoAndControlsContainer = tw.div`mt-8 flex items-center flex-col sm:flex-row justify-center text-center sm:text-left`;
const CustomerImage = tw.img`w-16 h-16 rounded-full`;
const CustomerNameAndProfileContainer = tw.div`mt-4 sm:mt-0 sm:ml-4 flex flex-col`;
const CustomerName = tw.span`text-lg font-semibold`;
const CustomerProfile = tw.span`text-sm font-normal text-gray-700`;
const ControlsContainer = tw.div`sm:ml-auto flex`;
const ControlButton = styled.button`
  ${tw`text-gray-600 hover:text-primary-700 focus:outline-none transition-colors duration-300 ml-4 first:ml-0 sm:first:ml-4 mt-4 sm:mt-0`}
  .icon {
    ${tw`fill-current w-6`}
  }
`;

function ChatUIRow(props) {
  const { author, text, profilePic } = props;
  return (
    <>
      <CustomerInfoAndControlsContainer>
        <CustomerImage src={profilePic} />
        <CustomerNameAndProfileContainer>
          <CustomerName>{author}</CustomerName>
          <CustomerProfile>{text}</CustomerProfile>
        </CustomerNameAndProfileContainer>
        <ControlsContainer></ControlsContainer>
      </CustomerInfoAndControlsContainer>
    </>
  );
}

export default ChatUIRow;
