export enum AvatarStyles {
  logo = 'h-14 m-0',
  avatar = 'h-10 m-0',
  large = 'h-28 m-0',
}

const Avatar = ({
  imageUrl,
  avatarStyle,
}: {
  imageUrl: string;
  avatarStyle: AvatarStyles;
}) => {
  return <img src={imageUrl} className={`${avatarStyle} rounded-full`} />;
};

export { Avatar };
