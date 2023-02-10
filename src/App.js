import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Route, Switch } from "react-router-dom";
import styled from "styled-components";
import tw from "twin.macro";
import GlobalStyles from "styles/GlobalStyles";
import { css } from "styled-components/macro"; //eslint-disable-line
import { slide as Menu } from "react-burger-menu";
import Footer from "components/footers/SimpleFiveColumn.js";
import { Features, PlansContainer } from "components/pricing/ThreePlans";
import { ReactComponent as CheckboxIcon } from "images/checkbox-circle.svg";
import ComponentRenderer from "ComponentRenderer.js";
import MainLandingPage from "MainLandingPage.js";
import ThankYouPage from "ThankYouPage.js";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import Signup from "pages/Signup";
import VerticalWithAlternateImageAndText from "components/features/VerticalWithAlternateImageAndText";
import ServiceLandingPage from "demos/ServiceLandingPage";
import HeaderBase, {
  NavLinks,
  NavLink,
  PrimaryLink,
} from "components/headers/light.js";
import Articles from "pages/Articles";
import Profile from "pages/Profile";
import Loading from "pages/Loading";
import { Chat } from "pages/Chat";
import AnimationRevealPage from "helpers/AnimationRevealPage";
import ChatBots from "pages/ChatBots";

const PlanFeatures = styled.ul`
  ${tw`mt-2 flex-1 lg:-mx-6 -mx-6 sm:-mx-10 py-10 px-6 sm:px-10 lg:p-6 xl:-mx-10 xl:p-10`}
  .feature {
    ${tw`flex items-start mt-2 first:mt-0`}
    .icon {
      ${tw`w-6 h-6 text-teal-500 flex-shrink-0`}
    }
    .text {
      ${tw`font-semibold text-teal-600 tracking-wide ml-3`}
    }
  }
`;

const Header = tw(HeaderBase)`max-w-none`;
const buttonRoundedCss = tw`rounded-full`;

export default function App() {
  const { isLoading, isAuthenticated, error, loginWithRedirect, logout } =
    useAuth0();
  const [loginStatus, setLoginStatus] = useState(null);

  // If you want to disable the animation just use the disabled `prop` like below on your page's component
  // return <AnimationRevealPage disabled>xxxxxxxxxx</AnimationRevealPage>;

  const navLinks = [
    <NavLinks key={1}>
      <NavLink href="/">Grow</NavLink>
      <NavLink href="/chat">Share</NavLink>
      <NavLink href="/chat-bots">Therapists</NavLink>
      <NavLink href="/profile">Me</NavLink>
    </NavLinks>,
    <NavLinks key={2}>
      {!isAuthenticated ? (
        <>
          <NavLink href="" onClick={() => loginWithRedirect()} tw="lg:ml-12!">
            Login
          </NavLink>
          <PrimaryLink
            href=""
            css={buttonRoundedCss}
            onClick={() => loginWithRedirect()}
          >
            Sign Up
          </PrimaryLink>
        </>
      ) : (
        <NavLink href="" onClick={() => logout()} tw="lg:ml-12!">
          Logout
        </NavLink>
      )}
    </NavLinks>,
  ];

  useEffect(() => {
    if (isLoading) {
      setLoginStatus("loading");
    } else if (error) {
      setLoginStatus("error");
    } else if (isAuthenticated) {
      setLoginStatus("authenticated");
    } else {
      setLoginStatus("unauthenticated");
    }
  }, [isLoading, error, isAuthenticated]);

  let component;
  switch (loginStatus) {
    case "authenticated":
      component = <Articles />;
      break;
    case "unauthenticated":
      component = <Signup />;
      break;
    default:
      component = <Loading />;
  }

  return (
    <>
      <GlobalStyles />
      <AnimationRevealPage>
        <Header links={navLinks} />
        <Router>
          <Routes>
            <Route path="/profile" element={<Profile />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat-bots" element={<ChatBots />} />
            <Route
              path="/components/:type/:subtype/:name"
              element={<ComponentRenderer />}
            />
            <Route
              path="/components/:type/:name"
              element={<ComponentRenderer />}
            />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/" element={component} />
          </Routes>
        </Router>
      </AnimationRevealPage>
    </>
  );
}
