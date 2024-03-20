interface ContainerBGImageProps {
  bgImage: string;
  children: React.ReactNode;
}

const ContainerBGImage = ({ bgImage, children }: ContainerBGImageProps) => {
  return (
    <div
      className="flex flex-row h-full w-full overflow-x-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(200, 200, 200, 0.6), rgba(200, 200, 200, 0.6)), url(${bgImage})`,
        backgroundSize: 'cover',
      }}
    >
      {children}
    </div>
  );
};

export { ContainerBGImage };
