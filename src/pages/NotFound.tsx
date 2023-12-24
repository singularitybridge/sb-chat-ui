import { ContainerBGImage } from '../components/ContainerBGImage';
import { ContentContainer } from '../components/ContentContainer';
import { ContentPageContainer } from '../components/ContentPageContainer';

export const NotFound = () => {
  return (
    <ContentContainer>
      <ContainerBGImage bgImage="/not-found.png">
        <ContentPageContainer>
          <h1 className=" text-3xl mb-6">Whoops! The Chatbot Escaped</h1>
          <p>
            Looks like the chatbot you were looking for has gone rogue and
            escaped from our lab. Don't worry, our team of highly trained AI
            experts are on the case and are working tirelessly to catch it and
            bring it back. In the meantime, why not try chatting with one of our
            other chatbots? They promise to behave and stay within their
            designated areas. Thank you for your understanding and patience.
          </p>
        </ContentPageContainer>
      </ContainerBGImage>
    </ContentContainer>
  );
};
