import React, { useEffect, useState } from 'react';
import { useInboxStore } from '../../../store/useInboxStore';
import { IInboxSession, IMessage } from '../../../types/entities';
import { InboxMessage } from './InboxMessage';
import { SessionInfo } from './SessionInfo';
import { addInboxResponse } from '../../../services/api/inboxService';
import { useTranslation } from 'react-i18next';
import AdminPageContainer from '../../../components/admin/AdminPageContainer';

const DisplayMessages: React.FC<{ session: IInboxSession }> = ({ session }) => {
  return (
    <>
      {session.messages.map((message: IMessage) => (
        <InboxMessage key={message._id} message={message} />
      ))}
    </>
  );
};

const InboxPage: React.FC = () => {
  const { inboxSessions } = useInboxStore();
  const { t } = useTranslation();

  const [selectedSession, setSelectedSession] = useState<IInboxSession | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    setIsLoading(true);
    const sessionId = selectedSession?.sessionId;

    if (!sessionId) {
      setIsLoading(false);
      console.error('No session selected');
      return;
    }

    try {
      const lastMessageId = selectedSession.messages[selectedSession.messages.length - 1]._id;
      await addInboxResponse(sessionId, message, lastMessageId);
      setMessage('');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to send message', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inboxSessions.length > 0 && !selectedSession) {
      setSelectedSession(inboxSessions[0]);
    }
  }, [inboxSessions, selectedSession]);

  return (
    <AdminPageContainer>
      <h1 className="text-2xl font-semibold mb-2">{t('InboxPage.title')}</h1>
      <p className="text-gray-600 mb-6">{t('InboxPage.description')}</p>
      <div className="flex w-full justify-center">
        <main className="flex w-full h-full">
          <section className="flex flex-col w-4/12 h-full overflow-y-scroll border-r-2 border-sky-100">
            <label className="px-2">
              <input
                className="rounded-lg p-4 bg-gray-200 transition duration-200 focus:outline-none focus:ring-2 w-full"
                placeholder={t('InboxPage.placeholder')}
              />
            </label>

            <ul className="mt-4">
              {inboxSessions.length > 0 &&
                inboxSessions.map((session) => (
                  <SessionInfo
                    key={session.sessionId}
                    session={session}
                    onClick={() => setSelectedSession(session)}
                    isActive={selectedSession?.sessionId === session.sessionId}
                  />
                ))}
            </ul>
          </section>
          <section className="w-8/12 px-4 flex flex-col">
            <div className="flex justify-between items-center border-b-2 mb-4 pb-4">
              <div className="flex space-x-4 items-center">
                {selectedSession && (
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg">
                      {selectedSession.userName}
                    </h3>
                    <p className="text-light text-gray-400">
                      topic of the session / short intro
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedSession && <DisplayMessages session={selectedSession} />}

            <section className="mt-6 border rounded-xl bg-gray-50 mb-3">
              <textarea
                className="w-full bg-gray-50 p-2 rounded-xl disabled:text-slate-400"
                placeholder={t('InboxPage.replyPlaceholder')}
                rows={3}
                disabled={isLoading}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
              <div className="flex items-center justify-between p-2">
                <button className="h-6 w-6 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  className="bg-purple-600 text-white px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('InboxPage.button')}
                </button>
              </div>
            </section>
          </section>
        </main>
      </div>
    </AdminPageContainer>
  );
};

export { InboxPage };
