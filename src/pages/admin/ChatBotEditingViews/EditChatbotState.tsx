import React, { useEffect, useState } from "react";
import InputWithLabel from "../../../components/admin/InputWithLabel";
import Button from "../../../components/core/Button";

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
}


const EditChatbotState: React.FC<EditChatbotStateProps> = ({
  state,
  chatbotKey,
  onUpdateState,
  onDeleteState,
  onSetActiveState,

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
      <InputWithLabel
        id="floatingPrompt"
        label="Prompt"
        type="text"
        value={prompt}
        onChange={setPrompt}
      />
      <InputWithLabel
        id="floatingTemperature"
        label="Temperature"
        type="number"
        value={temperature.toString()}
        onChange={(value) => setTemperature(parseFloat(value))}
      />
      
      <div className="flex mt-4">
        <Button type="submit" >Save Changes</Button>
        <Button type="button" onClick={() => onDeleteState(state._id)}>
          Delete State
        </Button>
        <Button type="button" onClick={() => onSetActiveState(state.name)}>
          Set to Active State
        </Button>
      </div>

    </form>
  );
};

export { EditChatbotState };
