import React, { useEffect, useState } from 'react';
import InputWithLabel from '../../../components/sb-core-ui-kit/InputWithLabel';
import Button from '../../../components/sb-core-ui-kit/Button';

interface EditChatbotStateProps {
  state: {
    _id: string;
    name: string;
    title?: string;
  };
  chatbotKey: string;
  onUpdateState: (updatedState: any) => void;
  onDeleteState: (stateId: string) => void;
  onSetActiveState: (stateId: string) => void;
  onAddProcessor: (stateId: string) => void;
}

const EditChatbotState: React.FC<EditChatbotStateProps> = ({
  state,
  chatbotKey,
  onUpdateState,
  onDeleteState,
  onSetActiveState,
  onAddProcessor,
}) => {
  const [name, setName] = useState(state.name);
  const [title, setTitle] = useState(state.title || ''); // New state for title

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState({
      chatbotKey,
      _id: state._id,
      name,
      title, // Include the title in the updated state
      prompt,
    });
  };

  useEffect(() => {
    setName(state.name);
    setTitle(state.title || ''); // Update the title state when the state prop changes
  }, [state]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-xl font-bold mb-5">Edit Chatbot State</div>

      {/* Input for editing the title */}
      <InputWithLabel
        id="floatingTitle"
        label="Title"
        type="text"
        value={title}
        onChange={setTitle}
      />

      <InputWithLabel
        id="floatingName"
        label="Name"
        type="text"
        value={name}
        onChange={setName}
      />

      <div className="flex mt-2 content-stretch">
        <Button type="submit">Save</Button>
        <Button type="button" onClick={() => onDeleteState(state._id)}>
          Delete
        </Button>
        <Button type="button" onClick={() => onSetActiveState(state.name)}>
          Set Active
        </Button>
        <Button type="button" onClick={() => onAddProcessor(state._id)}>
          Add Processor
        </Button>
      </div>
    </form>
  );
};

export { EditChatbotState };
