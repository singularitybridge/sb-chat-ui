import React, { useState } from 'react';
import { Header } from './Header';
import { Message } from './Message';
import { UserMessage } from './UserMessage';

const ChatContainer = () => {
  const [message, setMessage] = useState('');

  const handleSubmitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(message);
    setMessage('');
  };

  return (
    <>
      <div
        style={{
          boxShadow: '0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        }}
        className="fixed bottom-[calc(2rem)] right-0 mr-7 bg-white p-5 rounded-lg border border-[#e5e7eb] w-[340px] h-[534px]"
      >
        <Header />
        <div
          className="pr-4 h-[374px] overflow-auto scrollbar scrollbar-thumb-gray-500"
          style={{ minWidth: '100%', display: 'table' }}
        >
          <Message />
          <UserMessage />
         
        </div>
        <div className="flex items-center pt-0">
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
              className="inline-flex items-center justify-center rounded-md text-sm font-medium text-[#f9fafb] disabled:pointer-events-none disabled:opacity-50 bg-black hover:bg-[#111827E6] h-10 px-4 py-2"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export { ChatContainer };
