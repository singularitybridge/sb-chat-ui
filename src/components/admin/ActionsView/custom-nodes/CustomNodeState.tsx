import { Handle, Position } from "reactflow";
import {
  AcademicCapIcon,
  BeakerIcon,
  BoltIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { LabelText } from "../../../chat/LabelText";
import clsx from "clsx";

type CustomNodeStateData = {
  name: string;
  isActive?: boolean;
};

interface CustomNodeStateProps {
  data: CustomNodeStateData;
  id: string;
  selectedNodeId: string | null;
}


const CustomNodeState: React.FC<CustomNodeStateProps> = ({ data, id, selectedNodeId }) => {
  const isSelected = id === selectedNodeId;
  const bgStyle = clsx(
    "p-4",
    data.isActive ? "bg-lime-200" : "bg-slate-200"
  );

  return (
    <div className={`bg-shadow-md rounded-md bg-white border-2 ${isSelected ? 'border-red-500' : 'border-stone-400'}`}>
      <div className={bgStyle}>

        <LabelText
          label={<BoltIcon className="h-8 w-8 text-slate-400 mr-2" />}
          text={<div className="text-lg font-bold">{data.name}</div>}
        />
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

export { CustomNodeState };
