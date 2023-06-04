import React, { useEffect, useState } from "react";
import { LabelText } from "../../components/chat/LabelText";
import { IconButton } from "../../components/admin/IconButton";
import { ArrowPathIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRootStore } from "../../store/common/RootStoreContext";
import { SelectInput } from "../../components/admin/SelectInput";
import { observer } from "mobx-react-lite";
import { autorun } from "mobx";
import { ClipboardDocumentCheckIcon, LinkIcon, PlusIcon } from "@heroicons/react/24/solid";

interface EditorSettingsProps {}
interface ProcessorOption {
  value: string;
  text: string;
  secondaryText: string;
}

const EditorSettingsView: React.FC<EditorSettingsProps> = observer(() => {

  const { chatSessions, createChatSession, loadChatSessions } = useRootStore();
  const EditorfetchAndSetSettings = async () => {};
  const rootStore = useRootStore();

  const copySessionIdToClipboard = () => {
    navigator.clipboard.writeText(rootStore.selectedChatSession?._id || "");
  };

  const openSessionInNewTab = () => {
    window.open(`http://localhost:5173/chat/${rootStore.selectedChatSession?._id}`, "_blank");
  };


  useEffect(() => {
    EditorfetchAndSetSettings();
  }, []);

  const HandleAddSession = async () => {
    await createChatSession();
  };

  const EditorreloadSettings = () => {
    EditorfetchAndSetSettings();
  };

  const [processorOptions, setProcessorOptions] = useState<ProcessorOption[]>(
    []
  );

  const [selectedProcessor, setSelectedProcessor] = useState("");

  useEffect(() => {
    autorun(() => {
      const options = chatSessions.map((session) => ({
        value: session._id,
        text: session.user_id,
        secondaryText: session.current_state,
      }));
      setProcessorOptions(options);
    });
  }, [chatSessions]);

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Chat Sessions</h2>{" "}
        <div className="">
          <IconButton
            icon={<PlusIcon className="w-5 h-5 text-sky-800" />}
            onClick={HandleAddSession}
          />
        </div>
      </div>

      <div className="flex flex-col mt-5 text-slate-400">
        
      <SelectInput
          options={processorOptions}
          value={selectedProcessor}
          onChange={(value: string) => {
            setSelectedProcessor(value);
            const selectedSession = chatSessions.find(
              (session) => session._id === value
            );
            if (selectedSession) {              
              rootStore.setSelectedChatSession(selectedSession._id);             
            }
          }}
        />
          <div className="mb-2 flex justify-between items-center text-sm rounded-md ">
          <div>
            {rootStore.selectedChatSession?._id}
          </div>
          <div>
            <IconButton
              icon={<ClipboardDocumentCheckIcon className="w-5 h-5 text-slate-800" />}
              onClick={copySessionIdToClipboard}
            />
            <IconButton
              icon={<LinkIcon className="w-5 h-5 text-slate-800 ml-2" />}
              onClick={openSessionInNewTab}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export { EditorSettingsView };
