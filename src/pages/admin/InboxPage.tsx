import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { withPage } from '../../components/admin/HOC/withPage';
import { emitter } from '../../services/mittEmitter';
import { EVENT_SHOW_ADD_USER_MODAL } from '../../utils/eventNames';
import { IInboxSession, IMessage } from '../../store/models/Inbox';
import { useRootStore } from '../../store/common/RootStoreContext';
import { autorun } from 'mobx';

interface SessionInfoProps {
  session: IInboxSession;
  isActive: boolean;
  onClick: () => void;
}

const SessionInfo: React.FC<SessionInfoProps> = ({
  session,
  isActive,
  onClick,
}) => {
  const activeClass = isActive ? 'bg-sky-100' : '';

  return (
    <li
      key={session.sessionId}
      className={`py-3 px-3 transition hover:bg-indigo-100 cursor-pointer ${activeClass}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">
          {session.messages[session.messages.length - 1].userName}
        </h3>
        {/* Display latest message preview */}
        <p className="text-xs text-gray-500">
          {session.messages[session.messages.length - 1].createdAt}
        </p>
      </div>
      <div className="text-sm text-gray-500">
        {session.messages[session.messages.length - 1].message}
      </div>
    </li>
  );
};

const DisplayMessages: React.FC<{ session: IInboxSession }> = ({ session }) => {
  return (
    <section>
      {session.messages.map((message: IMessage) => (
        <article key={message._id} className="mt-2 text-gray-500">
          <p>{message.message}</p>
        </article>
      ))}
    </section>
  );
};

const InboxView: React.FC = observer(() => {
  const rootStore = useRootStore();

  const [selectedSession, setSelectedSession] = useState<IInboxSession | null>(
    null
  );

  useEffect(() => {
    const dispose = autorun(() => {

      if (rootStore.inboxSessions.length > 0) {
        setSelectedSession(rootStore.inboxSessions[0]);
      }
    });
    return () => dispose();
  }, [rootStore.inboxSessions]);

  return (
    <>
      <div className="flex w-full justify-center">
        <main className="flex w-full h-full ">
          <section className="flex flex-col w-4/12  h-full overflow-y-scroll border-r-2 border-sky-100">
            <label className="px-2">
              <input
                className="rounded-lg p-4 bg-gray-200 transition duration-200 focus:outline-none focus:ring-2 w-full"
                placeholder="Search..."
              />
            </label>

            <ul className="mt-4">
              {rootStore.inboxSessions.length > 0 &&
                rootStore.inboxSessions.map((session) => (
                  <SessionInfo
                    key={session.sessionId}
                    session={session}
                    onClick={() => setSelectedSession(session)}
                    isActive={selectedSession?.sessionId === session.sessionId}
                  />
                ))}
            </ul>
          </section>
          <section className="w-8/12 px-4 flex flex-col ">
            <div className="flex justify-between items-center border-b-2 mb-4 pb-4">
              <div className="flex space-x-4 items-center">
                {selectedSession && selectedSession.messages.length > 0 && (
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg">
                      {selectedSession.messages[0].userName}
                    </h3>
                    <p className="text-light text-gray-400">
                      email@address.com
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedSession && <DisplayMessages session={selectedSession} />}

            <section className="mt-6 border rounded-xl bg-gray-50 mb-3">
              <textarea
                className="w-full bg-gray-50 p-2 rounded-xl"
                placeholder="Type your reply here..."
                rows={3}
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
                <button className="bg-purple-600 text-white px-6 py-2 rounded-xl">
                  Reply
                </button>
              </div>
            </section>
          </section>
        </main>
      </div>
    </>
  );
});

const InboxPage = withPage(
  'Inbox',
  'manage communication with your users here',
  () => {
    emitter.emit(EVENT_SHOW_ADD_USER_MODAL, 'Add User');
  }
)(InboxView);
export { InboxPage };
