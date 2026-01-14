// file_path: src/components/admin/AddTeamDialog.tsx
import React, { useState } from 'react';
import { useTeamStore } from '../../store/useTeamStore';
import { useAuthStore } from '../../store/useAuthStore';
import { emitter } from '../../services/mittEmitter';
import { EVENT_CLOSE_MODAL } from '../../utils/eventNames';
import { useTranslation } from 'react-i18next';
import { IconPicker } from '../IconPicker';

/**
 * AddTeamDialog component for creating new teams
 * This component is used by the DialogManager and doesn't render anything directly
 */
const AddTeamDialog: React.FC = () => {
  const { createTeam } = useTeamStore();
  const { userSessionInfo } = useAuthStore();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;

    setIsSubmitting(true);
    try {
      await createTeam({
        name,
        description,
        icon,
        companyId: userSessionInfo.companyId,
      });

      // Close the dialog
      emitter.emit(EVENT_CLOSE_MODAL);

      // Reset form
      setName('');
      setDescription('');
      setIcon('');
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">
          {t('AddTeamDialog.name') || 'Name'}
        </label>
        <input
          type="text"
          className="w-full p-2 border border-border rounded-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">
          {t('AddTeamDialog.description') || 'Description'}
        </label>
        <textarea
          className="w-full p-2 border border-border rounded-md"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">
          {t('AddTeamDialog.icon') || 'Icon'}
        </label>
        <IconPicker value={icon} onChange={setIcon} />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="px-4 py-2 bg-accent text-foreground rounded-xl hover:bg-accent"
          onClick={() => emitter.emit(EVENT_CLOSE_MODAL)}
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-xl ${
            !name || isSubmitting
              ? 'bg-muted-foreground/30 text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
          onClick={handleSubmit}
          disabled={!name || isSubmitting}
        >
          {isSubmitting ? 'Creating...' : t('common.create')}
        </button>
      </div>
    </div>
  );
};

export { AddTeamDialog };
