import React, { useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { LabelText } from '../../../sb-core-ui-kit/LabelText';
import { CalculatorIcon, KeyIcon } from 'lucide-react';
import { TextComponent } from '../../../sb-core-ui-kit/TextComponent';

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
        <div className="w-32 h-32 flex justify-center items-center bg-gray-100 rounded-md">
          <img 
            src={data.avatarImage || '/avatars/default-avatar.png'} 
            alt={data.name} 
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        <div className="ml-4">
          <TextComponent text={data.name} size="large" weight="bold" />
          <TextComponent text={data.description} size="small" color="secondary" />

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
