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

      <div className="relative mb-3" data-te-input-wrapper-init>
        <textarea
          className="peer m-0 block h-auto w-full rounded border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-4 text-base font-normal leading-tight text-neutral-700 transition duration-200 ease-linear placeholder:text-transparent focus:border-primary focus:pb-[0.625rem] focus:pt-[1.625rem] focus:text-neutral-700 focus:outline-none peer-focus:text-primary dark:border-neutral-600 dark:text-neutral-200 dark:focus:border-primary dark:peer-focus:text-primary [&:not(:placeholder-shown)]:pb-[0.625rem] [&:not(:placeholder-shown)]:pt-[1.625rem]"
          id="floatingPrompt"
          rows={10} 
          placeholder="Your message"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        ></textarea>
        <label
          htmlFor="floatingPrompt"
          className="pointer-events-none absolute left-0 top-0 origin-[0_0] border border-solid border-transparent px-3 py-4 text-neutral-500 transition-[opacity,_transform] duration-200 ease-linear peer-focus:-translate-y-2 peer-focus:translate-x-[0.15rem] peer-focus:scale-[0.85] peer-focus:text-primary peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:translate-x-[0.15rem] peer-[:not(:placeholder-shown)]:scale-[0.85] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
        >
          Prompt
        </label>
      </div>

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
