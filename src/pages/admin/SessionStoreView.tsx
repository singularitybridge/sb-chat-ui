import React, { useEffect, useState } from 'react';
import { LabelText } from '../../components/chat/LabelText';
import {
  deleteSessionStore,
  fetchSessionStore,
} from '../../services/SessionStoreService';
import { SessionStore } from '../../services/SessionStoreService';
import { IconButton } from '../../components/admin/IconButton';
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline';
import { observer } from 'mobx-react-lite';
import { useRootStore } from '../../store/common/RootStoreContext';

interface SessionStoreProps {}

const SessionStoreView: React.FC<SessionStoreProps> = observer(() => {
  const [sessionStore, setSessionStore] = useState<SessionStore | null>(null);
  const { selectedChatSession, chatSessionsLoaded } = useRootStore();

  const fetchAndSetSessionStore = async () => {
    if (selectedChatSession) {
      const sessionStore = await fetchSessionStore(selectedChatSession._id);
      setSessionStore(sessionStore);

      console.log('sessionStore', sessionStore);
    }
  };

  useEffect(() => {
    fetchAndSetSessionStore();
  }, [selectedChatSession]);

  if (!sessionStore) {
    return <div>Loading...</div>;
  }

  const clearSessionStore = async () => {
    if (selectedChatSession) {
      try {
        const result = await deleteSessionStore(selectedChatSession._id);
        console.log(result);
        setSessionStore(null); // clear the sessionStore state
      } catch (error) {
        console.error('Failed to delete session store:', error);
      }
    }
  };

  const reloadSessionStore = () => {
    fetchAndSetSessionStore();
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Session Store</h2>{' '}
        <div className="mr-2">
          <IconButton
            icon={<TrashIcon className="w-5 h-5 text-sky-800 mr-4" />}
            onClick={clearSessionStore}
          />
          <IconButton
            icon={<ArrowPathIcon className="w-5 h-5 text-sky-800" />}
            onClick={reloadSessionStore}
          />
        </div>
      </div>

      <LabelText
        label={<div className="text-xs mr-4 text-sky-700 ">id</div>}
        text={<div className={' text-sm'}>{sessionStore.sessionId}</div>}
        layout="horizontal"
      />
      <div className="mt-5">
        {Object.entries(sessionStore).map(([key, value]) => {
          const displayValue = JSON.stringify(value, null, 2);

          return (
            <div key={key} className=" bg-primary-300 mb-4 rounded-lg p-3">
              <LabelText
                label={
                  <div className="text-sm mb-1 mr-5 text-sky-100">{key}</div>
                }
                text={<div className={'text-base'}>{displayValue}</div>}
                labelVerticalAlign="center"
                layout="vertical"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export { SessionStoreView };
