import React from 'react';

interface GradientStop {
  color: string;
  position: string;
}

interface OverlayPattern {
  color: string;
  stop: string;
  opacity: number;
}

interface DynamicBackgroundProps {
  backgroundImage: string;
  gradientStops: GradientStop[];
  overlayPatterns: OverlayPattern[];
  overlayEffect: 'multiply' | 'overlay' | 'screen' | 'darken' | 'lighten';
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  backgroundImage,
  gradientStops,
  overlayPatterns,
  overlayEffect,
}) => {
  const backgroundGradient = `linear-gradient(to bottom, ${gradientStops
    .map(({ color, position }) => `${color} ${position}`)
    .join(', ')})`;

  const overlayGradient = overlayPatterns.length > 0
    ? `linear-gradient(to bottom, ${overlayPatterns
        .map(({ color, stop, opacity }) => {
          const rgba = color.startsWith('rgb') 
            ? color.replace(')', `, ${opacity})`)
            : `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`;
          return `${rgba} ${stop}`;
        })
        .join(', ')})`
    : 'rgba(255, 255, 255, 0)';

  const backgroundStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `${backgroundGradient}, url(${backgroundImage})`,
    backgroundRepeat: 'repeat',
    backgroundSize: 'auto, auto',
    backgroundPosition: 'center',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: overlayGradient,
    mixBlendMode: overlayEffect,
  };

  return (
    <>
      <div style={backgroundStyle} />
      <div style={overlayStyle} />
    </>
  );
};

export default DynamicBackground;

export const setDynamicBackground = (
  backgroundImage: string,
  gradientStops: GradientStop[],
  overlayPatterns: OverlayPattern[],
  overlayEffect: 'multiply' | 'overlay' | 'screen' | 'darken' | 'lighten'
): DynamicBackgroundProps => ({
  backgroundImage,
  gradientStops,
  overlayPatterns,
  overlayEffect,
});
