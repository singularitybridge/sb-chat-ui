// file_path: src/components/admin/AddTeamDialog.tsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';
import { emitter } from '../../services/mittEmitter';
import { EVENT_CLOSE_MODAL } from '../../utils/eventNames';
import { useTranslation } from 'react-i18next';

/**
 * AddTeamDialog component for creating new teams
 * This component is used by the DialogManager and doesn't render anything directly
 */
const AddTeamDialog: React.FC = observer(() => {
  const rootStore = useRootStore();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;

    setIsSubmitting(true);
    try {
      await rootStore.createTeam({
        _id: '', // Will be assigned by the server
        name,
        description,
        icon,
        companyId: rootStore.activeCompany._id,
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('AddTeamDialog.name') || 'Name'}
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
          {t('AddTeamDialog.description') || 'Description'}
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
          {t('AddTeamDialog.icon') || 'Icon'}
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder={t('AddTeamDialog.iconPlaceholder') || 'Enter an emoji or icon name'}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300"
          onClick={() => emitter.emit(EVENT_CLOSE_MODAL)}
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-xl ${
            !name || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
});

export { AddTeamDialog };
