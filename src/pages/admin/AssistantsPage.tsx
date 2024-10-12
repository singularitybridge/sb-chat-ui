// file_path: src/pages/admin/AssistantsPage.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { IAssistant } from '../../store/models/Assistant';
import { Plus, Settings, X } from 'lucide-react';
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
import Badge from '../../components/Badge';
import IntegrationIcons from '../../components/IntegrationIcons';
import { motion, AnimatePresence } from 'framer-motion';

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

  const extractIntegrationNames = (allowedActions: string[]): string[] => {
    return [...new Set(allowedActions.map((action) => action.split('.')[0]))];
  };

  return (
    <div className="flex h-[calc(100vh-96px)] space-x-4 rtl:space-x-reverse">
      <div className="p-3 flex flex-col rounded-lg w-1/3">
        <div className="flex flex-row justify-between items-center w-full mb-6 px-2 py-1">
          <TextComponent text={t('AssistantsPage.title')} size="subtitle" />
          <IconButton
            icon={<Plus className="w-6 h-6 text-gray-600" />}
            onClick={handleAddAssistant}
          />
        </div>

        <ul className="space-y-4 flex-grow overflow-y-auto h-[calc(100%-3rem)] pr-2 rtl:pl-2 rtl:pr-0">
          {rootStore.assistants.map((assistant) => {
            const isActive =
              rootStore.sessionStore.activeSession?.assistantId ===
              assistant._id;
            const integrationNames = extractIntegrationNames(
              assistant.allowedActions
            );
            return (
              <li
                key={assistant._id}
                className={`group rounded-lg p-3 cursor-pointer hover:bg-blue-200 relative ${
                  isActive
                    ? 'bg-blue-200 bg-opacity-80 '
                    : 'bg-slate-50 bg-opacity-80'
                }`}
                onClick={() => handleSetAssistant(assistant)}
                onMouseEnter={() => setHoveredAssistantId(assistant._id)}
                onMouseLeave={() => setHoveredAssistantId(null)}
              >
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className="flex-shrink-0">
                      <Avatar
                        imageUrl={`/assets/avatars/${assistant.avatarImage}.png`}
                        avatarStyle={AvatarStyles.avatar}
                        active={isActive}
                      />
                    </div>
                    <div className="flex-grow min-w-0 flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-sm truncate text-right rtl:text-left">
                          {assistant.name}
                        </h4>
                        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                          <AnimatePresence>
                            {hoveredAssistantId === assistant._id && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex space-x-1.5 rtl:space-x-reverse"
                              >
                                <IconButton
                                  icon={
                                    <Settings className="w-3 h-3 text-gray-500" />
                                  }
                                  className="p-1 rounded-full hover:bg-gray-300 bg-white"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleEditAssistant(assistant._id);
                                  }}
                                />
                                <IconButton
                                  icon={<X className="w-3 h-3 text-gray-500" />}
                                  className="p-1 rounded-full hover:bg-gray-300 bg-white"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDelete(assistant);
                                  }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <Badge
                            variant="success"
                            className="text-xs whitespace-nowrap"
                          >
                            {assistant.llmModel}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {assistant.description}
                      </p>
                    </div>
                  </div>
                  <div className="w-full rounded-xl p-1.5">
                    <IntegrationIcons 
                      integrations={integrationNames} 
                      isActive={isActive}
                      className="group-hover:opacity-80 transition-opacity duration-200"
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex-grow overflow-y-auto w-2/3">
        <ChatContainer />
      </div>
    </div>
  );
});

export { AssistantsPage };
