// file_path: src/pages/admin/EditTeamPage.tsx
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate } from 'react-router-dom';
import { useRootStore } from '../../store/common/RootStoreContext';
import { useTranslation } from 'react-i18next';
import { TextComponent } from '../../components/sb-core-ui-kit/TextComponent';
import { IAssistant } from '../../store/models/Assistant';
import { Avatar, AvatarStyles } from '../../components/Avatar';
import { X } from 'lucide-react';
import { IconButton } from '../../components/admin/IconButton';
import { IconPicker } from '../../components/IconPicker';

const EditTeamPage: React.FC = observer(() => {
  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [teamAssistants, setTeamAssistants] = useState<IAssistant[]>([]);
  const [availableAssistants, setAvailableAssistants] = useState<IAssistant[]>([]);
  const [selectedAssistantId, setSelectedAssistantId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!rootStore.teamsLoaded) {
      rootStore.loadTeams();
    }
    if (!rootStore.assistantsLoaded) {
      rootStore.loadAssistants();
    }
  }, [rootStore]);

  useEffect(() => {
    if (key && rootStore.teamsLoaded && rootStore.assistantsLoaded) {
      const team = rootStore.getTeamById(key);
      if (team) {
        setName(team.name);
        setDescription(team.description);
        setIcon(team.icon);
        
        // Get assistants for this team
        const assistantsInTeam = rootStore.assistants.filter(assistant => 
          assistant.teams.includes(key)
        );
        setTeamAssistants(assistantsInTeam);
        
        // Get available assistants (those not in the team)
        const availableAssts = rootStore.assistants.filter(assistant => 
          !assistant.teams.includes(key)
        );
        setAvailableAssistants(availableAssts);
      }
    }
  }, [key, rootStore.teamsLoaded, rootStore.assistantsLoaded]);

  const handleSave = async () => {
    if (!key || !name) return;

    setIsSubmitting(true);
    try {
      await rootStore.updateTeam(key, {
        _id: key,
        name,
        description,
        icon,
        companyId: rootStore.activeCompany._id,
      });
      navigate('/admin/teams');
    } catch (error) {
      console.error('Failed to update team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAssistant = async () => {
    if (!key || !selectedAssistantId) return;

    try {
      await rootStore.assignAssistantToTeam(key, selectedAssistantId);
      
      // Update local state
      const assistant = rootStore.getAssistantById(selectedAssistantId);
      if (assistant) {
        setTeamAssistants([...teamAssistants, assistant]);
        setAvailableAssistants(availableAssistants.filter(a => a._id !== selectedAssistantId));
        setSelectedAssistantId('');
      }
    } catch (error) {
      console.error('Failed to assign assistant to team:', error);
    }
  };

  const handleRemoveAssistant = async (assistantId: string) => {
    if (!key) return;

    try {
      await rootStore.removeAssistantFromTeam(key, assistantId);
      
      // Update local state
      const assistant = rootStore.getAssistantById(assistantId);
      if (assistant) {
        setTeamAssistants(teamAssistants.filter(a => a._id !== assistantId));
        setAvailableAssistants([...availableAssistants, assistant]);
      }
    } catch (error) {
      console.error('Failed to remove assistant from team:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <TextComponent text={t('EditTeamPage.title') || 'Edit Team'} size="subtitle" />
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
          onClick={() => navigate('/admin/teams')}
        >
          {t('common.back')}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('EditTeamPage.name') || 'Name'}
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('EditTeamPage.description') || 'Description'}
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('EditTeamPage.icon') || 'Icon'}
            </label>
            <IconPicker value={icon} onChange={setIcon} />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className={`px-4 py-2 rounded-xl ${
                !name || isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
              onClick={handleSave}
              disabled={!name || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : t('common.save')}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <TextComponent text={t('EditTeamPage.teamAssistants') || 'Team Assistants'} size="subtitle" />
        
        <div className="mt-4 flex items-end space-x-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('EditTeamPage.addAssistant') || 'Add Assistant'}
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedAssistantId}
              onChange={(e) => setSelectedAssistantId(e.target.value)}
            >
              <option value="">Select an assistant</option>
              {availableAssistants.map(assistant => (
                <option key={assistant._id} value={assistant._id}>
                  {assistant.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className={`px-4 py-2 rounded-xl ${
              !selectedAssistantId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
            onClick={handleAddAssistant}
            disabled={!selectedAssistantId}
          >
            {t('common.add')}
          </button>
        </div>

        <div className="mt-6">
          <ul className="space-y-4">
            {teamAssistants.map(assistant => (
              <li key={assistant._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar
                    imageUrl={`/assets/avatars/${assistant.avatarImage}.png`}
                    avatarStyle={AvatarStyles.avatar}
                    active={false}
                  />
                  <span>{assistant.name}</span>
                </div>
                <IconButton
                  icon={<X className="w-4 h-4" />}
                  onClick={() => handleRemoveAssistant(assistant._id)}
                  className="hover:bg-gray-200 rounded-full p-1"
                />
              </li>
            ))}
            {teamAssistants.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                {t('EditTeamPage.noAssistants') || 'No assistants in this team yet'}
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
});

export { EditTeamPage };
