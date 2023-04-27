import { Handle, Position } from "reactflow";

type CustomNodeProcessorData = {
  processor_name: string;
  processor_data: { [key: string]: any };
};

interface CustomNodeProcessorProps {
  data: CustomNodeProcessorData;
}

const CustomNodeProcessor: React.FC<CustomNodeProcessorProps> = ({ data }) => {
  return (
    <div className="px-4 py-4 shadow-md rounded-md bg-white border-2 border-stone-400">
      <div className="text-lg font-bold">{data.processor_name}</div>
      <div className="text-gray-500">
        {Object.entries(data.processor_data).map(([key, value]) => (
          <div key={key}>
            {key}: {value}
          </div>
        ))}
      </div>

      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  );
};

export { CustomNodeProcessor };
