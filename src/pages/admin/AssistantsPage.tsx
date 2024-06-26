import React from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAssistant } from '../../store/models/Assistant';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_SET_ACTIVE_ASSISTANT,
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
} from '../../utils/eventNames';
import { ChatContainer } from '../../components/chat-container/ChatContainer';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';

const AssistantsPage: React.FC = observer(() => {
  const rootStore = useRootStore();

  const handleDelete = (row: IAssistant) => {
    rootStore.deleteAssistant(row._id);
  };

  const handleSetAssistant = async (row: IAssistant) => {
    emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, row._id);
  };

  const handleAddAssistant = () => {
    emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
  };

  return (
    <div className="flex h-[calc(100vh-96px)] space-x-4">
      <div className="flex-grow overflow-y-auto">
        <ChatContainer />
      </div>

      <div className="w-96 bg-white p-6 overflow-y-auto flex flex-col rounded-lg">
        <div className="flex flex-row justify-between items-center w-full mb-6">
          <TextComponent text="AI Agents" size="subtitle" />
          <IconButton
            icon={<PlusIcon className="w-5 h-5 text-gray-800" />}
            onClick={handleAddAssistant}
          />
        </div>

        <ul className="space-y-2 flex-grow">
          {rootStore.assistants.map((assistant) => (
            <li
              key={assistant._id}
              className={`bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                rootStore.sessionStore.activeSession?.assistantId ===
                assistant._id
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
              onClick={() => handleSetAssistant(assistant)}
            >
              <h4 className="font-medium">{assistant.name}</h4>
              <p className="text-sm text-gray-600">{assistant.description}</p>

              <IconButton
                icon={<TrashIcon className="w-5 h-5 text-warning-900" />}
                onClick={(event) => {
                  event.stopPropagation();
                  handleDelete(assistant);
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export { AssistantsPage };
