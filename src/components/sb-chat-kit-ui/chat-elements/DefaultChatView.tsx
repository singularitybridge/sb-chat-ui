import React from 'react';
import Button from '../../sb-core-ui-kit/Button';
import { TextComponent } from '../../sb-core-ui-kit/TextComponent';
import { Avatar, AvatarStyles } from '../../Avatar';

interface ConversationStarter {
  key: string;
  value: string;
}

interface DefaultChatViewProps {
  assistant: {
    name: string;
    description: string;
    avatar: string;
    conversationStarters?: ConversationStarter[];
  };
  onSendMessage?: (message: string) => void;
}

const DefaultChatView: React.FC<DefaultChatViewProps> = ({ assistant, onSendMessage }) => {
  const handleStarterClick = (starter: ConversationStarter) => {
    if (onSendMessage) {
      onSendMessage(starter.value);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Avatar
        avatarStyle={AvatarStyles.large}
        imageUrl={`/assets/avatars/${assistant.avatar}.png`}
        active={true}
      />

      <div className="flex flex-col my-8 max-w-lg space-y-1">
        <TextComponent text={assistant.name} size="title" />
        <TextComponent
          text={assistant.description}
          size="medium"
          color="secondary"
        />
      </div>

      <div className="flex flex-col space-y-2 w-full max-w-md">
        {assistant.conversationStarters?.map((starter, index) => (
          <Button
            key={index}
            onClick={() => handleStarterClick(starter)}
            variant="secondary"
            additionalClassName="text-left rtl:text-right"
          >
            {starter.key}
          </Button>
        ))}
      </div>
    </div>
  );
};

export { DefaultChatView };
