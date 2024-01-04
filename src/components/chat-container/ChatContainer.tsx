import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Message } from './Message';
import { UserMessage } from './UserMessage';
import {
  PaperAirplaneIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  addThread,
  deleteThread,
  handleUserInput,
} from '../../services/api/assistantService';

const ChatContainer = () => {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState(
    localStorage.getItem('activeThreadId')
  );

  const assistantId = 'asst_yWABKCx3V3GHjRsuR06DOovh';

  useEffect(() => {
    if (!activeThreadId) {
      addThread().then((newThreadId) => {
        setActiveThreadId(newThreadId);
        localStorage.setItem('activeThreadId', newThreadId);
      });
    }
  }, [activeThreadId]);

  const handleSubmitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    if (activeThreadId) {
      handleUserInput({
        userInput: event.currentTarget.message.value,
        assistantId: assistantId,
        threadId: activeThreadId,
      }).then((response) => {
        console.log(response);
      });
    }
  };

  const handleReload = () => {
    if (activeThreadId) {
      deleteThread(activeThreadId).then(() => {
        addThread().then((newThreadId) => {
          setActiveThreadId(newThreadId);
          localStorage.setItem('activeThreadId', newThreadId);
        });
      });
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <button
        className="fixed mr-3 mb-3 bottom-4 right-4 w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center"
        onClick={handleMinimize}
      >
        <PlusIcon className="h-6 w-6 text-white" />
      </button>
    );
  }

  return (
    <>
      <div
        style={{
          boxShadow: '0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        }}
        className="fixed bottom-[calc(2rem)] right-0 mr-7 bg-white p-5 rounded-lg border border-[#e5e7eb] w-[340px] h-[534px] flex flex-col"
      >
        <Header onMinimize={handleMinimize} />
        <div
          className="flex-grow overflow-auto pr-4 scrollbar-thin scrollbar-thumb-neutral-300"
          style={{
            minWidth: '100%',
          }}
        >
          <Message text="hi, how can i help you  today?" />
          <UserMessage text="I'd like to build a perosonal assitant" />
        </div>
        <div className="flex items-center pt-0 mt-1">
          <form
            className="flex items-center justify-center w-full space-x-2"
            onSubmit={handleSubmitMessage}
          >
            <input
              className="flex h-10 w-full rounded-md border border-[#e5e7eb] px-3 py-2 text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50 text-[#030712] focus-visible:ring-offset-2"
              placeholder="Type your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg  disabled:pointer-events-none disabled:opacity-50 bg-gray-800 hover:bg-[#111827E6] h-10 px-2 py-2"
            >
              <PaperAirplaneIcon className="h-5 w-5 text-zinc-50 " />
            </button>
            <button
              onClick={handleReload}
              className="inline-flex items-center justify-center rounded-lg  disabled:pointer-events-none disabled:opacity-50 bg-gray-800 hover:bg-[#111827E6] h-10 px-2 py-2"
            >
              <TrashIcon className="h-5 w-5 text-warning-200" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export { ChatContainer };
