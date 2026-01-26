import React, { useState } from 'react';
import { IAssistant } from '../../types/entities';
import { getAvatarUrl } from '../Avatar';

// Colors for agent body/shirt (used when showing avatar)
const SHIRT_COLORS = ['#7a9a8a', '#a8c4d4', '#c4a882', '#9a8a7a', '#8aa4b4', '#b8a090'];

// Chair colors
const CHAIR_COLORS = ['#b8c4ce', '#bcc8c0', '#c4bcc8', '#c8c4b8'];

// Get consistent colors for an agent based on their name
const getAgentColors = (name: string, index: number) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    shirt: SHIRT_COLORS[(hash + index * 2) % SHIRT_COLORS.length],
  };
};

// SVG Agent Character Component
interface AgentCharacterProps {
  x: number;
  name: string;
  index: number;
  avatarImage?: string;
  isHovered: boolean;
  editMode?: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onRemove?: () => void;
}

const AgentCharacter: React.FC<AgentCharacterProps> = ({
  x, name, index, avatarImage, isHovered, editMode, onMouseEnter, onMouseLeave, onClick, onRemove
}) => {
  const colors = getAgentColors(name, index);

  return (
    <g
      transform={`translate(${x}, 0)`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        if (editMode && onRemove) {
          onRemove();
        } else {
          onClick();
        }
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

      {/* Remove button overlay in edit mode */}
      {editMode && isHovered && (
        <g>
          <circle cx="10" cy="10" r="8" fill="#ef4444" />
          <line x1="6" y1="10" x2="14" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </g>
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

// Team Scene SVG Component
export interface TeamSceneProps {
  agents: IAssistant[];
  teamName: string;
  teamDescription?: string;
  editMode?: boolean;
  maxAgents?: number;
  onAgentClick?: (agent: IAssistant) => void;
  onAgentRemove?: (agent: IAssistant) => void;
  onAddAgent?: () => void;
}

const TeamScene: React.FC<TeamSceneProps> = ({
  agents,
  teamName,
  teamDescription,
  editMode = false,
  maxAgents = 5,
  onAgentClick,
  onAgentRemove,
  onAddAgent,
}) => {
  const [hoveredAgentIndex, setHoveredAgentIndex] = useState<number | null>(null);
  const [addButtonHovered, setAddButtonHovered] = useState(false);
  const displayAgents = agents.slice(0, maxAgents);
  const agentCount = displayAgents.length;
  const canAddMore = agentCount < maxAgents;
  const spacing = 65;
  const startX = 45;

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

      {/* Chairs behind agents */}
      <g transform="translate(0, 11)">
        {displayAgents.map((_, i) => (
          <g key={`chair-${i}`} transform={`translate(${startX + i * spacing}, 0)`}>
            <rect x="-17" y="30" width="34" height="55" rx="4" fill={CHAIR_COLORS[i % CHAIR_COLORS.length]} />
          </g>
        ))}
      </g>

      {/* Desk/Table */}
      <rect x="10" y="80" width="330" height="5" rx="1" fill="#6b7280" />
      <rect x="10" y="85" width="330" height="3" fill="#4b5563" />
      <rect x="10" y="88" width="330" height="38" fill="#9ca3af" />
      <rect x="10" y="88" width="330" height="2" fill="#6b7280" />

      {/* Team/Agent name and description on the table */}
      <text
        x="175"
        y="103"
        textAnchor="middle"
        fontSize="11"
        fill="#1f2937"
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
          fill="#e5e7eb"
          fontFamily="system-ui, sans-serif"
        >
          {displayDescription.length > 40 ? displayDescription.slice(0, 39) + '…' : displayDescription}
        </text>
      )}

      {/* Desk items */}
      <g transform="translate(28, 73)">
        <rect x="-4" y="0" width="8" height="10" rx="1" fill="#4a5568" />
        <line x1="-2" y1="0" x2="-2" y2="-4" stroke="#e8c050" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="-5" stroke="#5080c0" strokeWidth="1" />
        <line x1="2" y1="0" x2="2" y2="-3" stroke="#c05050" strokeWidth="1" />
      </g>

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
            editMode={editMode}
            onMouseEnter={() => setHoveredAgentIndex(i)}
            onMouseLeave={() => setHoveredAgentIndex(null)}
            onClick={() => onAgentClick?.(agent)}
            onRemove={() => onAgentRemove?.(agent)}
          />
        ))}

        {/* Add button in edit mode */}
        {editMode && canAddMore && (
          <g
            transform={`translate(${startX + agentCount * spacing}, 0)`}
            onMouseEnter={() => setAddButtonHovered(true)}
            onMouseLeave={() => setAddButtonHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              onAddAgent?.();
            }}
            style={{ cursor: 'pointer' }}
          >
            {/* Chair placeholder */}
            <rect x="-17" y="30" width="34" height="55" rx="4" fill="#d1d5db" opacity="0.5" />

            {/* Add button circle */}
            <circle
              cx="0"
              cy="22"
              r="14"
              fill={addButtonHovered ? '#3b82f6' : '#9ca3af'}
              style={{ transition: 'fill 0.15s' }}
            />
            <line x1="-6" y1="22" x2="6" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="0" y1="16" x2="0" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" />

            {/* Empty monitor */}
            <rect x="-26" y="38" width="52" height="28" rx="1" fill="#d1d5db" opacity="0.5" />
            <rect x="-24" y="40" width="48" height="24" fill="#e5e7eb" opacity="0.5" />
            <text
              x="0"
              y="54"
              textAnchor="middle"
              fontSize="6"
              fill="#9ca3af"
              fontFamily="system-ui, sans-serif"
            >
              Add agent
            </text>
            <rect x="-2" y="66" width="4" height="4" fill="#d1d5db" opacity="0.5" />
            <rect x="-6" y="70" width="12" height="2" rx="1" fill="#d1d5db" opacity="0.5" />
          </g>
        )}
      </g>

      {/* Empty state */}
      {agentCount === 0 && !editMode && (
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

export { TeamScene, AgentCharacter };
export type { AgentCharacterProps };
