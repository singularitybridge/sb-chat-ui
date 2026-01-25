import React, { useState, useEffect, useMemo } from 'react';
import { useTeamStore } from '../../store/useTeamStore';
import { useAssistantStore } from '../../store/useAssistantStore';
import { useSessionStore } from '../../store/useSessionStore';
import { ITeam, IAssistant } from '../../types/entities';
import { Plus, Settings, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl } from '../../components/Avatar';
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

import { EVENT_SHOW_ADD_TEAM_MODAL } from '../../utils/eventNames';

// Color palettes for teams (cycling through these) - darker backgrounds
const TEAM_PALETTES = [
  { bg: '#e8ece8', accent: '#6a8caa', name: 'blue' },    // Engineering blue
  { bg: '#e8ece8', accent: '#6a9a7a', name: 'green' },   // Customer Success green
  { bg: '#e8ece8', accent: '#a09070', name: 'beige' },   // Research beige
  { bg: '#e8ece8', accent: '#9080a0', name: 'purple' },  // Operations purple
];

// Colors for agent body/shirt (used when showing avatar)
const SHIRT_COLORS = ['#7a9a8a', '#a8c4d4', '#c4a882', '#9a8a7a', '#8aa4b4', '#b8a090'];

// Get consistent colors for an agent based on their name
const getAgentColors = (name: string, index: number) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    shirt: SHIRT_COLORS[(hash + index * 2) % SHIRT_COLORS.length],
  };
};

// Get palette for a team based on its index
const getTeamPalette = (index: number) => TEAM_PALETTES[index % TEAM_PALETTES.length];

// SVG Agent Character Component - Using real avatar images
interface AgentCharacterProps {
  x: number;
  name: string;
  index: number;
  avatarImage?: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

const AgentCharacter: React.FC<AgentCharacterProps> = ({
  x, name, index, avatarImage, isHovered, onMouseEnter, onMouseLeave, onClick
}) => {
  const colors = getAgentColors(name, index);

  return (
    <g
      transform={`translate(${x}, 0)`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ cursor: 'pointer' }}
    >
      {/* Avatar - full image */}
      {avatarImage ? (
        <foreignObject x="-16" y="6" width="32" height="32">
          <img
            src={avatarImage}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: isHovered ? 'sepia(0.3) hue-rotate(180deg) brightness(1.1)' : 'none',
            }}
          />
        </foreignObject>
      ) : (
        <>
          {/* Fallback: Simple avatar circle with initial */}
          <circle cx="0" cy="22" r="14" fill={colors.shirt} />
          <text
            x="0"
            y="27"
            textAnchor="middle"
            fontSize="12"
            fill="#fff"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
          >
            {name.charAt(0).toUpperCase()}
          </text>
        </>
      )}

      {/* Monitor - clean flat design, wider */}
      <rect x="-26" y="38" width="52" height="28" rx="1" fill={isHovered ? '#5b6573' : '#4b5563'} />
      <rect x="-24" y="40" width="48" height="24" fill={isHovered ? '#475161' : '#374151'} />
      {/* Agent name on monitor */}
      <text
        x="0"
        y="54"
        textAnchor="middle"
        fontSize="6"
        fill="#d1d5db"
        fontFamily="system-ui, sans-serif"
      >
        {name.length > 9 ? name.slice(0, 8) + '…' : name}
      </text>
      {/* Monitor Stand - narrower */}
      <rect x="-2" y="66" width="4" height="4" fill="#374151" />
      <rect x="-6" y="70" width="12" height="2" rx="1" fill="#374151" />
    </g>
  );
};

// Team Scene SVG Component - Office environment with agents at desk
interface TeamSceneProps {
  agents: IAssistant[];
  accentColor: string;
  teamName: string;
  teamDescription?: string;
  onAgentClick?: (agent: IAssistant) => void;
  teamId?: string;
}

const TeamScene: React.FC<TeamSceneProps> = ({ agents, teamName, teamDescription, onAgentClick, teamId }) => {
  const [hoveredAgentIndex, setHoveredAgentIndex] = useState<number | null>(null);
  const displayAgents = agents.slice(0, 5); // Max 5 agents in scene
  const agentCount = displayAgents.length;
  const spacing = 65; // Increased spacing between agents
  const startX = 45; // Align left with some padding

  // Get display info - show hovered agent info or team info
  const hoveredAgent = hoveredAgentIndex !== null ? displayAgents[hoveredAgentIndex] : null;
  const displayName = hoveredAgent ? hoveredAgent.name : teamName;
  const displayDescription = hoveredAgent ? (hoveredAgent.description || '') : (teamDescription || '');

  return (
    <svg viewBox="0 0 350 126" className="w-full h-full" preserveAspectRatio="xMinYMid slice">
      {/* Background Wall */}
      <rect x="0" y="0" width="350" height="126" fill="#e8ece8" />

      {/* Wall Decorations */}
      {/* Whiteboard/Frame on left */}
      <g transform="translate(25, 20)">
        <rect x="-12" y="-10" width="24" height="30" rx="2" fill="#d0d8d0" />
        <rect x="-10" y="-8" width="20" height="26" rx="1" fill="#f8f8f8" />
        <rect x="-8" y="-4" width="10" height="2" rx="1" fill="#e8c8a0" opacity="0.6" />
        <rect x="-8" y="0" width="14" height="2" rx="1" fill="#a8c4d4" opacity="0.6" />
      </g>


      {/* Desk/Table */}
      {/* Table top surface */}
      <rect x="10" y="80" width="330" height="5" rx="1" fill="#d4b896" />
      {/* Table top front edge */}
      <rect x="10" y="85" width="330" height="3" fill="#c4a77d" />
      {/* Front panel/modesty panel - taller */}
      <rect x="10" y="88" width="330" height="38" fill="#b89b78" />
      {/* Front panel shadow/depth */}
      <rect x="10" y="88" width="330" height="2" fill="#a08868" />

      {/* Team/Agent name and description on the table */}
      <text
        x="175"
        y="103"
        textAnchor="middle"
        fontSize="11"
        fill="#5c4a3a"
        fontFamily="system-ui, sans-serif"
        fontWeight="600"
      >
        {displayName.length > 25 ? displayName.slice(0, 24) + '…' : displayName}
      </text>
      {displayDescription && (
        <text
          x="175"
          y="115"
          textAnchor="middle"
          fontSize="7"
          fill="#d0d0d0"
          fontFamily="system-ui, sans-serif"
        >
          {displayDescription.length > 40 ? displayDescription.slice(0, 39) + '…' : displayDescription}
        </text>
      )}

      {/* Desk items */}
      {/* Pencil holder on left */}
      <g transform="translate(28, 73)">
        <rect x="-4" y="0" width="8" height="10" rx="1" fill="#4a5568" />
        <line x1="-2" y1="0" x2="-2" y2="-4" stroke="#e8c050" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="-5" stroke="#5080c0" strokeWidth="1" />
        <line x1="2" y1="0" x2="2" y2="-3" stroke="#c05050" strokeWidth="1" />
      </g>

      {/* Coffee mug */}
      <g transform="translate(320, 70)">
        <rect x="-4" y="0" width="8" height="9" rx="1" fill="#f0f0f0" />
        <path d="M4,2 Q7,2 7,5 Q7,8 4,8" fill="none" stroke="#f0f0f0" strokeWidth="1.5" />
      </g>


      {/* Agents sitting behind desk */}
      <g transform="translate(0, 11)">
        {displayAgents.map((agent, i) => (
          <AgentCharacter
            key={agent._id}
            x={startX + i * spacing}
            name={agent.name}
            index={i}
            avatarImage={getAvatarUrl(agent.avatarImage)}
            isHovered={hoveredAgentIndex === i}
            onMouseEnter={() => setHoveredAgentIndex(i)}
            onMouseLeave={() => setHoveredAgentIndex(null)}
            onClick={() => onAgentClick?.(agent)}
          />
        ))}
      </g>


      {/* Empty state */}
      {agentCount === 0 && (
        <text
          x="175"
          y="55"
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
          fontFamily="system-ui, sans-serif"
        >
          No agents assigned
        </text>
      )}
    </svg>
  );
};

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
          accentColor={palette.accent}
          teamName={team.name}
          teamDescription={team.description}
          onAgentClick={(agent) => onAgentClick(agent, team._id)}
          teamId={team._id}
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
    emitter.emit(EVENT_SHOW_ADD_TEAM_MODAL, t('TeamsPage.addTeam') || 'Add Team');
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
