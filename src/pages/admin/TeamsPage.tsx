import React, { useState, useEffect } from 'react';
import { useTeamStore } from '../../store/useTeamStore';
import { ITeam } from '../../types/entities';
import { Plus, Settings, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../../components/admin/IconButton';
import { emitter } from '../../services/mittEmitter';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
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

import { EVENT_SHOW_ADD_TEAM_MODAL } from '../../utils/eventNames';

const TeamsPage: React.FC = () => {
  const { teams, teamsLoaded, loadTeams, deleteTeam } = useTeamStore();
  const navigate = useNavigate();
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [teamToDelete, setTeamToDelete] = useState<ITeam | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    if (!teamsLoaded) {
      loadTeams();
    }
  }, [teamsLoaded, loadTeams]);

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

  return (
    <div className="flex justify-center h-full">
      <div className="flex flex-col md:flex-row w-full gap-4 md:gap-7">
        <div className="flex flex-col rounded-lg md:max-w-sm w-full overflow-hidden">
          <div className="flex flex-row justify-between items-center w-full mb-8">
            <TextComponent text={t('TeamsPage.title') || 'Teams'} size="subtitle" />
            <IconButton
              icon={<Plus className="w-7 h-7 text-muted-foreground" />}
              onClick={handleAddTeam}
            />
          </div>

          <ul className="space-y-6 grow overflow-y-auto pr-4 rtl:pl-4 rtl:pr-0">
            {teams.map((team) => {
              return (
                <li
                  key={team._id}
                  className="group rounded-lg p-4 cursor-pointer hover:bg-accent relative bg-secondary"
                  onClick={() => handleTeamClick(team._id)}
                  onMouseEnter={() => setHoveredTeamId(team._id)}
                  onMouseLeave={() => setHoveredTeamId(null)}
                >
                  <div className="flex flex-col space-y-2.5">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="shrink-0">
                        {team.icon && (
                          <div className="w-12 h-12 flex items-center justify-center bg-accent rounded-full">
                            {(() => {
                              // Try to find a matching icon name in LucideIcons (case-insensitive)
                              const iconName = team.icon;
                              const iconKeys = Object.keys(LucideIcons);
                              
                              // First try exact match
                              if (iconName in LucideIcons) {
                                return React.createElement(
                                  LucideIcons[iconName as keyof typeof LucideIcons] as React.FC<React.SVGProps<SVGSVGElement>>,
                                  { className: 'w-6 h-6 text-foreground' }
                                );
                              }
                              
                              // Then try case-insensitive match
                              const matchingKey = iconKeys.find(
                                key => key.toLowerCase() === iconName.toLowerCase()
                              );
                              
                              if (matchingKey) {
                                return React.createElement(
                                  LucideIcons[matchingKey as keyof typeof LucideIcons] as React.FC<React.SVGProps<SVGSVGElement>>,
                                  { className: 'w-6 h-6 text-foreground' }
                                );
                              }
                              
                              // Fallback to text
                              return <span className="text-xl text-foreground">{iconName.length === 1 ? iconName : team.name.charAt(0)}</span>;
                            })()}
                          </div>
                        )}
                        {!team.icon && (
                          <div className="w-12 h-12 flex items-center justify-center bg-accent rounded-full">
                            <span className="text-xl text-foreground">{team.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="grow min-w-0 flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-base truncate text-right rtl:text-left">
                            {team.name}
                          </h4>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <AnimatePresence>
                              {hoveredTeamId === team._id && (
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex space-x-2 rtl:space-x-reverse"
                                >
                                  <IconButton
                                    icon={
                                      <Settings className="w-4 h-4 text-muted-foreground" />
                                    }
                                    className="p-1.5 rounded-full hover:bg-accent bg-background"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleEditTeam(team._id);
                                    }}
                                  />
                                  <IconButton
                                    icon={<X className="w-4 h-4 text-muted-foreground" />}
                                    className="p-1.5 rounded-full hover:bg-accent bg-background"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDeleteClick(team);
                                    }}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {team.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
            {teams.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t('TeamsPage.noTeams') || 'No teams found'}</p>
                <p className="mt-2 text-sm">
                  {t('TeamsPage.createTeamPrompt') || 'Click the + button to create a team'}
                </p>
              </div>
            )}
          </ul>
        </div>
      </div>

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
  );
};

export { TeamsPage };
