import React from 'react';
import { TextComponent } from './sb-core-ui-kit/TextComponent';

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

interface AvatarSelectorProps {
  avatars: Avatar[];
  selectedAvatarId: string | null;
  onSelectAvatar: (avatarId: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  avatars,
  selectedAvatarId,
  onSelectAvatar,
}) => {
  return (
    <div>
      <TextComponent text="Select an avatar" size="medium" className="mb-2" />
      <div className="grid grid-cols-3 gap-4">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className={`cursor-pointer p-2 rounded-md ${
              selectedAvatarId === avatar.id ? 'bg-blue-100' : ''
            }`}
            onClick={() => onSelectAvatar(avatar.id)}
          >
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="w-full h-auto rounded-md"
            />
            <TextComponent text={avatar.name} size="small" className="mt-1 text-center" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
