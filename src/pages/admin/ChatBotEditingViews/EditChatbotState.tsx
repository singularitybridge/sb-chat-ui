import React, { useEffect, useState } from "react";
import InputWithLabel from "../../../components/admin/InputWithLabel";
import Button from "../../../components/core/Button";
import { TextareaWithLabel } from "../../../components/admin/TextareaWithLabel";

interface EditChatbotStateProps {
  state: {
    _id: string;
    name: string;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState({
      chatbotKey,
      _id: state._id,
      name,
      prompt,
    });
  };

  useEffect(() => {
    setName(state.name);
  }, [state]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-xl font-bold mb-5">Edit Chatbot State</div>
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
