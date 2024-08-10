export enum AvatarStyles {
  logo = 'w-14 h-14 m-0',
  avatar = 'w-14 h-14 m-0',
  large = 'w-28 h-28 m-0',
}

const DEFAULT_AVATAR = '/assets/avatars/default-avatar.png';

const Avatar = ({
  imageUrl,
  avatarStyle,
  active = false,
}: {
  imageUrl: string;
  avatarStyle: AvatarStyles;
  active?: boolean;
}) => {
  const bgColor = active ? 'bg-blue-200' : 'bg-gray-100';
  
  return (
    <div className={`${avatarStyle} rounded-full ${bgColor} flex items-center justify-center`}>
      <img 
        src={imageUrl || DEFAULT_AVATAR} 
        className="rounded-full w-full h-full object-cover" 
        alt="Avatar" 
      />
    </div>
  );
};

export { Avatar };
