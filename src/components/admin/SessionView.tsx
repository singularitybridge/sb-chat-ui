import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import {} from '@heroicons/react/24/outline';

import { Building2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SessionView = observer(() => {
  
  const rootStore = useRootStore();
  const { t } = useTranslation();

  if (!rootStore.authStore.isUserDataLoaded) {
    return <div className="p-3">{t('common.pleaseWait')}</div>;
  }

  return (
    <div className="relative flex px-3 space-x-3 mr-4 bg-zinc-300 py-2 rounded-2xl bg-opacity-30 rtl:space-x-reverse">
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
        <div className="   text-zinc-500 text-sm font-light">
          {rootStore.authStore.userSessionInfo.companyName}
        </div>
      </div>
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <UserRound className="w-3.5 h-3.5  cyan-zinc-500" />
        <div className=" text-zinc-500 text-sm font-light">
          {rootStore.authStore.userSessionInfo.userName}
        </div>
      </div>
    </div>
  );
});
