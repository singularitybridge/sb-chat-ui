import React, { useState } from "react";
import InputWithLabel from "../../../components/admin/InputWithLabel";
import Button from "../../../components/core/Button";

interface EditChatbotProps {
  chatbot: {
    name: string;
    avatarImage: string;
    backgroundImage: string;
    description: string;
    key: string;
    maxTokens: number;
  };
  onUpdate: (updatedChatbot: any) => void;
  onCreateNewState: () => void;
}

const EditChatbot: React.FC<EditChatbotProps> = ({
  chatbot,
  onUpdate,
  onCreateNewState,
}) => {
  const [name, setName] = useState(chatbot.name);
  const [avatarImage, setAvatarImage] = useState(chatbot.avatarImage);
  const [backgroundImage, setBackgroundImage] = useState(
    chatbot.backgroundImage
  );
  const [description, setDescription] = useState(chatbot.description);
  const [key, setKey] = useState(chatbot.key);
  const [maxTokens, setMaxTokens] = useState(chatbot.maxTokens);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      name,
      avatarImage,
      backgroundImage,
      description,
      key,
      maxTokens,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="text-xl font-bold mb-5">Edit Chatbot</div>
      <InputWithLabel
        id="floatingName"
        label="Name"
        type="text"
        value={name}
        onChange={setName}
      />
      <InputWithLabel
        id="floatingAvatarImage"
        label="Avatar Image URL"
        type="text"
        value={avatarImage}
        onChange={setAvatarImage}
      />
      <InputWithLabel
        id="floatingBackgroundImage"
        label="Background Image URL"
        type="text"
        value={backgroundImage}
        onChange={setBackgroundImage}
      />
      <InputWithLabel
        id="floatingDescription"
        label="Description"
        type="text"
        value={description}
        onChange={setDescription}
      />
      <InputWithLabel
        id="floatingKey"
        label="Key"
        type="text"
        value={key}
        onChange={setKey}
      />
      <InputWithLabel
        id="floatingMaxTokens"
        label="Max Tokens"
        type="number"
        value={maxTokens.toString()}
        onChange={(value) => setMaxTokens(parseInt(value))}
      />
      <Button type="submit">Save Changes</Button>
      <Button onClick={() => onCreateNewState()}>Create New State</Button>
    </form>
  );
};

export { EditChatbot };
