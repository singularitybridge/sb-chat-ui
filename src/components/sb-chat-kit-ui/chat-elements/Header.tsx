/// file_path: src/components/sb-chat-kit-ui/chat-elements/Header.tsx
import React, { useState } from 'react';
import { CircleFadingPlus, Pause, Volume2, VolumeX } from 'lucide-react';
import { Avatar, AvatarStyles } from '../../Avatar';

type AudioState = 'disabled' | 'enabled' | 'playing';

interface HeaderProps {
  title: string;
  description: string;
  avatar: string;
  onClear: () => void;
  onToggleAudio: () => void;
  audioState: AudioState;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  avatar,
  onClear,
  onToggleAudio,
  audioState,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
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

  const renderAudioButton = () => {
    switch (audioState) {
      case 'disabled':
        return (
          <VolumeX className="w-6 h-6 text-gray-500 hover:text-primary-600" />
        );
      case 'enabled':
        return (
          <Volume2 className="w-6 h-6 text-lime-500 hover:text-primary-600" />
        );
      case 'playing':
        return (
          <Pause className="w-6 h-6 text-lime-500 hover:text-primary-600" />
        );
    }
  };

  return (
    <div className="flex justify-between items-start space-x-3.5 rtl:space-x-reverse mb-3 bg-slate-100 p-3 rounded-2xl">
      <Avatar
        avatarStyle={AvatarStyles.large}
        imageUrl={`/assets/avatars/${avatar}.png`}
        className="bg-indigo-100"
      />

      <div className="flex-1">
        <h2 className="font-semibold text-lg tracking-tight">{title}</h2>
        <div className="flex items-start pb-5">{renderDescription()}</div>
      </div>

      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <button
          onClick={onToggleAudio}
          className="p-1 rounded-full transition-colors hover:bg-gray-100"
          aria-label={
            audioState === 'disabled' ? 'Enable audio' : 'Disable audio'
          }
        >
          {renderAudioButton()}
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
