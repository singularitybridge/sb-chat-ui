import React from 'react';
import { TextComponent } from './sb-core-ui-kit/TextComponent';

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

interface AvatarSelectorProps {
  selectedAvatarId: string | null;
  onSelectAvatar: (avatarId: string) => void;
}

const avatars: Avatar[] = [
  { id: 'avatar-_0000_29', name: 'Avatar 29', imageUrl: '/assets/avatars/avatar-_0000_29.png' },
  { id: 'avatar-_0001_28', name: 'Avatar 28', imageUrl: '/assets/avatars/avatar-_0001_28.png' },
  { id: 'avatar-_0002_27', name: 'Avatar 27', imageUrl: '/assets/avatars/avatar-_0002_27.png' },
  { id: 'avatar-_0003_26', name: 'Avatar 26', imageUrl: '/assets/avatars/avatar-_0003_26.png' },
  { id: 'avatar-_0004_25', name: 'Avatar 25', imageUrl: '/assets/avatars/avatar-_0004_25.png' },
  { id: 'avatar-_0005_24', name: 'Avatar 24', imageUrl: '/assets/avatars/avatar-_0005_24.png' },
  { id: 'avatar-_0006_23', name: 'Avatar 23', imageUrl: '/assets/avatars/avatar-_0006_23.png' },
  { id: 'avatar-_0007_22', name: 'Avatar 22', imageUrl: '/assets/avatars/avatar-_0007_22.png' },
  { id: 'avatar-_0008_21', name: 'Avatar 21', imageUrl: '/assets/avatars/avatar-_0008_21.png' },
  { id: 'avatar-_0009_20', name: 'Avatar 20', imageUrl: '/assets/avatars/avatar-_0009_20.png' },
  { id: 'avatar-_0010_19', name: 'Avatar 19', imageUrl: '/assets/avatars/avatar-_0010_19.png' },
  { id: 'avatar-_0011_18', name: 'Avatar 18', imageUrl: '/assets/avatars/avatar-_0011_18.png' },
  { id: 'avatar-_0012_17', name: 'Avatar 17', imageUrl: '/assets/avatars/avatar-_0012_17.png' },
  { id: 'avatar-_0013_16', name: 'Avatar 16', imageUrl: '/assets/avatars/avatar-_0013_16.png' },
  { id: 'avatar-_0014_15', name: 'Avatar 15', imageUrl: '/assets/avatars/avatar-_0014_15.png' },
  { id: 'avatar-_0015_14', name: 'Avatar 14', imageUrl: '/assets/avatars/avatar-_0015_14.png' },
  { id: 'avatar-_0016_13', name: 'Avatar 13', imageUrl: '/assets/avatars/avatar-_0016_13.png' },
  { id: 'avatar-_0017_12', name: 'Avatar 12', imageUrl: '/assets/avatars/avatar-_0017_12.png' },
  { id: 'avatar-_0018_11', name: 'Avatar 11', imageUrl: '/assets/avatars/avatar-_0018_11.png' },
  { id: 'avatar-_0019_10', name: 'Avatar 10', imageUrl: '/assets/avatars/avatar-_0019_10.png' },
  { id: 'avatar-_0020_9', name: 'Avatar 9', imageUrl: '/assets/avatars/avatar-_0020_9.png' },
  { id: 'avatar-_0021_8', name: 'Avatar 8', imageUrl: '/assets/avatars/avatar-_0021_8.png' },
  { id: 'avatar-_0022_7', name: 'Avatar 7', imageUrl: '/assets/avatars/avatar-_0022_7.png' },
  { id: 'avatar-_0023_6', name: 'Avatar 6', imageUrl: '/assets/avatars/avatar-_0023_6.png' },
  { id: 'avatar-_0024_5', name: 'Avatar 5', imageUrl: '/assets/avatars/avatar-_0024_5.png' },
  { id: 'avatar-_0025_4', name: 'Avatar 4', imageUrl: '/assets/avatars/avatar-_0025_4.png' },
  { id: 'avatar-_0026_3', name: 'Avatar 3', imageUrl: '/assets/avatars/avatar-_0026_3.png' },
  { id: 'avatar-_0027_2', name: 'Avatar 2', imageUrl: '/assets/avatars/avatar-_0027_2.png' },
  { id: 'avatar-_0028_1', name: 'Avatar 1', imageUrl: '/assets/avatars/avatar-_0028_1.png' },
];

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatarId,
  onSelectAvatar,
}) => {
  return (
    <div>
      <div className="grid grid-cols-5 gap-3">
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
