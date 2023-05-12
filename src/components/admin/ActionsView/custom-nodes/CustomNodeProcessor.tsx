import { Handle, Position } from "reactflow";
import { CodeBracketIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { LabelText } from "../../../chat/LabelText";

type CustomNodeProcessorData = {
  processor_name: string;
  processor_data: { [key: string]: any };
};

interface CustomNodeProcessorProps {
  data: CustomNodeProcessorData;
  id: string;
  selectedNodeId: string | null;
}

const CustomNodeProcessor: React.FC<CustomNodeProcessorProps> = ({ data, id, selectedNodeId }) => {
  const isSelected = id === selectedNodeId;

  return (
    
    <div className={`shadow-md rounded-md bg-white border-2 ${isSelected ? 'border-red-600' : 'border-stone-400'}`}>

      <div className="p-3  bg-sky-100">
        <LabelText
          label={<CodeBracketIcon className="h-8 w-8 text-slate-400 mr-4" />}
          text={<div className="text-lg font-bold">{data.processor_name}</div>}
          labelVerticalAlign="center"
        />
      </div>

      <div className="ml-1 p-3">
      {Object.entries(data.processor_data).slice(0, 6).map(([key, value]) => (

          <div key={key} className="w-96 p-2">
            <LabelText
              label={
                <div className=" text-xs mr-5 text-sky-700 w-44">{key}</div>
              }
              text={
                <div
                  className={`text-base ${
                    key === "prompt" ? "line-clamp-2 h-12" : ""
                  }`}
                >
                  {value}
                </div>
              }
              labelVerticalAlign="center"
              layout="vertical" // Set layout to "vertical" here
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
