import React, { useState } from "react";
import InputWithLabel from "../../../components/admin/InputWithLabel";

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
}

const EditChatbotState: React.FC<EditChatbotStateProps> = ({ state, chatbotKey, onUpdateState }) => {
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
  

  return (
    <form onSubmit={handleSubmit}>
      <InputWithLabel
        id="floatingModel"
        label="Model"
        type="text"
        value={model}
        onChange={setModel}
      />
      <InputWithLabel
        id="floatingName"
        label="Name"
        type="text"
        value={name}
        onChange={setName}
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
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
        Save Changes
      </button>
    </form>
  );
};

export { EditChatbotState };
