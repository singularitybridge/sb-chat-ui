import React from "react";
import tw from "twin.macro";
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

const HighlightedText = tw.span`text-primary-500`
const Container = tw.div`relative`;
const SingleColumn = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24`;
const HeadingInfoContainer = tw.div`flex flex-col items-center`;
const HeadingDescription = tw.p`mt-4 font-medium text-gray-600 text-center max-w-sm`;
const Content = tw.div`mt-16`;

export default () => {
  return (
    <>
      <Container>
        <h3>Loading ...</h3>

        <SingleColumn>
          <HeadingInfoContainer>
            <HeadingTitle>Please Wait ...</HeadingTitle>
            <HeadingDescription>
            Your account is being made with love and care, just a moment more
            </HeadingDescription>
          </HeadingInfoContainer>

          <Content></Content>
        </SingleColumn>
      </Container>
    </>
  );
}
