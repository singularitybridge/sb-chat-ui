import React from 'react';
import { observer } from 'mobx-react';
import { useRootStore } from '../../store/common/RootStoreContext';
import {
  BuildingOffice2Icon,
  ChatBubbleLeftEllipsisIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import Button from '../core/Button';
import {
  getSessionById,
  createSession,
  getUserId,
  getCompanyId,
} from '../../services/api/sessionService';

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
    <div className="relative flex px-4 space-x-3 mr-4 bg-cyan-500 py-3 rounded-3xl bg-opacity-30">
      <div className="flex items-center space-x-1">
        <BuildingOffice2Icon className="w-3.5 h-3.5 text-cyan-700" />
        <div className="   text-cyan-950  text-sm font-light">
          {rootStore.sessionStore.activeSession.companyName}
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <ChatBubbleLeftEllipsisIcon className="w-3.5 h-3.5 text-cyan-700" />
        <div className=" text-sm  text-cyan-950">
          {rootStore.sessionStore.activeSession.assistantName}
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <UserIcon className="w-3.5 h-3.5  cyan-violet-700" />
        <div className=" text-cyan-950 text-sm">
          {rootStore.sessionStore.activeSession.userName}
        </div>
      </div>
    </div>
  );
});
