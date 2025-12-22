import React from 'react';

export enum AvatarStyles {
  medium = 'w-20 h-20 m-0',
  avatar = 'w-14 h-14 m-0',
  large = 'w-32 h-32 m-0',
}

const DEFAULT_AVATAR = '/assets/avatars/default-avatar.png';

/**
 * Get the full avatar URL from an avatar ID/name.
 * Returns the default avatar if the input is undefined/null/empty.
 */
export const getAvatarUrl = (avatarId: string | undefined | null): string => {
  if (!avatarId || avatarId === 'undefined' || avatarId === 'null') {
    return DEFAULT_AVATAR;
  }
  return `/assets/avatars/${avatarId}.png`;
};

const Avatar = ({
  imageUrl,
  avatarStyle,
  active = false,
}: {
  imageUrl: string;
  avatarStyle: AvatarStyles;
  active?: boolean;
}) => {
  const bgColor = active ? 'bg-blue-300' : 'bg-gray-300';
  
  return (
    <div className={`${avatarStyle} rounded-full ${bgColor} flex items-center justify-center hover:bg-blue-200`}>
      <img 
        src={imageUrl || DEFAULT_AVATAR} 
        className="rounded-full w-full h-full object-cover" 
        alt="Avatar" 
      />
    </div>
  );
};

export { Avatar };
