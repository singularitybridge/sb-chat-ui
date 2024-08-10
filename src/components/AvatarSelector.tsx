import React from 'react';
import { TextComponent } from './sb-core-ui-kit/TextComponent';
import { Avatar, AvatarStyles } from './Avatar';

interface AvatarData {
  id: string;
  name: string;
  imageUrl: string;
}

interface AvatarSelectorProps {
  selectedAvatarId: string | null;
  onSelectAvatar: (avatarId: string) => void;
}

const avatars: AvatarData[] = [
  { id: 'avatar-_0000_29', name: 'Alex', imageUrl: '/assets/avatars/avatar-_0000_29.png' },
  { id: 'avatar-_0001_28', name: 'Ben', imageUrl: '/assets/avatars/avatar-_0001_28.png' },
  { id: 'avatar-_0002_27', name: 'Charlie', imageUrl: '/assets/avatars/avatar-_0002_27.png' },
  { id: 'avatar-_0003_26', name: 'David', imageUrl: '/assets/avatars/avatar-_0003_26.png' },
  { id: 'avatar-_0004_25', name: 'Ethan', imageUrl: '/assets/avatars/avatar-_0004_25.png' },
  { id: 'avatar-_0005_24', name: 'Fiona', imageUrl: '/assets/avatars/avatar-_0005_24.png' },
  { id: 'avatar-_0006_23', name: 'George', imageUrl: '/assets/avatars/avatar-_0006_23.png' },
  { id: 'avatar-_0007_22', name: 'Henry', imageUrl: '/assets/avatars/avatar-_0007_22.png' },
  { id: 'avatar-_0008_21', name: 'Isaac', imageUrl: '/assets/avatars/avatar-_0008_21.png' },
  { id: 'avatar-_0009_20', name: 'Julia', imageUrl: '/assets/avatars/avatar-_0009_20.png' },
  { id: 'avatar-_0010_19', name: 'Kate', imageUrl: '/assets/avatars/avatar-_0010_19.png' },
  { id: 'avatar-_0011_18', name: 'Liam', imageUrl: '/assets/avatars/avatar-_0011_18.png' },
  { id: 'avatar-_0012_17', name: 'Mia', imageUrl: '/assets/avatars/avatar-_0012_17.png' },
  { id: 'avatar-_0013_16', name: 'Nora', imageUrl: '/assets/avatars/avatar-_0013_16.png' },
  { id: 'avatar-_0014_15', name: 'Oliver', imageUrl: '/assets/avatars/avatar-_0014_15.png' },
  { id: 'avatar-_0015_14', name: 'Penny', imageUrl: '/assets/avatars/avatar-_0015_14.png' },
  { id: 'avatar-_0016_13', name: 'Quinn', imageUrl: '/assets/avatars/avatar-_0016_13.png' },
  { id: 'avatar-_0017_12', name: 'Ryan', imageUrl: '/assets/avatars/avatar-_0017_12.png' },
  { id: 'avatar-_0019_10', name: 'Thomas', imageUrl: '/assets/avatars/avatar-_0019_10.png' },
  { id: 'avatar-_0020_9', name: 'Uma', imageUrl: '/assets/avatars/avatar-_0020_9.png' },
  { id: 'avatar-_0021_8', name: 'Victor', imageUrl: '/assets/avatars/avatar-_0021_8.png' },
  { id: 'avatar-_0022_7', name: 'Wendy', imageUrl: '/assets/avatars/avatar-_0022_7.png' },
  { id: 'avatar-_0023_6', name: 'Xavier', imageUrl: '/assets/avatars/avatar-_0023_6.png' },
  { id: 'avatar-_0024_5', name: 'Yara', imageUrl: '/assets/avatars/avatar-_0024_5.png' },
  { id: 'avatar-_0025_4', name: 'Zack', imageUrl: '/assets/avatars/avatar-_0025_4.png' },
  { id: 'avatar-_0026_3', name: 'Ava', imageUrl: '/assets/avatars/avatar-_0026_3.png' },
  { id: 'avatar-_0027_2', name: 'Caleb', imageUrl: '/assets/avatars/avatar-_0027_2.png' },
  { id: 'avatar-_0028_1', name: 'Diana', imageUrl: '/assets/avatars/avatar-_0028_1.png' },
];

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatarId,
  onSelectAvatar,
}) => {
  return (
    <div className="h-96  overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      <div className="grid grid-cols-5 gap-3">
        {avatars.map((avatar) => (
          <div
            key={avatar.id}
            className={`cursor-pointer flex flex-col items-center`}
            onClick={() => onSelectAvatar(avatar.id)}
          >
              <Avatar
                imageUrl={avatar.imageUrl}
                avatarStyle={AvatarStyles.medium}
                active={selectedAvatarId === avatar.id}
              />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
