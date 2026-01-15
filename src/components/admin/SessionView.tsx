import React from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../../store/useAuthStore';
import { Building2, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const SessionView: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isUserDataLoaded, userSessionInfo } = useAuthStore();

  if (!isUserDataLoaded) {
    return <div className="p-3">{t('common.pleaseWait')}</div>;
  }

  const handleCompanyClick = () => {
    if (userSessionInfo.companyId) {
      navigate(`/admin/companies/${userSessionInfo.companyId}`);
    }
  };

  return (
    <div className="relative flex px-3 space-x-3 mr-4 bg-secondary py-2 rounded-2xl rtl:space-x-reverse">
      <div
        className="flex items-center space-x-1 rtl:space-x-reverse cursor-pointer group transition-all duration-200"
        onClick={handleCompanyClick}
        title="Edit Company"
      >
        <Building2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
        <div className="text-muted-foreground text-sm font-light group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:font-normal transition-all">
          {userSessionInfo.companyName}
        </div>
      </div>
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <UserRound className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="text-muted-foreground text-sm font-light">
          {userSessionInfo.userName}
        </div>
      </div>
    </div>
  );
};
