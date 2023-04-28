import { Handle, Position } from "reactflow";
import { CodeBracketIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { LabelText } from "../../../chat/LabelText";

type CustomNodeProcessorData = {
  processor_name: string;
  processor_data: { [key: string]: any };
};

interface CustomNodeProcessorProps {
  data: CustomNodeProcessorData;
}

const CustomNodeProcessor: React.FC<CustomNodeProcessorProps> = ({ data }) => {
  return (
    <div className="shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="p-3  bg-violet-100">
        <LabelText
          label={<CodeBracketIcon className="h-8 w-8 text-slate-400 mr-4" />}
          text={<div className="text-lg font-bold">{data.processor_name}</div>}
          labelVerticalAlign="center"
        />
      </div>

      <div className="p-3 mb-1">
        {Object.entries(data.processor_data).map(([key, value]) => (
          <div key={key} className="mt-3 ml-1 w-72">
            <LabelText
              label={<div className="text-sm mr-5 text-sky-400 ">{key}</div>}
              text={<div className=" text-base">{value}</div>}
              labelVerticalAlign="center"
            />
          </div>
        ))}
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

export { CustomNodeProcessor };
