import { ChevronRightIcon } from "@heroicons/react/24/outline";
import React from "react";

interface ChatFooterProps {
  onSendMessage: (value: string) => void;
}

const ChatFooter: React.FC<ChatFooterProps> = ({ onSendMessage }) => {
  const [userInput, setUserInput] = React.useState("");
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    onSendMessage(userInput);
    setUserInput("");
  };

  return (
    <footer className="p-4 text-center text-base font-light">
      <div className="flex flex-row items-center bg-white w-full">
        <div className="flex-grow mr-4">
          <div className="relative w-full">
            <input
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              type="text"
              className="flex w-full border rounded-md focus:outline-none focus:border-indigo-300 p-2"
            />
          </div>
        </div>
        <div className="">
          <button
            className="flex items-center justify-center"
            onClick={handleSendMessage}
          >
            <span>
              <ChevronRightIcon className="h-6 w-6 text-blue-800 " />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export { ChatFooter };
