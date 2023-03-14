import React, { useEffect, useRef, useState } from "react";

interface AudioCircleProps {
  active: boolean;
  scaleFrom: number;
  scaleTo: number;
  children?: React.ReactNode;
}

const AudioCircle: React.FC<AudioCircleProps> = ({
  active,
  scaleFrom,
  scaleTo,
  children
}) => {
  const [scale, setScale] = useState(scaleFrom);

  const getRandomRadius = () => {
    const minRadius = scaleFrom ;
    const maxRadius = scaleTo ;
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
    <div style={{width: scaleTo, height: scaleTo}}>
      <div
        className=""
        style={{
          overflow: "hidden",
          width: `${scale}px`,
          height: `${scale}px`,
          transition: "width 0.3s ease, height 0.3s ease",
        }}
      >
        {children} 
      </div>
      </div>
    </>
  );
};

export { AudioCircle };
