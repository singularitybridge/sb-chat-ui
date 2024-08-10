import React from 'react';
import Button from '../../sb-core-ui-kit/Button';
import { TextComponent } from '../../sb-core-ui-kit/TextComponent';
import { Avatar, AvatarStyles } from '../../Avatar';

interface DefaultChatViewProps {
  assistant: {
    name: string;
    description: string;
    avatar: string;
  };
}

const DefaultChatView: React.FC<DefaultChatViewProps> = ({ assistant }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Avatar
        avatarStyle={AvatarStyles.large}
        imageUrl={`/assets/avatars/${assistant.avatar}.png`}
        className="w-24 h-24 bg-indigo-100 mb-3"
      />

      <div className="flex flex-col mb-6 max-w-lg space-y-3">
        <TextComponent text={assistant.name} size="title" />
        <TextComponent text={assistant.description} size="medium" color="secondary" />
      </div>

      <div className="flex flex-row space-x-4 rtl:space-x-reverse">
        <Button
          onClick={() => {
            // TODO: Implement start chat functionality
          }}
          variant="secondary"
        >
          התחל שיחה
        </Button>
        <Button
          onClick={() => {
            // TODO: Implement ask question functionality
          }}
          variant="secondary"
        >
          שאל שאלה
        </Button>
      </div>
    </div>
  );
};

export { DefaultChatView };
