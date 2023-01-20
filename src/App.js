import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Route, Switch } from "react-router-dom";
import styled from "styled-components";
import tw from "twin.macro";
import GlobalStyles from "styles/GlobalStyles";
import { css } from "styled-components/macro"; //eslint-disable-line
import { slide as Menu } from 'react-burger-menu';
import Footer from "components/footers/SimpleFiveColumn.js";
import { Features, PlansContainer } from "components/pricing/ThreePlans";
import { ReactComponent as CheckboxIcon } from "images/checkbox-circle.svg";
/*
 * This is the entry point component of this project. You can change the below exported default App component to any of
 * the prebuilt landing page components by uncommenting their import and export lines respectively.
 * See one of the landing page components to better understand how to import and render different components (Always
 * make sure if you are building your own page, the root component should be the AnimationRevealPage component. You can
 * disable the animation by using the disabled prop.
 *
 * The App component below is using React router to render the landing page that you see on the live demo website
 * and the component previews.
 *
 */

/* Use AnimationRevealPage as a wrapper component for your pages if you are building a custom one yourself */
// import AnimationRevealPage from "helpers/AnimationRevealPage.js";

/*
 * Hero section is the top most section on the page. It contains the header as well.
 * So you dont need to import headers
 * separately
 */

// import Hero from "components/hero/TwoColumnWithVideo.js";
// import Hero from "components/hero/TwoColumnWithInput.js";
// import Hero from "components/hero/TwoColumnWithFeaturesAndTestimonial.js";
// import Hero from "components/hero/TwoColumnWithPrimaryBackground.js";
// import Hero from "components/hero/FullWidthWithImage.js";
// import Hero from "components/hero/BackgroundAsImage.js";
// import Hero from "components/hero/BackgroundAsImageWithCenteredContent.js";

// import Features from "components/features/ThreeColSimple.js";
// import Features from "components/features/ThreeColWithSideImage.js";
// import Features from "components/features/ThreeColWithSideImageWithPrimaryBackground.js";
// import Features from "components/features/VerticalWithAlternateImageAndText.js";
// import Features from "components/features/DashedBorderSixFeatures";
// import MainFeature from "components/features/TwoColWithButton.js";
// import MainFeature from "components/features/TwoColSingleFeatureWithStats.js";
// import MainFeature2 from "components/features/TwoColSingleFeatureWithStats2.js";
// import MainFeature from "components/features/TwoColWithTwoHorizontalFeaturesAndButton.js";
// import FeatureWithSteps from "components/features/TwoColWithSteps.js";
// import FeatureStats from "components/features/ThreeColCenteredStatsPrimaryBackground.js";

// import Pricing from "components/pricing/ThreePlans.js";
// import Pricing from "components/pricing/ThreePlansWithHalfPrimaryBackground.js";
// import Pricing from "components/pricing/TwoPlansWithDurationSwitcher.js";

// import SliderCard from "components/cards/ThreeColSlider.js";
// import TrendingCard from "components/cards/TwoTrendingPreviewCardsWithImage.js";
// import Portfolio from "components/cards/PortfolioTwoCardsWithImage.js";
// import TabGrid from "components/cards/TabCardGrid.js";

// import Blog from "components/blogs/ThreeColSimpleWithImage.js";
// import Blog from "components/blogs/ThreeColSimpleWithImageAndDashedBorder.js";
// import Blog from "components/blogs/PopularAndRecentBlogPosts.js";
// import Blog from "components/blogs/GridWithFeaturedPost.js";

// import Testimonial from "components/testimonials/TwoColumnWithImage.js";
// import Testimonial from "components/testimonials/TwoColumnWithImageAndProfilePictureReview.js";
// import Testimonial from "components/testimonials/TwoColumnWithImageAndRating.js";
// import Testimonial from "components/testimonials/ThreeColumnWithProfileImage.js";
// import Testimonial from "components/testimonials/SimplePrimaryBackground.js";

// import FAQ from "components/faqs/SimpleWithSideImage.js";
// import FAQ from "components/faqs/SingleCol.js";
// import FAQ from "components/faqs/TwoColumnPrimaryBackground.js";

// import ContactUsForm from "components/forms/SimpleContactUs.js";
// import ContactUsForm from "components/forms/TwoColContactUsWithIllustration.js";
// import SubscribeNewsLetterForm from "components/forms/SimpleSubscribeNewsletter.js";
//
// import GetStarted from "components/cta/GetStarted.js";
// import GetStarted from "components/cta/GetStartedLight.js";
// import DownloadApp from "components/cta/DownloadApp.js";

// import Footer from "components/footers/SimpleFiveColumn.js";
// import Footer from "components/footers/FiveColumnWithInputForm.js";
// import Footer from "components/footers/FiveColumnWithBackground.js";
// import Footer from "components/footers/FiveColumnDark.js";
// import Footer from "components/footers/MiniCenteredFooter.js";

/* Ready Made Pages (from demos folder) */
// import EventLandingPage from "demos/EventLandingPage.js";
// import HotelTravelLandingPage from "demos/HotelTravelLandingPage.js";
// import AgencyLandingPage from "demos/AgencyLandingPage.js";
// import SaaSProductLandingPage from "demos/SaaSProductLandingPage.js";
// import RestaurantLandingPage from "demos/RestaurantLandingPage.js";
// import ServiceLandingPage from "demos/ServiceLandingPage.js";
// import HostingCloudLandingPage from "demos/HostingCloudLandingPage.js";

/* Inner Pages */
// import LoginPage from "pages/Login.js";
// import SignupPage from "pages/Signup.js";
// import PricingPage from "pages/Pricing.js";
// import AboutUsPage from "pages/AboutUs.js";
// import ContactUsPage from "pages/ContactUs.js";
// import BlogIndexPage from "pages/BlogIndex.js";
// import TermsOfServicePage from "pages/TermsOfService.js";
// import PrivacyPolicyPage from "pages/PrivacyPolicy.js";

import ComponentRenderer from "ComponentRenderer.js";
import MainLandingPage from "MainLandingPage.js";
import ThankYouPage from "ThankYouPage.js";

import { BrowserRouter as Router, Routes } from "react-router-dom";
import Signup from "pages/Signup";
import VerticalWithAlternateImageAndText from "components/features/VerticalWithAlternateImageAndText";
import ServiceLandingPage from "demos/ServiceLandingPage";
import HeaderBase, { NavLinks, NavLink, PrimaryLink } from "components/headers/light.js";
import Articles from "pages/Articles";
import Profile from "pages/Profile";
import Loading from "pages/Loading";
import AnimationRevealPage from "helpers/AnimationRevealPage";

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



var styles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '30px',
    height: '30px',
    left: '9px',
    top: '9px'
  },
  bmBurgerBars: {
    background: '#d6edff'
  },
  bmBurgerBarsHover: {
    background: '#a90000'
  },
  bmCrossButton: {
    height: '24px',
    width: '24px'
  },
  bmCross: {
    background: '#bdc3c7'
  },
  bmMenuWrap: {
    position: 'fixed',
    height: '100%'
  },
  bmMenu: {
    background: '#373a47',
    padding: '1.5em 1.5em 0',
    fontSize: '1.15em'
  },
  bmMorphShape: {
    fill: '#373a47'
  },
  bmItemList: {
    color: '#b8b7ad',
    padding: '0.8em'
  },
  bmItem: {
    display: 'inline-block'
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  }
}

const buttonRoundedCss = tw`rounded-full`;


export default function App() {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const [loginStatus, setLoginStatus] = useState(null);

  // If you want to disable the animation just use the disabled `prop` like below on your page's component
  // return <AnimationRevealPage disabled>xxxxxxxxxx</AnimationRevealPage>;

  const navLinks = [
    <NavLinks key={1}>
      <NavLink href="/">Learn & Grow</NavLink>
      <NavLink href="/chat">Chat</NavLink>
      <NavLink href="/profile">Profile</NavLink>
    </NavLinks>,
    <NavLinks key={2}>
      <NavLink href="/#" tw="lg:ml-12!">
        Login
      </NavLink>
      <PrimaryLink css={buttonRoundedCss} href="/#">
        Sign Up
      </PrimaryLink>
    </NavLinks>
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
    case 'authenticated':
      component = <Articles />;
      break;
    case 'unauthenticated':
      component = <Signup />;
      break;
    default:
      component = <Loading />;
  }

  return (
    // <>    
      // {loginStatus === "loading" && "Loading"}
      // {loginStatus === "error" && "Error"}
      // {loginStatus !== "loading" && (
      //   <>
      //     {loginStatus === "authenticated" && (
      //       <Route path="/" component={VerticalWithAlternateImageAndText} />
      //     )}
      //     {loginStatus === "unauthenticated" && (
      //       <Route path="/" component={Signup} />
      //     )}
      //   </>
      // )}
    // </>

    <>
      <GlobalStyles />
      
      

      <AnimationRevealPage>
      
        <Header links={navLinks} />
{/*       
      <Menu styles={styles}>
        <PlansContainer>

          <h2>Menu</h2>

          <PlanFeatures>
          {['Grow', 'Talk', 'Profile', 'Logout'].map((feature, index) => (

            <li className="feature" key={index}>
              <CheckboxIcon className="icon" />
              <span className="text">{feature}</span>
            </li>

     
                    ))}
          </PlanFeatures>
        </PlansContainer>
      </Menu> */}      
      <Router>
        <Routes>
          <Route path="/profile" element={ <Profile /> } />
          <Route path="/components/:type/:subtype/:name" element={<ComponentRenderer />} />
          <Route path="/components/:type/:name" element={<ComponentRenderer />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          {/* <Route path="/" element={<MainLandingPage />} /> */}

          <Route path="/" element={ component } />
          {/* <Route path="/" element={ loginStatus==="authenticated" ? <Articles />  : <Signup /> } /> */}
          
            
              {/* {loginStatus === "authenticated" && (
                // <Route path="/" component={MainLandingPage} />
                <Route path="/" element={<MainLandingPage />} />
              )}
              {loginStatus === "unauthenticated" && (
                <Route path="/" component={<MainLandingPage />} />
              )}
             */}
          

        </Routes>
      </Router>
      <Footer />
      </AnimationRevealPage>
    </>
  );
}

// export default EventLandingPage;
// export default HotelTravelLandingPage;
// export default AgencyLandingPage;
// export default SaaSProductLandingPage;
// export default RestaurantLandingPage;
// export default ServiceLandingPage;
// export default HostingCloudLandingPage;

// export default LoginPage;
// export default SignupPage;
// export default PricingPage;
// export default AboutUsPage;
// export default ContactUsPage;
// export default BlogIndexPage;
// export default TermsOfServicePage;
// export default PrivacyPolicyPage;

// export default MainLandingPage;
