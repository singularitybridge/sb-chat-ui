import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAssistant } from '../../store/models/Assistant';
import { Plus, X } from 'lucide-react';
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
  const [hoveredAssistantId, setHoveredAssistantId] = useState<string | null>(null);

  const handleDelete = (assistant: IAssistant) => {
    rootStore.deleteAssistant(assistant._id);
  };

  const handleSetAssistant = async (assistant: IAssistant) => {
    emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistant._id);
  };

  const handleAddAssistant = () => {
    emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
  };

  return (
    <div className="flex h-[calc(100vh-96px)] space-x-4">
      <div className="bg-white p-6 overflow-y-auto flex flex-col rounded-lg w-80">
        <div className="flex flex-row justify-between items-center w-full mb-6">
          <TextComponent text="AI Agents" size="subtitle" />
          <IconButton
            icon={<Plus className="w-6 h-6 text-gray-800" />}
            onClick={handleAddAssistant}
          />
        </div>

        <ul className="space-y-3 flex-grow">
          {rootStore.assistants.map((assistant) => (
            <li
              key={assistant._id}
              className={`bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 relative ${
                rootStore.sessionStore.activeSession?.assistantId === assistant._id
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
              onClick={() => handleSetAssistant(assistant)}
              onMouseEnter={() => setHoveredAssistantId(assistant._id)}
              onMouseLeave={() => setHoveredAssistantId(null)}
            >
              <div className="flex items-start">
                <img 
                  src={ '/api/placeholder/40/40'} 
                  alt={`${assistant.name} avatar`} 
                  className="w-10 h-10 rounded-full object-cover mr-4"
                />
                <div className="flex-grow">
                  <h4 className="font-medium text-base">{assistant.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{assistant.description}</p>
                </div>
              </div>
              {hoveredAssistantId === assistant._id && (
                <IconButton
                  icon={<X className="w-4 h-4 text-gray-500" />}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(assistant);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-grow overflow-y-auto">
        <ChatContainer />
      </div>
    </div>
  );
});

export { AssistantsPage };