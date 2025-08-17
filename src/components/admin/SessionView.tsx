import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import { useNavigate } from 'react-router-dom';
import {} from '@heroicons/react/24/outline';

import { Building2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SessionView = observer(() => {
  
  const rootStore = useRootStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!rootStore.authStore.isUserDataLoaded) {
    return <div className="p-3">{t('common.pleaseWait')}</div>;
  }

  const handleCompanyClick = () => {
    const companyId = rootStore.authStore.userSessionInfo.companyId;
    if (companyId) {
      navigate(`/admin/companies/${companyId}`);
    }
  };

  return (
    <div className="relative flex px-3 space-x-3 mr-4 bg-zinc-200 py-2 rounded-2xl rtl:space-x-reverse">
      <div 
        className="flex items-center space-x-1 rtl:space-x-reverse cursor-pointer group transition-all duration-200"
        onClick={handleCompanyClick}
        title="Edit Company"
      >
        <Building2 className="w-3.5 h-3.5 text-zinc-500 group-hover:text-violet-600 transition-colors" />
        <div className="text-zinc-500 text-sm font-light group-hover:text-violet-600 group-hover:font-normal transition-all">
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
