import { Link } from "react-router-dom";
// import { Chatbot } from "../../../services/ChatbotService";
import {
  ChartPieIcon,
  DocumentTextIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { IChatbot } from "../../../store/models/Chatbot";

const ChatbotCard: React.FC<{ chatbot: IChatbot }> = ({ chatbot }) => {
  const defaultImage = "admin/chatbot.png";

  return (
    <Link to={`/admin/chatbots/${chatbot.key}`}>
      <div className="flex flex-col rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 md:max-w-xl md:flex-row mb-4">
        <img
          className="h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
          src={chatbot.avatarImage || defaultImage}
          alt=""
        />
        <div className="flex flex-col justify-start py-3 px-4">
          <h5 className="mb-2 text-xl font-medium text-neutral-800 dark:text-neutral-50 text-wrap">
            {chatbot.name}
          </h5>
          <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
            {chatbot.description}
          </p>
          <div className="flex mt-auto">
            <button className="mr-4">
              <PencilSquareIcon className="h-5 w-5 text-slate-400" />
            </button>
            <button className="mr-4">
              <DocumentTextIcon className="h-5 w-5 text-slate-400" />
            </button>
            <button>
              <ChartPieIcon className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { ChatbotCard };
