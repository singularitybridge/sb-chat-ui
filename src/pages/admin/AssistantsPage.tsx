// file_path: src/pages/admin/AssistantsPage.tsx
import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext'; // Still needed for rootStore.teamsLoaded, etc.
import { useSessionStore } from '../../store/useSessionStore'; // Import Zustand session store
import { IAssistant } from '../../store/models/Assistant';
import { Plus, Settings, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import {
  EVENT_SET_ACTIVE_ASSISTANT,
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
} from '../../utils/eventNames';
import { ChatContainer } from '../../components/chat-container/ChatContainer';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarStyles } from '../../components/Avatar';
import Badge from '../../components/Badge';
import IntegrationIcons from '../../components/IntegrationIcons';
import { motion, AnimatePresence } from 'framer-motion';

const AssistantsPage: React.FC = observer(() => {
  const rootStore = useRootStore();
  const activeSession = useSessionStore(state => state.activeSession); // Get activeSession from Zustand
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const [hoveredAssistantId, setHoveredAssistantId] = useState<string | null>(null);
  const [teamAssistants, setTeamAssistants] = useState<IAssistant[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (teamId) {
      setIsLoading(true);
      
      const loadData = async () => {
        try {
          // Make sure teams are loaded
          if (!rootStore.teamsLoaded) {
            await rootStore.loadTeams();
          }
          
          // Get team name
          const team = rootStore.getTeamById(teamId);
          if (team) {
            setTeamName(team.name);
          }
          
          // Load assistants for this team
          const assistants = await rootStore.loadAssistantsByTeam(teamId);
          if (assistants) {
            setTeamAssistants(assistants);
          }
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadData();
    }
  }, [teamId, rootStore]);

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
    <div className="flex justify-center h-full">
      <div className="flex w-full max-w-7xl space-x-7 rtl:space-x-reverse">
        <div className="flex flex-col rounded-lg max-w-sm w-full">
          <div className="flex flex-row justify-between items-center w-full mb-8">
            <div className="flex items-center">
              {teamId ? (
                <div className="flex items-center">
                  <span 
                    onClick={() => navigate('/admin/teams')}
                    className="cursor-pointer"
                  >
                    <TextComponent 
                      text={t('Navigation.teams')} 
                      size="subtitle" 
                    />
                  </span>
                  <span className="mx-2">
                    {rootStore.language === 'he' ? (
                      <ChevronLeft className="w-5 h-5 inline-block" />
                    ) : (
                      <ChevronRight className="w-5 h-5 inline-block" />
                    )}
                  </span>
                  <TextComponent 
                    text={teamName} 
                    size="subtitle" 
                  />
                </div>
              ) : (
                <TextComponent 
                  text={t('AssistantsPage.title')} 
                  size="subtitle" 
                />
              )}
            </div>
            <IconButton
              icon={<Plus className="w-7 h-7 text-gray-600" />}
              onClick={handleAddAssistant}
            />
          </div>

          <ul className="space-y-6 flex-grow overflow-y-auto pr-4 rtl:pl-4 rtl:pr-0">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('common.pleaseWait')}</p>
              </div>
            ) : (
              (teamId ? teamAssistants : rootStore.assistants).map((assistant) => {
              const isActive =
                activeSession?.assistantId === // Use activeSession from Zustand
                assistant._id;
              const integrationNames = extractIntegrationNames(
                assistant.allowedActions
              );
              return (
                <li
                  key={assistant._id}
                  className={`group rounded-lg p-4 cursor-pointer hover:bg-blue-200 relative ${
                    isActive
                      ? 'bg-blue-200 bg-opacity-80'
                      : 'bg-slate-100 bg-opacity-80'
                  }`}
                  onClick={() => handleSetAssistant(assistant)}
                  onMouseEnter={() => setHoveredAssistantId(assistant._id)}
                  onMouseLeave={() => setHoveredAssistantId(null)}
                >
                  <div className="flex flex-col space-y-2.5">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0">
                        <Avatar
                          imageUrl={`/assets/avatars/${assistant.avatarImage}.png`}
                          avatarStyle={AvatarStyles.avatar}
                          active={isActive}
                        />
                      </div>
                      <div className="flex-grow min-w-0 flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-base truncate text-right rtl:text-left">
                            {assistant.name}
                          </h4>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <AnimatePresence>
                              {hoveredAssistantId === assistant._id && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex space-x-2 rtl:space-x-reverse"
                                >
                                  <IconButton
                                    icon={
                                      <Settings className="w-4 h-4 text-gray-500" />
                                    }
                                    className="p-1.5 rounded-full hover:bg-gray-300 bg-white"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleEditAssistant(assistant._id);
                                    }}
                                  />
                                  <IconButton
                                    icon={<X className="w-4 h-4 text-gray-500" />}
                                    className="p-1.5 rounded-full hover:bg-gray-300 bg-white"
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
                              className="text-sm whitespace-nowrap"
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
                    <div className="w-full rounded-xl p-2">
                      <IntegrationIcons 
                        integrations={integrationNames} 
                        isActive={isActive}
                        className="group-hover:opacity-80 transition-opacity duration-200"
                      />
                    </div>
                  </div>
                </li>
              );
              })
            )}
            {!isLoading && (teamId ? teamAssistants.length === 0 : rootStore.assistants.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>{teamId ? t('teamAssistants.noAssistants') : t('teamAssistants.noAssistantsFound')}</p>
              </div>
            )}
          </ul>
        </div>
        <div className="flex-grow max-w-3xl w-full">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
});

export { AssistantsPage };
