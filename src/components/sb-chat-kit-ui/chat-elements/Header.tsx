/// file_path: src/components/sb-chat-kit-ui/chat-elements/Header.tsx
import React, { useState } from 'react';
import { CircleFadingPlus, Monitor, Settings, Copy } from 'lucide-react';
import { Avatar, AvatarStyles } from '../../Avatar';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../../store/useSessionStore';
import { emitter } from '../../../services/mittEmitter';
import { EVENT_SHOW_NOTIFICATION } from '../../../utils/eventNames';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  title: string;
  description: string;
  avatar: string;
  onClear: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  avatar,
  onClear,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { activeSession } = useSessionStore();
  const { t } = useTranslation();

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const handleScreenShare = () => {
    // Navigate to home workspace - can be expanded to support different workspaces
    navigate('/screenshare/home');
  };

  const handleEditAssistant = () => {
    if (activeSession?.assistantId) {
      navigate(`/admin/assistants/${activeSession.assistantId}`);
    }
  };

  const handleCopyAssistantId = () => {
    if (activeSession?.assistantId) {
      navigator.clipboard.writeText(activeSession.assistantId)
        .then(() => {
          emitter.emit(EVENT_SHOW_NOTIFICATION, {
            message: t('AssistantsPage.copySuccess'),
            type: 'success',
          });
        })
        .catch((err) => {
          console.error('Failed to copy assistant ID:', err);
          emitter.emit(EVENT_SHOW_NOTIFICATION, {
            message: t('AssistantsPage.copyFailed'),
            type: 'error',
          });
        });
    }
  };

  const renderDescription = () => {
    if (description.length > 100 && !isExpanded) {
      return (
        <p
          className="text-sm text-[#6b7280] leading-4 "
          onClick={toggleDescription}
        >
          {`${description.substring(0, 97)}...`}
        </p>
      );
    }
    return (
      <p
        className="text-sm text-[#6b7280] leading-4"
        onClick={toggleDescription}
      >
        {description}
      </p>
    );
  };

  return (
    <div className="flex justify-between items-start space-x-4 rtl:space-x-reverse mb-4 p-3 border-b border-b-gray-200">
      <Avatar
        avatarStyle={AvatarStyles.medium}
        imageUrl={`/assets/avatars/${avatar}.png`}
        active={true}
      />

      <div className="flex-1">
        <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
        <div className="flex items-start pb-5">{renderDescription()}</div>
      </div>

      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <button
          onClick={handleCopyAssistantId}
          className="p-1 rounded-full transition-colors hover:bg-gray-100"
          aria-label="Copy assistant ID"
          title="Copy assistant ID"
          disabled={!activeSession?.assistantId}
        >
          <Copy className="w-6 h-6 text-gray-500 hover:text-primary-600" />
        </button>
        <button
          onClick={handleEditAssistant}
          className="p-1 rounded-full transition-colors hover:bg-gray-100"
          aria-label="Edit assistant"
          title="Edit assistant"
          disabled={!activeSession?.assistantId}
        >
          <Settings className="w-6 h-6 text-gray-500 hover:text-primary-600" />
        </button>
        <button
          onClick={handleScreenShare}
          className="p-1 rounded-full transition-colors hover:bg-gray-100"
          aria-label="Share screen"
          title="Share screen"
        >
          <Monitor className="w-6 h-6 text-gray-500 hover:text-primary-600" />
        </button>
        <button
          onClick={onClear}
          className="p-1 rounded-full transition-colors hover:bg-gray-100"
          aria-label="Clear chat"
        >
          <CircleFadingPlus className="w-6 h-6 text-gray-500 hover:text-primary-600" />
        </button>
      </div>
    </div>
  );
};

export { Header };
