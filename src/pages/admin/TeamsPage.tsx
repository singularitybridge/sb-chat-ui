import React, { useState, useEffect, useMemo } from 'react';
import { useTeamStore } from '../../store/useTeamStore';
import { useAssistantStore } from '../../store/useAssistantStore';
import { useSessionStore } from '../../store/useSessionStore';
import { ITeam, IAssistant } from '../../types/entities';
import { Plus, Settings, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../components/admin/IconButton';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
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
import { TeamScene } from '../../components/teams/TeamScene';

// Color palettes for teams (cycling through these)
const TEAM_PALETTES = [
  { bg: '#e8ece8', accent: '#6a8caa', name: 'blue' },
  { bg: '#e8ece8', accent: '#6a9a7a', name: 'green' },
  { bg: '#e8ece8', accent: '#a09070', name: 'beige' },
  { bg: '#e8ece8', accent: '#9080a0', name: 'purple' },
];

// Get palette for a team based on its index
const getTeamPalette = (index: number) => TEAM_PALETTES[index % TEAM_PALETTES.length];

// Team Card Component
interface TeamCardProps {
  team: ITeam;
  agents: IAssistant[];
  paletteIndex: number;
  onEdit: (teamId: string) => void;
  onDelete: (team: ITeam) => void;
  onClick: (teamId: string) => void;
  onAgentClick: (agent: IAssistant, teamId: string) => void;
}

const TeamCard: React.FC<TeamCardProps> = ({
  team,
  agents,
  paletteIndex,
  onEdit,
  onDelete,
  onClick,
  onAgentClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const palette = getTeamPalette(paletteIndex);

  return (
    <motion.div
      className="rounded-xl overflow-hidden cursor-pointer hover:bg-accent/50 transition-colors duration-200 relative"
      style={{ backgroundColor: palette.bg }}
      onClick={() => onClick(team._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Hover actions - Top Left */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 left-2 z-10 flex gap-1"
          >
            <IconButton
              icon={<Settings className="w-4 h-4" />}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(team._id);
              }}
            />
            <IconButton
              icon={<X className="w-4 h-4 text-red-500" />}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(team);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Width Scene */}
      <div className="min-h-[200px]">
        <TeamScene
          agents={agents}
          teamName={team.name}
          teamDescription={team.description}
          onAgentClick={(agent) => onAgentClick(agent, team._id)}
        />
      </div>
    </motion.div>
  );
};

// Main TeamsPage Component
const TeamsPage: React.FC = () => {
  const { teams, teamsLoaded, loadTeams, deleteTeam } = useTeamStore();
  const { assistants, assistantsLoaded, loadAssistants, getAssistantsByTeam } = useAssistantStore();
  const { changeAssistant } = useSessionStore();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [teamToDelete, setTeamToDelete] = useState<ITeam | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    if (!teamsLoaded) {
      loadTeams();
    }
    if (!assistantsLoaded) {
      loadAssistants();
    }
  }, [teamsLoaded, loadTeams, assistantsLoaded, loadAssistants]);

  // Memoize agents by team
  const agentsByTeam = useMemo(() => {
    const map: Record<string, IAssistant[]> = {};
    teams.forEach((team) => {
      map[team._id] = getAssistantsByTeam(team._id);
    });
    return map;
  }, [teams, assistants, getAssistantsByTeam]);

  const handleDeleteClick = (team: ITeam) => {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (teamToDelete) {
      deleteTeam(teamToDelete._id);
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  const handleAddTeam = () => {
    navigate('/admin/teams/new');
  };

  const handleEditTeam = (teamId: string) => {
    navigate(`/admin/teams/${teamId}`);
  };

  const handleTeamClick = (teamId: string) => {
    navigate(`/admin/assistants/team/${teamId}`);
  };

  const handleAgentClick = async (agent: IAssistant, teamId: string) => {
    // Activate the agent via zustand store
    await changeAssistant(agent._id);
    // Navigate to the team page
    navigate(`/admin/assistants/team/${teamId}`);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="w-full bg-card rounded-2xl flex flex-col h-full overflow-hidden">
        {/* Sticky Header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t('TeamsPage.title') || 'Teams'}
            </h1>
            <p className="text-muted-foreground mt-0.5">
              {t('TeamsPage.subtitle') || 'Your AI agents at work'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Plus className="w-5 h-5" />}
              onClick={handleAddTeam}
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map((team, index) => (
              <TeamCard
                key={team._id}
                team={team}
                agents={agentsByTeam[team._id] || []}
                paletteIndex={index}
                onEdit={handleEditTeam}
                onDelete={handleDeleteClick}
                onClick={handleTeamClick}
                onAgentClick={handleAgentClick}
              />
            ))}
          </div>

          {/* Empty State */}
          {teams.length === 0 && teamsLoaded && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-32 h-32 mb-6">
                <svg viewBox="0 0 128 128" className="w-full h-full">
                  {/* Empty desk illustration */}
                  <rect x="14" y="80" width="100" height="8" rx="2" fill="#e2e8f0" />
                  <rect x="14" y="88" width="100" height="3" fill="#cbd5e1" />
                  {/* Monitor */}
                  <rect x="44" y="40" width="40" height="30" rx="3" fill="#e2e8f0" />
                  <rect x="48" y="44" width="32" height="22" rx="1" fill="#f1f5f9" />
                  <rect x="60" y="70" width="8" height="6" fill="#e2e8f0" />
                  <rect x="54" y="76" width="20" height="3" rx="1" fill="#e2e8f0" />
                  {/* Question mark */}
                  <text x="64" y="60" textAnchor="middle" fontSize="16" fill="#94a3b8">?</text>
                </svg>
              </div>
              <p className="text-muted-foreground mb-2">
                {t('TeamsPage.noTeams') || 'No teams found'}
              </p>
              <p className="text-sm text-muted-foreground/70">
                {t('TeamsPage.createTeamPrompt') || 'Click the + button to create a team'}
              </p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('TeamsPage.deleteConfirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('TeamsPage.deleteConfirmMessage', { name: teamToDelete?.name })}
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
    </div>
  );
};

export { TeamsPage };
