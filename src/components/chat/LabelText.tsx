import React from "react";

interface LabelTextProps {
  label: JSX.Element;
  text: string | number | JSX.Element;
  labelVerticalAlign?: "top" | "center";
}

const LabelText: React.FC<LabelTextProps> = ({
  label,
  text,
  labelVerticalAlign = "center",
}) => {
  return (
    <div
      className={`flex items-${labelVerticalAlign === "top" ? "start" : "center"}`}
    >
      <div className="">{label}</div>
      <div>{text}</div>
    </div>
  );
};

export { LabelText };