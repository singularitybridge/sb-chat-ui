/// file_path: src/components/ShowOnboardingButton.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import { BotIcon, HelpCircle, LogOutIcon } from 'lucide-react';
import { IconButton } from './admin/IconButton';
import { emitter } from '../services/mittEmitter';
import { EVENT_SHOW_ONBOARDING_MODAL } from '../utils/eventNames';
import i18n from '../i18n';

const ShowOnboardingButton: React.FC = observer(() => {

  const handleShowOnboarding = () => {    
    emitter.emit(EVENT_SHOW_ONBOARDING_MODAL, { title: i18n.t('dialogTitles.onboarding') });
  };

  return (
    <IconButton
      className="bg-lime-200 hover:bg-fuchsia-200 rounded-full w-9 h-9 m-auto flex items-center justify-center p-2"
      icon={<BotIcon className="w-5 h-5 text-zinc-500" />}
      onClick={handleShowOnboarding}
    />
  );
});

export default ShowOnboardingButton;
