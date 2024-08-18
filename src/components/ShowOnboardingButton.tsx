/// file_path: src/components/ShowOnboardingButton.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useRootStore } from '../store/common/RootStoreContext';
import { BotIcon, HelpCircle, LogOutIcon } from 'lucide-react';
import { IconButton } from './admin/IconButton';

const ShowOnboardingButton: React.FC = observer(() => {

  const rootStore = useRootStore();
  const handleShowOnboarding = () => {};

  return (
    <IconButton
      className="bg-lime-200 hover:bg-fuchsia-200 rounded-full w-9 h-9 m-auto flex items-center justify-center p-2"
      icon={<BotIcon className="w-5 h-5 text-zinc-500" />}
      onClick={handleShowOnboarding}
    />
  );
});

export default ShowOnboardingButton;
