import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../store/useSessionStore';
import { useAssistantStore } from '../../store/useAssistantStore';
import { useTeamStore } from '../../store/useTeamStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { IAssistant } from '../../types/entities';
import { Plus, Settings, X, ChevronRight, ChevronLeft, Copy, Search, ArrowLeft, MessageSquare } from 'lucide-react';
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
import { useNavigate, useParams } from 'react-router';
import { getAvatarUrl } from '../../components/Avatar';
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
import { Button } from '../../components/ui/button';
// Note: Mobile view toggle uses CSS classes (md:hidden, md:block) for better performance
// JS state is only used for toggling between views on mobile, not for detecting screen size

// Chair colors for variety
const CHAIR_COLORS = ['#b8c4ce', '#bcc8c0', '#c4bcc8', '#c8c4b8'];

// Workstation Card Component - 1/3 scene + 2/3 info layout
interface WorkstationCardProps {
  assistant: IAssistant;
  isActive: boolean;
  isHovered: boolean;
  integrationNames: string[];
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyId: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  index: number;
}

const WorkstationCard: React.FC<WorkstationCardProps> = ({
  assistant,
  isActive,
  isHovered,
  integrationNames,
  onSelect,
  onEdit,
  onDelete,
  onCopyId,
  onMouseEnter,
  onMouseLeave,
  index,
}) => {
  const chairColor = CHAIR_COLORS[index % CHAIR_COLORS.length];

  return (
    <motion.li
      className={`group rounded-xl overflow-hidden cursor-pointer flex ${
        isActive
          ? 'ring-2 ring-primary/30 bg-[oklch(0.96_0.02_250)]'
          : 'bg-secondary hover:bg-accent'
      }`}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Left 1/3: Agent with Computer */}
      <div className="w-1/3 shrink-0 flex items-end min-h-[140px]" style={{ backgroundColor: isActive ? '#e0e8f0' : '#e8ece8' }}>
        <svg viewBox="0 0 100 100" className="w-full" preserveAspectRatio="xMidYMax meet">
          {/* Chair */}
          <rect x="28" y="28" width="44" height="50" rx="5" fill={chairColor} />

          {/* Avatar */}
          <foreignObject x="22" y="12" width="56" height="56">
            <img
              src={getAvatarUrl(assistant.avatarImage)}
              alt={assistant.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: isHovered ? 'brightness(1.15) saturate(1.1)' : 'none',
              }}
            />
          </foreignObject>

          {/* Monitor - extends to bottom */}
          <rect x="8" y="66" width="84" height="34" rx="2" fill="#4b5563" />
          <rect x="10" y="68" width="80" height="30" fill="#374151" />
        </svg>
      </div>

      {/* Right 2/3: Agent Info */}
      <div className="flex-1 p-4 flex flex-col justify-center min-w-0 relative">
        {/* Hover actions - Top Right */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 right-2 flex gap-1"
            >
              <IconButton
                icon={<Copy className="w-3.5 h-3.5" />}
                className="p-1.5 rounded-full bg-background/80 hover:bg-background shadow-sm"
                onClick={(e) => { e.stopPropagation(); onCopyId(); }}
              />
              <IconButton
                icon={<Settings className="w-3.5 h-3.5" />}
                className="p-1.5 rounded-full bg-background/80 hover:bg-background shadow-sm"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              />
              <IconButton
                icon={<X className="w-3.5 h-3.5 text-red-500" />}
                className="p-1.5 rounded-full bg-background/80 hover:bg-background shadow-sm"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name + Model */}
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-base truncate flex-1">{assistant.name}</h4>
          <ModelIndicator modelName={assistant.llmModel} size="small" />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {assistant.description}
        </p>

        {/* Integrations */}
        <div className="mt-auto">
          <IntegrationIcons
            integrations={integrationNames}
            isActive={isActive}
            size="small"
            className="opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>
    </motion.li>
  );
};

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
  // mobileView state only controls which panel is visible on mobile (<768px)
  // On desktop (>=768px), both panels are always visible via CSS
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

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

  const handleConfirmDelete = async () => {
    if (assistantToDelete) {
      try {
        await deleteAssistant(assistantToDelete._id);
        emitter.emit(EVENT_SHOW_NOTIFICATION, {
          message: t('AssistantsPage.deleteSuccess'),
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to delete assistant:', error);
        emitter.emit(EVENT_SHOW_NOTIFICATION, {
          message: t('AssistantsPage.deleteFailed'),
          type: 'error',
        });
      } finally {
        setDeleteDialogOpen(false);
        setAssistantToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAssistantToDelete(null);
  };

  const handleSetAssistant = async (assistant: IAssistant) => {
    emitter.emit(EVENT_SET_ACTIVE_ASSISTANT, assistant._id);
    // Switch to chat view when selecting an assistant (only affects mobile via CSS)
    setMobileView('chat');
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
      <div className="flex flex-col md:flex-row w-full gap-4 md:gap-7">
        {/* Assistant List - hidden on mobile when in chat view, always visible on desktop */}
        <div className={`flex flex-col rounded-lg md:max-w-sm w-full overflow-hidden ${mobileView === 'chat' ? 'hidden' : 'flex'} md:flex`}>
          <div className="flex flex-row justify-between items-center w-full mb-4 md:mb-8">
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
                icon={<Search className="w-6 h-6 text-muted-foreground" />}
                onClick={() => setCommandPaletteOpen(true)}
              />
              <IconButton
                icon={<Plus className="w-7 h-7 text-muted-foreground" />}
                onClick={handleAddAssistant}
              />
              {/* Mobile: Show chat toggle when there's an active session */}
              {activeSession && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileView('chat')}
                  className="md:hidden"
                >
                  <MessageSquare className="w-6 h-6" />
                </Button>
              )}
            </div>
          </div>

          <ul className="space-y-3 grow overflow-y-auto pe-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('common.pleaseWait')}</p>
              </div>
            ) : (
              (teamId ? teamAssistants : assistants).map((assistant, index) => {
              const isActive = activeSession?.assistantId === assistant._id;
              const integrationNames = extractIntegrationNames(assistant.allowedActions);
              return (
                <WorkstationCard
                  key={assistant._id}
                  assistant={assistant}
                  isActive={isActive}
                  isHovered={hoveredAssistantId === assistant._id}
                  integrationNames={integrationNames}
                  onSelect={() => handleSetAssistant(assistant)}
                  onEdit={() => handleEditAssistant(assistant)}
                  onDelete={() => handleDeleteClick(assistant)}
                  onCopyId={() => handleCopyAssistantId(assistant._id)}
                  onMouseEnter={() => setHoveredAssistantId(assistant._id)}
                  onMouseLeave={() => setHoveredAssistantId(null)}
                  index={index}
                />
              );
              })
            )}
            {!isLoading && (teamId ? teamAssistants.length === 0 : assistants.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <p>{teamId ? t('teamAssistants.noAssistants') : t('teamAssistants.noAssistantsFound')}</p>
              </div>
            )}
          </ul>
        </div>
        {/* Chat Container - hidden on mobile when in list view, always visible on desktop */}
        <div className={`grow min-w-0 flex flex-col ${mobileView === 'list' ? 'hidden' : ''} md:flex`}>
          {/* Mobile: Back to list button - only visible on mobile */}
          <div className="flex items-center gap-2 mb-4 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileView('list')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t('common.back')}
            </Button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatContainer />
          </div>
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
