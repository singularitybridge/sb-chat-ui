import React from 'react';
import { useParams } from 'react-router-dom';
import { ChatContainer } from '../../components/chat-container/ChatContainer';
import ArtifactEditor from '../../components/ArtifactEditor';

const WorkspacePage: React.FC = () => {
  const { artifactId } = useParams<{ artifactId: string }>();

  return (
    <div className="flex justify-center h-full">
      <div className="flex w-full max-w-7xl space-x-7 rtl:space-x-reverse">
        <div className="flex flex-col rounded-lg max-w-sm w-full">
          <ChatContainer />
        </div>
        <div className="flex-grow max-w-3xl w-full">
          <div className="bg-white rounded-lg h-full p-6 shadow-sm">
            <ArtifactEditor artifactId={artifactId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { WorkspacePage };
