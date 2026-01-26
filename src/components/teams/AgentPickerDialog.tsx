import React, { useState } from 'react';
import { IAssistant } from '../../types/entities';
import { getAvatarUrl } from '../Avatar';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { motion } from 'framer-motion';

interface AgentPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableAgents: IAssistant[];
  onSelectAgent: (agent: IAssistant) => void;
}

const AgentPickerDialog: React.FC<AgentPickerDialogProps> = ({
  open,
  onOpenChange,
  availableAgents,
  onSelectAgent,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = availableAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (agent: IAssistant) => {
    onSelectAgent(agent);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('EditTeamPage.addAgentToTeam') || 'Add Agent to Team'}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('EditTeamPage.searchAgents') || 'Search agents...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Agent Grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                {searchQuery
                  ? t('EditTeamPage.noAgentsFound') || 'No agents found'
                  : t('EditTeamPage.noAvailableAgents') || 'No available agents'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredAgents.map((agent) => (
                <motion.button
                  key={agent._id}
                  onClick={() => handleSelect(agent)}
                  className="flex flex-col items-center p-4 rounded-xl bg-secondary hover:bg-accent transition-colors text-left group"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Avatar */}
                  <div className="w-16 h-16 mb-3 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    <img
                      src={getAvatarUrl(agent.avatarImage)}
                      alt={agent.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Name */}
                  <h4 className="font-medium text-sm text-center truncate w-full">
                    {agent.name}
                  </h4>

                  {/* Description */}
                  {agent.description && (
                    <p className="text-xs text-muted-foreground text-center line-clamp-2 mt-1">
                      {agent.description}
                    </p>
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { AgentPickerDialog };
