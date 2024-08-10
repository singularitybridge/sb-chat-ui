// file_path: src/pages/admin/AssistantsPage.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAssistant } from '../../store/models/Assistant';
import { Plus, Settings2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_SET_ACTIVE_ASSISTANT,
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
} from '../../utils/eventNames';
import { ChatContainer } from '../../components/chat-container/ChatContainer';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarStyles } from '../../components/Avatar';

const AssistantsPage: React.FC = observer(() => {
  const rootStore = useRootStore();
  const navigate = useNavigate();
  const [hoveredAssistantId, setHoveredAssistantId] = useState<string | null>(
    null
  );

  const { t } = useTranslation();

  const handleDelete = (assistant: IAssistant) => {
    rootStore.deleteAssistant(assistant._id);
  };

  const handleSetAssistant = async (assistant: IAssistant) => {
    emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistant._id);
  };

  const handleAddAssistant = () => {
    emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
  };

  const handleEditAssistant = (assistantId: string) => {
    navigate(`/admin/assistants/${assistantId}`);
  };

  return (
    <div className="flex h-[calc(100vh-96px)] space-x-4 rtl:space-x-reverse">
      <div className="bg-white p-3 overflow-y-auto flex flex-col rounded-lg w-80">
        <div className="flex flex-row justify-between items-center w-full mb-6 px-2 py-1">
          <TextComponent text={t('AssistantsPage.title')} size="subtitle" />
          <IconButton
            icon={<Plus className="w-6 h-6 text-gray-600" />}
            onClick={handleAddAssistant}
          />
        </div>

        <ul className="space-y-4 flex-grow">
          {rootStore.assistants.map((assistant) => {
            const isActive =
              rootStore.sessionStore.activeSession?.assistantId ===
              assistant._id;
            return (
              <li
                key={assistant._id}
                className={`rounded-lg p-3 cursor-pointer hover:bg-slate-200 relative ${
                  isActive ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleSetAssistant(assistant)}
                onMouseEnter={() => setHoveredAssistantId(assistant._id)}
                onMouseLeave={() => setHoveredAssistantId(null)}
              >
                <div className="flex items-start space-x-3 rtl:space-x-reverse">
                  <div className="flex-shrink-0">
                    <Avatar
                      imageUrl={`/assets/avatars/${assistant.avatarImage}.png`}
                      avatarStyle={AvatarStyles.avatar}
                      active={isActive}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-sm truncate">
                      {assistant.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                      {assistant.description}
                    </p>
                  </div>
                </div>
                {hoveredAssistantId === assistant._id && (
                  <div>
                    <IconButton
                      icon={<X className="w-4 h-4 text-gray-500" />}
                      className="absolute top-2 ltr:right-2 p-1 rounded-full rtl:left-2 hover:bg-gray-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(assistant);
                      }}
                    />
                    <IconButton
                      icon={<Settings2 className="w-4 h-4 text-gray-500" />}
                      className="absolute top-2 ltr:right-8 rtl:left-8 p-1 rounded-full hover:bg-gray-300"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEditAssistant(assistant._id);
                      }}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex-grow overflow-y-auto">
        <ChatContainer />
      </div>
    </div>
  );
});

export { AssistantsPage };
