import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import { useAssistantStore } from '../../store/useAssistantStore';
import { useTeamStore } from '../../store/useTeamStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { IAssistant } from '../../types/entities';
import { Plus, Settings, X, ChevronRight, ChevronLeft, Copy, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../components/admin/IconButton';
import { ModelIndicator } from '../../components/ModelIndicator';
import { emitter } from '../../services/mittEmitter';
import { useCommandPalette } from '../../contexts/CommandPaletteContext';
import {
  EVENT_SET_ACTIVE_ASSISTANT,
  EVENT_SHOW_ADD_ASSISTANT_MODAL,
  EVENT_SHOW_NOTIFICATION,
} from '../../utils/eventNames';
import { ChatContainer } from '../../components/chat-container/ChatContainer';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, AvatarStyles, getAvatarUrl } from '../../components/Avatar';
import IntegrationIcons from '../../components/IntegrationIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssistantUrl } from '../../utils/assistantUrlUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';


const AssistantsPage: React.FC = () => {
  const activeSession = useSessionStore(state => state.activeSession);
  const { assistants, assistantsLoaded, loadAssistants, deleteAssistant, getAssistantsByTeam } = useAssistantStore();
  const { teamsLoaded, loadTeams, getTeamById } = useTeamStore();
  const { language } = useLanguageStore();
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId: string }>();
  const [hoveredAssistantId, setHoveredAssistantId] = useState<string | null>(null);
  const [teamAssistants, setTeamAssistants] = useState<IAssistant[]>([]);
  const [teamName, setTeamName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [assistantToDelete, setAssistantToDelete] = useState<IAssistant | null>(null);
  const { setOpen: setCommandPaletteOpen } = useCommandPalette();

  const { t } = useTranslation();

  useEffect(() => {
    if (teamId) {
      setIsLoading(true);

      const loadData = async () => {
        try {
          // Make sure teams are loaded
          if (!teamsLoaded) {
            await loadTeams();
          }

          // Make sure assistants are loaded
          if (!assistantsLoaded) {
            await loadAssistants();
          }

          // Get team name
          const team = getTeamById(teamId);
          if (team) {
            setTeamName(team.name);
          }

          // Get assistants for this team from already loaded data
          const filteredAssistants = getAssistantsByTeam(teamId);
          setTeamAssistants(filteredAssistants);
        } catch (error) {
          console.error('Failed to load data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }
  }, [teamId, teamsLoaded, assistantsLoaded, loadTeams, loadAssistants, getTeamById, getAssistantsByTeam]);

  const handleDeleteClick = (assistant: IAssistant) => {
    setAssistantToDelete(assistant);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assistantToDelete) {
      deleteAssistant(assistantToDelete._id);
      setDeleteDialogOpen(false);
      setAssistantToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAssistantToDelete(null);
  };

  const handleSetAssistant = async (assistant: IAssistant) => {
    emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistant._id);
  };

  const handleAddAssistant = () => {
    emitter.emit(EVENT_SHOW_ADD_ASSISTANT_MODAL, 'Add Assistant');
  };

  const handleEditAssistant = (assistant: IAssistant) => {
    navigate(getAssistantUrl(assistant));
  };

  const handleCopyAssistantId = (assistantId: string) => {
    navigator.clipboard.writeText(assistantId)
      .then(() => {
        emitter.emit(EVENT_SHOW_NOTIFICATION, {
          message: t('AssistantsPage.copySuccess'),
          type: 'success',
        });
      })
      .catch((err) => {
        console.error('Failed to copy assistant ID:', err);
        emitter.emit(EVENT_SHOW_NOTIFICATION, {
          message: t('AssistantsPage.copyFailed'),
          type: 'error',
        });
      });
  };

  const extractIntegrationNames = (allowedActions: string[]): string[] => {
    return [...new Set(allowedActions.map((action) => action.split('.')[0]))];
  };

  return (
    <div className="flex justify-center h-full">
      <div className="flex w-full space-x-7 rtl:space-x-reverse">
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
                    {language === 'he' ? (
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
            <div className="flex items-center gap-2">
              <IconButton
                icon={<Search className="w-6 h-6 text-gray-600" />}
                onClick={() => setCommandPaletteOpen(true)}
              />
              <IconButton
                icon={<Plus className="w-7 h-7 text-gray-600" />}
                onClick={handleAddAssistant}
              />
            </div>
          </div>

          <ul className="space-y-6 flex-grow overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('common.pleaseWait')}</p>
              </div>
            ) : (
              (teamId ? teamAssistants : assistants).map((assistant) => {
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
                          imageUrl={getAvatarUrl(assistant.avatarImage)}
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
                                      <Copy className="w-4 h-4 text-gray-500" />
                                    }
                                    className="p-1.5 rounded-full hover:bg-gray-300 bg-white"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleCopyAssistantId(assistant._id);
                                    }}
                                  />
                                  <IconButton
                                    icon={
                                      <Settings className="w-4 h-4 text-gray-500" />
                                    }
                                    className="p-1.5 rounded-full hover:bg-gray-300 bg-white"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleEditAssistant(assistant);
                                    }}
                                  />
                                  <IconButton
                                    icon={<X className="w-4 h-4 text-gray-500" />}
                                    className="p-1.5 rounded-full hover:bg-gray-300 bg-white"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDeleteClick(assistant);
                                    }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <ModelIndicator modelName={assistant.llmModel} size="medium" />
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
            {!isLoading && (teamId ? teamAssistants.length === 0 : assistants.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>{teamId ? t('teamAssistants.noAssistants') : t('teamAssistants.noAssistantsFound')}</p>
              </div>
            )}
          </ul>
        </div>
        <div className="flex-grow min-w-0">
          <ChatContainer />
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('AssistantsPage.deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('AssistantsPage.deleteConfirmMessage', { name: assistantToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-600"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export { AssistantsPage };
