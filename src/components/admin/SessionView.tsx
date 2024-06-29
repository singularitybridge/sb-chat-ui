import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import {
} from '@heroicons/react/24/outline';
import Button from '../sb-core-ui-kit/Button';
import {
  getSessionById,
  createSession,
  getUserId,
  getCompanyId,
} from '../../services/api/sessionService';
import { Building2, UserRound } from 'lucide-react';

export const SessionView = observer(() => {

  const rootStore = useRootStore();

  const loadSession = async () => {
    
    const userId = getUserId();
    const companyId = getCompanyId();

    if (!userId || !companyId) {
      console.log('no user or company id, cannot load session');
      return;
    }

    const session = await createSession(userId, companyId);
    const sessionData = await getSessionById(session._id);
    rootStore.sessionStore.setActiveSession(sessionData);
  };

  if (!rootStore.sessionStore.activeSession) {
    return (
      <div className="p-3">
        Session not loaded{' '}
        <Button onClick={loadSession} additionalClassName=" text-sm p-1">
          load session
        </Button>{' '}
      </div>
    );
  }

  return (
    <div className="relative flex px-3 space-x-3 mr-4 bg-zinc-300 py-2 rounded-2xl bg-opacity-30">
      <div className="flex items-center space-x-1">
        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
        <div className="   text-zinc-500 text-sm font-light">
          {rootStore.sessionStore.activeSession.companyName}
        </div>
      </div>     
      <div className="flex items-center space-x-1">
        <UserRound className="w-3.5 h-3.5  cyan-zinc-500" />
        <div className=" text-zinc-500 text-sm font-light">
          {rootStore.sessionStore.activeSession.userName}
        </div>
      </div>
    </div>
  );
});
