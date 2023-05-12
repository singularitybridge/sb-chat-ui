import React, { useEffect, useState } from "react";
import InputWithLabel from "../../../components/admin/InputWithLabel";
import Button from "../../../components/core/Button";
import { TextareaWithLabel } from "../../../components/admin/TextareaWithLabel";

interface EditChatbotStateProps {
  state: {
    _id: string;
    model: string;
    name: string;
    prompt: string;
    temperature: number;
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
  const [model, setModel] = useState(state.model);
  const [name, setName] = useState(state.name);
  const [prompt, setPrompt] = useState(state.prompt);
  const [temperature, setTemperature] = useState(state.temperature);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState({
      chatbotKey,
      _id: state._id,
      model,
      name,
      prompt,
      temperature,
    });
  };

  useEffect(() => {
    setModel(state.model);
    setName(state.name);
    setPrompt(state.prompt);
    setTemperature(state.temperature);
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

      <InputWithLabel
        id="floatingModel"
        label="Model"
        type="text"
        value={model}
        onChange={setModel}
      />

      {<TextareaWithLabel
        id={`textarea_prompt`}
        label={"Prompt"}
        rows={10}
        placeholder={"pls enter the prompt"}
        value={prompt}
        onChange={(updatedPrompt) => setPrompt(updatedPrompt)}
      />
}
      <InputWithLabel
        id="floatingTemperature"
        label="Temperature"
        type="number"
        value={temperature.toString()}
        onChange={(value) => setTemperature(parseFloat(value))}
      />

      <div className="flex mt-4">
        <Button type="submit">Save Changes</Button>
        <Button type="button" onClick={() => onDeleteState(state._id)}>
          Delete State
        </Button>
        <Button type="button" onClick={() => onSetActiveState(state.name)}>
          Set to Active State
        </Button>
        <Button type="button" onClick={() => onAddProcessor(state._id)}>
          Add Processor
        </Button>
      </div>
    </form>
  );
};

export { EditChatbotState };
