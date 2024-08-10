export enum AvatarStyles {
  medium = 'w-20 h-20 m-0',
  avatar = 'w-14 h-14 m-0',
  large = 'w-32 h-32 m-0',
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
