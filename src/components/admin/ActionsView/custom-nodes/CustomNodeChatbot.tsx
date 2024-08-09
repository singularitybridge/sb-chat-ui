import { useEffect } from 'react';
import ReactFlow, { Handle, Position } from 'reactflow';
import { CalculatorIcon, KeyIcon } from '@heroicons/react/24/outline';
import { LabelText } from '../../../chat/LabelText';

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
  id: string;
  selectedNodeId: string | null;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  data,
  id,
  selectedNodeId,
}) => {
  const isSelected = id === selectedNodeId;

  useEffect(() => {}, [data]);

  return (
    <div
      className={`p-5 shadow-md rounded-md bg-white border-2 ${
        isSelected ? 'border-red-500' : 'border-stone-400'
      }`}
    >
      <div className="flex">
        <div className="w-32 h-32 flex justify-center items-center bg-gray-100">
          <img 
            src={data.avatarImage || '/avatars/default-avatar.png'} 
            alt={data.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="ml-4">
          <div className="text-lg font-bold">{data.name}</div>
          <div className="text-gray-500">{data.description}</div>

          <div className="flex items-center pt-5">
            <LabelText
              label={<CalculatorIcon className="h-5 w-5 text-slate-400" />}
              text={data.maxTokens.toString()}
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
