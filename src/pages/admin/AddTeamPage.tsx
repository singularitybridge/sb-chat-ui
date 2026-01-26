import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTeamStore } from '../../store/useTeamStore';
import { useAssistantStore } from '../../store/useAssistantStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { IAssistant } from '../../types/entities';
import { StickyFormLayout } from '../../components/admin/StickyFormLayout';
import { TeamScene } from '../../components/teams/TeamScene';
import { AgentPickerDialog } from '../../components/teams/AgentPickerDialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import LoadingButton from '../../components/core/LoadingButton';
import { emitter } from '../../services/mittEmitter';
import { EVENT_SHOW_NOTIFICATION } from '../../utils/eventNames';

const MAX_TEAM_AGENTS = 5;

const AddTeamPage: React.FC = () => {
  const { addTeam } = useTeamStore();
  const { assistantsLoaded, loadAssistants, assistants } = useAssistantStore();
  const { userSessionInfo } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<IAssistant[]>([]);
  const [availableAgents, setAvailableAgents] = useState<IAssistant[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);

  useEffect(() => {
    if (!assistantsLoaded) {
      loadAssistants();
    }
  }, [assistantsLoaded, loadAssistants]);

  useEffect(() => {
    if (assistantsLoaded) {
      // All assistants are available initially
      setAvailableAgents(assistants);
    }
  }, [assistantsLoaded, assistants]);

  const handleSave = async () => {
    if (!name) return;

    setIsSubmitting(true);
    try {
      // Only include description if it has a value
      const teamData: { name: string; description?: string; companyId: string } = {
        name,
        companyId: userSessionInfo.companyId,
      };
      if (description.trim()) {
        teamData.description = description;
      }

      const newTeam = await addTeam(teamData);

      // Assign selected agents to the new team
      if (newTeam && selectedAgents.length > 0) {
        const { assignAssistant } = useTeamStore.getState();
        for (const agent of selectedAgents) {
          await assignAssistant(newTeam._id, agent._id);
        }
      }

      // Always reload assistants to update their teams array before navigating
      await loadAssistants();

      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('AddTeamPage.createSuccess') || 'Team created successfully',
        type: 'success',
      });
      navigate('/admin/teams');
    } catch (error) {
      console.error('Failed to create team:', error);
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('AddTeamPage.createError') || 'Failed to create team',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAgent = (agent: IAssistant) => {
    if (selectedAgents.length >= MAX_TEAM_AGENTS) {
      emitter.emit(EVENT_SHOW_NOTIFICATION, {
        message: t('EditTeamPage.maxAgentsReached') || `Maximum ${MAX_TEAM_AGENTS} agents per team`,
        type: 'warning',
      });
      return;
    }

    setSelectedAgents([...selectedAgents, agent]);
    setAvailableAgents(availableAgents.filter(a => a._id !== agent._id));
  };

  const handleRemoveAgent = (agent: IAssistant) => {
    setSelectedAgents(selectedAgents.filter(a => a._id !== agent._id));
    setAvailableAgents([...availableAgents, agent]);
  };

  if (!assistantsLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">{t('common.pleaseWait')}</p>
      </div>
    );
  }

  return (
    <>
      <StickyFormLayout
        title={t('AddTeamPage.title') || 'Create Team'}
        subtitle={t('AddTeamPage.subtitle') || 'Set up a new team with agents'}
        backUrl="/admin/teams"
        footer={
          <div className="flex justify-end">
            <LoadingButton
              onClick={handleSave}
              isLoading={isSubmitting}
              disabled={!name}
            >
              {t('AddTeamPage.create') || 'Create Team'}
            </LoadingButton>
          </div>
        }
      >
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Team Visualization */}
          <div className="w-full lg:w-1/2">
            <div className="rounded-xl overflow-hidden bg-secondary">
              <TeamScene
                agents={selectedAgents}
                teamName={name || t('AddTeamPage.untitled') || 'New Team'}
                teamDescription={description}
                editMode={true}
                maxAgents={MAX_TEAM_AGENTS}
                onAgentRemove={handleRemoveAgent}
                onAddAgent={() => setAgentPickerOpen(true)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t('EditTeamPage.agentCount', { count: selectedAgents.length, max: MAX_TEAM_AGENTS }) ||
                `${selectedAgents.length} of ${MAX_TEAM_AGENTS} agents`}
            </p>
          </div>

          {/* Right: Team Info Form */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="team-name">{t('EditTeamPage.name') || 'Team Name'}</Label>
              <Input
                id="team-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('EditTeamPage.namePlaceholder') || 'Enter team name'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-description">{t('EditTeamPage.description') || 'Description'}</Label>
              <Textarea
                id="team-description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder={t('EditTeamPage.descriptionPlaceholder') || 'Describe what this team does'}
                rows={4}
              />
            </div>
          </div>
        </div>
      </StickyFormLayout>

      <AgentPickerDialog
        open={agentPickerOpen}
        onOpenChange={setAgentPickerOpen}
        availableAgents={availableAgents}
        onSelectAgent={handleAddAgent}
      />
    </>
  );
};

export { AddTeamPage };
