import React, { useEffect, useState } from "react";
import styled from "styled-components";
import tw from "twin.macro";
import { ReactComponent as SvgDotPatternIcon } from "../images/dot-pattern.svg";
import { SectionHeading as HeadingTitle } from "../components/misc/Headings.js";
import { css } from "styled-components/macro"; //eslint-disable-line
import { slide as Menu } from "react-burger-menu";
import TopBar from "components/headers/topBar";
import axios from "axios";
import { ReactComponent as StarIcon } from "images/star-icon.svg";
import { motion } from "framer-motion";
import { PrimaryButton as PrimaryButtonBase } from "components/misc/Buttons.js";

const Container = tw.div`relative`;

const SingleColumn = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24`;

const HeadingInfoContainer = tw.div`flex flex-col items-center`;
const HeadingDescription = tw.p`mt-4 font-medium text-gray-600 text-center max-w-sm`;

const Content = tw.div`mt-16`;

const CardContainer = tw.div`mt-10 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 sm:pr-10 md:pr-6 lg:pr-12`;
const CardImageContainer = styled.div`
  ${(props) =>
    css`
      background-image: url("${props.imageSrc}");
    `}
  ${tw`h-56 xl:h-64 bg-center bg-cover relative rounded-t`}
`;
const CardRatingContainer = tw.div`leading-none absolute inline-flex bg-gray-100 bottom-0 left-0 ml-4 mb-4 rounded-full px-5 py-2 items-end`;
const CardRating = styled.div`
  ${tw`mr-1 text-sm font-bold flex items-end`}
  svg {
    ${tw`w-4 h-4 fill-current text-orange-400 mr-1`}
  }
`;

const CardHoverOverlay = styled(motion.div)`
  background-color: rgba(255, 255, 255, 0.5);
  ${tw`absolute inset-0 flex justify-center items-center`}
`;
const CardButton = tw(PrimaryButtonBase)`text-sm`;

const CardReview = tw.div`font-medium text-xs text-gray-600`;

const CardText = tw.div`p-4 text-gray-900`;
const CardTitle = tw.h5`text-lg font-semibold group-hover:text-primary-500`;
const CardContent = tw.p`mt-1 text-sm font-medium text-gray-600`;
const CardPrice = tw.p`mt-4 text-xl font-bold`;

const Card = tw(
  motion.a
)`bg-gray-200 rounded-b block max-w-xs mx-auto sm:max-w-none sm:mx-0`;
const Image = styled.div((props) => [
  `background-image: url("${props.imageSrc}");`,
  tw`rounded md:w-1/2 lg:w-5/12 xl:w-1/3 flex-shrink-0 h-80 md:h-144 bg-cover bg-center mx-4 sm:mx-8 md:mx-4 lg:mx-8`,
]);
const Details = tw.div`mt-4 md:mt-0 md:max-w-md mx-4 sm:mx-8 md:mx-4 lg:mx-8`;
const Subtitle = tw.div`font-bold tracking-wide text-secondary-100`;
const Title = tw.h4`text-3xl font-bold text-gray-900`;
const Description = tw.p`mt-2 text-sm leading-loose`;
const Link = tw.a`inline-block mt-4 text-sm text-primary-500 font-bold cursor-pointer transition duration-300 border-b-2 border-transparent hover:border-primary-500`;

const SvgDotPattern1 = tw(
  SvgDotPatternIcon
)`absolute top-0 left-0 transform -translate-x-20 rotate-90 translate-y-8 -z-10 opacity-25 text-primary-500 fill-current w-24`;
const SvgDotPattern2 = tw(
  SvgDotPatternIcon
)`absolute top-0 right-0 transform translate-x-20 rotate-45 translate-y-24 -z-10 opacity-25 text-primary-500 fill-current w-24`;
const SvgDotPattern3 = tw(
  SvgDotPatternIcon
)`absolute bottom-0 left-0 transform -translate-x-20 rotate-45 -translate-y-8 -z-10 opacity-25 text-primary-500 fill-current w-24`;
const SvgDotPattern4 = tw(
  SvgDotPatternIcon
)`absolute bottom-0 right-0 transform translate-x-20 rotate-90 -translate-y-24 -z-10 opacity-25 text-primary-500 fill-current w-24`;

export default () => {
 
  const [stories, setStories] = useState([]);

  useEffect(() => {
    axios({
      method: "GET",
      url: "https://api.baserow.io/api/database/rows/table/132652/?user_field_names=true",
      headers: {
        Authorization: "token xYNbZuE6CN4KarOStEiUnMqQTU920uw6",
      },
    }).then((response) => {
      console.log("data back");
      console.log(response.data.results);
      setStories(response.data.results);
    });
  }, []);

  const cards = [
    {
      imageSrc: "https://images.unsplash.com/photo-1550699026-4114bbf4fb49?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=632&q=80",    
      title: "Dr. Empathy",
      content:"Specializes in helping parents understand and empathize with their child's perspective",    
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1550699026-4114bbf4fb49?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=632&q=80",    
      title: "Mr. Consistency",
      content:"Specializes in helping parents set and enforce consistent boundaries and rules",    
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1550699026-4114bbf4fb49?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=632&q=80",    
      title: "Ms. Communication",
      content:"Specializes in helping parents improve communication with their child.",    
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1550699026-4114bbf4fb49?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=632&q=80",    
      title: "Dr. Positive Reinforcement",
      content:"Specializes in helping parents implement positive reinforcement strategies to encourage good behavior",    
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1550699026-4114bbf4fb49?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=632&q=80",    
      title: "Mr. Behavioral Challenge",
      content:"Specializes in helping parents manage behavioral challenges such as tantrums or self-injurious behavior.",    
    },
    {
      imageSrc: "https://images.unsplash.com/photo-1550699026-4114bbf4fb49?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=632&q=80",    
      title: "Ms. Self-Regulation",
      content:"Specializes in helping parents and children develop self-regulation skills, such as sleep and stress management.",    
    },
  ];

  return (
    <Container>
      {/* <TopBar /> */}
      <SingleColumn>
        <HeadingInfoContainer>
          <HeadingTitle>Chat Bots</HeadingTitle>
          <HeadingDescription>
            Meet our team, they are excited to serve you.
          </HeadingDescription>
        </HeadingInfoContainer>

        <Content>
          {cards.map((card, index) => (
          <CardContainer key={"s1"}>
            <Card
              className="group"
              href={card.url}
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <CardImageContainer imageSrc={card.imageSrc}>
                <CardHoverOverlay
                  variants={{
                    hover: {
                      opacity: 1,
                      height: "auto",
                    },
                    rest: {
                      opacity: 0,
                      height: 0,
                    },
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <CardButton>Chat</CardButton>
                </CardHoverOverlay>
              </CardImageContainer>
              <CardText>
                <CardTitle>{card.title}</CardTitle>
                <CardContent>{card.content}</CardContent>
              </CardText>
            </Card>
          </CardContainer>
          ))}
        </Content>
      </SingleColumn>
      <SvgDotPattern1 />
      <SvgDotPattern2 />
      <SvgDotPattern3 />
      <SvgDotPattern4 />
    </Container>
  );
};
