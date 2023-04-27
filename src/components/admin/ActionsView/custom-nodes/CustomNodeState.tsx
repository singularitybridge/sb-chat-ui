import { Handle, Position } from "reactflow";

type CustomNodeStateData = {
  name: string;
  prompt: string;
  model: string;
};

interface CustomNodeStateProps {
  data: CustomNodeStateData;
}

const CustomNodeState: React.FC<CustomNodeStateProps> = ({ data }) => {
  return (
    <div className="px-4 py-4 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="text-lg font-bold">{data.name}</div>
      <div className="text-gray-500">Prompt: {data.prompt}</div>
      <div className="text-gray-500">Model: {data.model}</div>

      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
};

export { CustomNodeState };
