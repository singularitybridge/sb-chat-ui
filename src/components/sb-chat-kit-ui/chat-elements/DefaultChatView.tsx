import React from 'react';
import Button from '../../sb-core-ui-kit/Button';
import { TextComponent } from '../../sb-core-ui-kit/TextComponent';

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
      <img
        className="w-24 h-24 rounded-full bg-indigo-100 mb-3"
        src={assistant.avatar}
        alt="Avatar"
        loading="lazy"
      />

      <div className="flex flex-col mb-6 max-w-lg space-y-3">
        <TextComponent text={assistant.name} size="title" />
        <TextComponent text={assistant.description} size="medium" color='secondary' />
      </div>

      <div className="flex flex-row space-x-4 rtl:space-x-reverse">
        <Button
          onClick={() => {
            /* Implement functionality */
          }}
          variant="secondary"
        >
          התחל שיחה
        </Button>
        <Button
          onClick={() => {
            /* Implement functionality */
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
