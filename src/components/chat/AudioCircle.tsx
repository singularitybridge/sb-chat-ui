import React, { useEffect, useRef, useState } from "react";

interface AudioCircleProps {
  active: boolean;
  scaleFrom: number;
  scaleTo: number;
}

const AudioCircle: React.FC<AudioCircleProps> = ({
  active,
  scaleFrom,
  scaleTo,
}) => {
  const [scale, setScale] = useState(scaleFrom);

  const getRandomRadius = () => {
    const minRadius = scaleFrom * 5;
    const maxRadius = scaleTo * 5;
    return Math.floor(Math.random() * (maxRadius - minRadius + 1) + minRadius);
  };

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setScale(getRandomRadius());
    }, 60);

    return () => clearInterval(interval);
  }, [active, getRandomRadius, scaleFrom, scaleTo]);

  return (
    <>
      <div
        className="bg-yellow-200 w-8 h-8 m-2 rounded-full relative"
        style={{
          overflow: "hidden",
          width: `${scale}px`,
          height: `${scale}px`,
          transition: "width 0.3s ease, height 0.3s ease",
        }}
      ></div>
    </>
  );
};

export { AudioCircle };
