// file_path: src/pages/admin/FocusSessionPage.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { ChatContainer } from '../../components/chat-container/ChatContainer';

const FocusSessionPage: React.FC = observer(() => {
  return (
    <div className="flex justify-center h-full">
      <div className="flex w-full max-w-7xl space-x-7 rtl:space-x-reverse">
        <div className="flex flex-col rounded-lg max-w-sm w-full">
          <ChatContainer />
        </div>
        <div className="flex-grow max-w-3xl w-full">
          <div className="bg-white rounded-lg h-full p-6 shadow-sm">
            {/* Empty white space for future content */}
          </div>
        </div>
      </div>
    </div>
  );
});

export { FocusSessionPage };
