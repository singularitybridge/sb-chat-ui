import { useEffect } from "react";
import ReactFlow, { Handle, Position } from "reactflow";
import { CalculatorIcon, KeyIcon } from "@heroicons/react/24/outline";
import { LabelText } from "../../../chat/LabelText";

type CustomNodeData = {
  name: string;
  description: string;
  avatarImage: string;
  key: string;
  maxTokens: number;
  image: string;
};

interface CustomNodeProps {
  data: CustomNodeData;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  useEffect(() => {}, [data]);

  return (
    <div className="px-4 py-4 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="flex">
        <div className="w-24 h-24 flex justify-center items-center bg-gray-100">
          <img src={data.avatarImage} alt="" />
        </div>
        <div className="ml-4">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">{data.description}</div>

          <div className="flex items-center pt-5">
            <LabelText
              label={<CalculatorIcon className="h-5 w-5 text-slate-400" />}
              text={data.maxTokens}
            />
            <div className="mr-4"></div>
            <LabelText
              label={<KeyIcon className="h-5 w-5 text-slate-400" />}
              text={data.key}
            />
          </div>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        className="w-16 !bg-teal-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
};

export { CustomNode };
