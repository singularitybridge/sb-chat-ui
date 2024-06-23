import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { observer } from 'mobx-react-lite';
import { playAudio } from '../services/AudioService';
import { Avatar, AvatarStyles } from './Avatar';
import { useRootStore } from '../store/common/RootStoreContext';
import { IconButton } from './admin/IconButton';
import {
  InformationCircleIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  StarIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

interface ChatMessageProps {
  message: Message;
  autoTranslate?: boolean;
  onUserSelection?: (selection: string) => void;
  onDeleteMessage?: () => void;
}

interface MessageTextProps {
  text: string;
}

const MessageText: React.FC<MessageTextProps> = ({ text }) => {
  return <div className="mb-2">{text}</div>;
};

const MessageInfo: React.FC<MessageTextProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center">
      <div className=" bg-sky-200 rounded-full p-3 h-12 w-12 mb-2.5">
        <InformationCircleIcon className="text-sm mb-1 text-slate-600" />
      </div>
      <div className="mb-3">{text}</div>
    </div>
  );
};

const MessageSection: React.FC<MessageTextProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="  bg-slate-100 rounded-full p-1 h-6 w-6 mb-2.5">
        <StarIcon className="text-sm mb-1 text-slate-600" />
      </div>
      <div className="mb-3">{text}</div>
    </div>
  );
};

const MessageSuccess: React.FC<MessageTextProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="  bg-lime-200 rounded-full p-3 h-12 w-12 mb-2.5">
        <CheckIcon className="text-sm mb-1 text-slate-600" />
      </div>
      <div className="mb-3">{text}</div>
    </div>
  );
};

const MessageCallout: React.FC<MessageTextProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center">
      <div className=" bg-fuchsia-200 rounded-full p-3 h-12 w-12 mb-2.5">
        <MegaphoneIcon className=" text-sm mb-1 text-slate-600" />
      </div>
      <div className="mb-3">{text}</div>
    </div>
  );
};

interface MessageOptionsProps {
  options: [any];
  onOptionClick?: (option: any) => void;
}

const MessageOptions: React.FC<MessageOptionsProps> = ({
  options,
  onOptionClick,
}) => {
  const handleClick = (selection: string) => {
    if (onOptionClick) {
      onOptionClick(selection);
    }
  };

  return (
    <div className="w-full mt-4  ">
      <div className="flex flex-wrap ">
        {options.map((option, index) => (
          <div key={option.text} className=" mb-3">
            <div
              className="bg-white hover:bg-slate-100 rounded-xl flex flex-col  justify-center h-full "
              onClick={() => handleClick(option.text || option)}
            >
              {option.image && (
                <img
                  src={option.image}
                  alt={option.text || option}
                  className="rounded-xl"
                />
              )}

              <div className="flex flex-col items-center">
                <button
                  key={index}
                  className={`text-slate-600 ${
                    option.image ? 'self-start my-2' : ' my-2'
                  }`}
                >
                  {option.text || option}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderContent = (
  content: any[],
  onUserSelection?: (selection: string) => void,
) => {
  console.log(content);

  return content?.map((item, index) => {
    switch (item.type) {
      case 'text':
        return <MessageText key={index} text={item.text} />;
      case 'options':
        return (
          <MessageOptions
            key={index}
            options={item.options}
            onOptionClick={onUserSelection} // Pass onUserSelection as the onOptionClick callback
          />
        );
      case 'video':
        return (
          <video
            key={index}
            src={item.video_url}
            controls
            className="w-full my-2"
          />
        );

      case 'text-info':
        return <MessageInfo key={index} text={item.text} />;
      case 'text-success':
        return <MessageSuccess key={index} text={item.text} />;
      case 'text-callout':
        return <MessageCallout key={index} text={item.text} />;
      case 'text-section':
        return <MessageSection key={index} text={item.text} />;

      default:
        return null;
    }
  });
};

const ChatMessageStyles = {
  user: {
    container: 'col-start-1 col-end-12 p-1 rounded-lg',
    flexRow: 'flex flex-row items-center',
    message: 'relative ml-3 text-sm bg-white py-4 px-4 shadow rounded-lg',
  },
  bot: {
    container: 'col-start-2 col-end-13 p-3 rounded-lg',
    flexRow: 'flex items-center justify-start flex-row-reverse',
    message: 'relative mr-3 text-sm bg-indigo-100 py-4 px-4 shadow rounded-lg',
  },
};

const ChatMessage: React.FC<ChatMessageProps> = observer(
  ({ message, onUserSelection, onDeleteMessage }) => {
    const { activeChatbot, userProfile } = useRootStore();

    const messageStyles =
      message.role === SenderType.user
        ? ChatMessageStyles.user
        : ChatMessageStyles.bot;
    const avatarImage =
      message.role === SenderType.user
        ? userProfile?.avatar
        : activeChatbot?.avatarImage;

    return (
      <>
        <div
          className={messageStyles.container}
          // onClick={() => playAudio(message.audio)}
        >
          <div className={messageStyles.flexRow}>
            <Avatar
              imageUrl={avatarImage || '/images/avatars/av1.png'}
              avatarStyle={AvatarStyles.avatar}
            />
            <div
              className={messageStyles.message}
              // style={{
              //   direction:
              //     chatBot &&
              //     chatBot.autoTranslate &&
              //     chatBot.autoTranslateTarget === "he"
              //       ? "rtl"
              //       : "ltr",
              // }}
            >
              {/* <div>{sanitizeMessageText(getMessageText(message))}</div> */}
              {/* <div>{message.content}</div> */}
              {/* <div>{renderContent(message.content)}</div> */}
              <div>{renderContent(message.content, onUserSelection)}</div>{' '}
              {/* Pass onUserSelection to renderContent */}
            </div>
            <div>
              <IconButton
                icon={<XCircleIcon className="w-5 h-5 text-slate-100 m-3" />}
                onClick={onDeleteMessage || (() => {})}
              />
            </div>
          </div>
        </div>
      </>
    );
  },
);

export { ChatMessage, ChatMessageStyles };
