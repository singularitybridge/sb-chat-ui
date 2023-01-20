import React from 'react';
import styled from 'styled-components';

const TopBarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3f51b5;
  height: 50px;
  width: 100%;
  box-sizing: border-box;
  color: white;
`;

const AppName = styled.span`
  font-size: 20px;
  font-weight: bold;
`

const TopBar = () => {
  return (
    <TopBarContainer>
      <AppName>Happy Together</AppName>
    </TopBarContainer>
  );
}

export default TopBar;
