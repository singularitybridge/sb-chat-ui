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
  prompt: string;
  model: string;
  temperature: number;
  isActive?: boolean;
};

interface CustomNodeStateProps {
  data: CustomNodeStateData;
}

const CustomNodeState: React.FC<CustomNodeStateProps> = ({
  data  
}) => {

  const bgStyle = clsx(
    "p-3 ",
    data.isActive ? " bg-lime-200 " : "bg-slate-200"      
  );


  return (
    <div className="bg-shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className={bgStyle}>
        <LabelText
          label={<BoltIcon className="h-8 w-8 text-slate-400 mr-2" />}
          text={<div className="text-lg font-bold">{data.name}</div>}
        />
      </div>

      <div className="p-3">
        <div className="mt-3 ml-1 w-72">
          <LabelText
            label={<DocumentTextIcon className="h-5 w-5 text-slate-400 mr-2" />}
            text={<div className="text-sm">{data.prompt}</div>}
            labelVerticalAlign="top"
          />
        </div>
        <div className="mt-3 ml-1 w-72">
          <LabelText
            label={<AcademicCapIcon className="h-5 w-5 text-slate-400 mr-2" />}
            text={<div className="text-sm">{data.model}</div>}
          />
        </div>
        <div className="mt-3 ml-1 w-72">
          <LabelText
            label={<BeakerIcon className="h-5 w-5 text-slate-400 mr-2" />}
            text={<div className="text-sm">{data.temperature}</div>}
          />
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

export { CustomNodeState };
