import React, { useEffect, useState } from 'react';

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
  darkModeGradientStops?: GradientStop[];
  darkModeOverlayPatterns?: OverlayPattern[];
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  backgroundImage,
  gradientStops,
  overlayPatterns,
  overlayEffect,
  darkModeGradientStops,
  darkModeOverlayPatterns,
}) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Use dark mode gradients if available and dark mode is active
  const activeGradientStops = isDark && darkModeGradientStops ? darkModeGradientStops : gradientStops;
  const activeOverlayPatterns = isDark && darkModeOverlayPatterns ? darkModeOverlayPatterns : overlayPatterns;

  const backgroundGradient = `linear-gradient(to bottom, ${activeGradientStops
    .map(({ color, position }) => `${color} ${position}`)
    .join(', ')})`;

  const overlayGradient = activeOverlayPatterns.length > 0
    ? `linear-gradient(to bottom, ${activeOverlayPatterns
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
    // Apply CSS filter for dark mode to invert and adjust the image
    filter: isDark ? 'brightness(0.25) contrast(1.1) saturate(0.8)' : 'none',
    transition: 'filter 0.3s ease',
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
  overlayEffect: 'multiply' | 'overlay' | 'screen' | 'darken' | 'lighten',
  darkModeGradientStops?: GradientStop[],
  darkModeOverlayPatterns?: OverlayPattern[]
): DynamicBackgroundProps => ({
  backgroundImage,
  gradientStops,
  overlayPatterns,
  overlayEffect,
  darkModeGradientStops,
  darkModeOverlayPatterns,
});
