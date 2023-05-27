import React, { useEffect, useState } from "react";
import { LabelText } from "../../components/chat/LabelText";
import { IconButton } from "../../components/admin/IconButton";
import { ArrowPathIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRootStore } from "../../store/common/RootStoreContext";
import { SelectInput } from "../../components/admin/SelectInput";
import { observer } from "mobx-react-lite";

interface EditorSettingsProps {}
interface ProcessorOption {
  value: string;
  text: string;
  secondaryText: string;
}

const EditorSettingsView: React.FC<EditorSettingsProps> = observer( () => {

  const { chatSessions } = useRootStore();
  const EditorfetchAndSetSettings = async () => {};

  useEffect(() => {
    EditorfetchAndSetSettings();
  }, []);

  const EditorclearSettings = async () => {};

  const EditorreloadSettings = () => {
    EditorfetchAndSetSettings();
  };

  
  const [processorOptions, setProcessorOptions] = useState<ProcessorOption[]>([]);

  const [selectedProcessor, setSelectedProcessor] = useState('');

  useEffect(() => {
    const options = chatSessions.map(session => ({
      value: session._id,  // Adjust these fields based on your needs
      text: session.user_id,
      secondaryText: session.current_state,
    }));

    setProcessorOptions(options);
  }, [chatSessions]);  // re-run this effect whenever chatSessions changes


  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Settings</h2>{" "}
        <div className="mr-2">
          <IconButton
            icon={<TrashIcon className="w-5 h-5 text-sky-800 mr-4" />}
            onClick={EditorclearSettings}
          />
          <IconButton
            icon={<ArrowPathIcon className="w-5 h-5 text-sky-800" />}
            onClick={EditorreloadSettings}
          />
        </div>
      </div>

      <div className="flex flex-col mt-5 text-slate-400">
        <div className="mb-2">select session to debug</div>
        <SelectInput 
          options={processorOptions} 
          value={selectedProcessor} 
          onChange={setSelectedProcessor}
        />
      </div>
    </div>
  );
});

export { EditorSettingsView };
