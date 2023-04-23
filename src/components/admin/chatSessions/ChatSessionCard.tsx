import { Link } from "react-router-dom";

export interface ChatSession {
  _id: string;
  active: boolean;
  chatbot_key: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const ChatSessionCard: React.FC<{ session: ChatSession }> = ({ session }) => {
  return (
    <div className="flex flex-col rounded-lg bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 md:max-w-xl md:flex-row mb-4">
      <img
        className="h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
        src="https://tecdn.b-cdn.net/wp-content/uploads/2020/06/vertical.jpg"
        alt=""
      />
      <div className="flex flex-col justify-start p-6">
        <h5 className="mb-2 text-xl font-medium text-neutral-800 dark:text-neutral-50 text-wrap">
          Chat Session: {session._id}
        </h5>
        <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
          User ID: {session.user_id}
        </p>
        <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
          Chatbot Key: {session.chatbot_key}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-300">
          Created At: {session.created_at}
        </p>
        <Link
          to={`/admin/chat-sessions/${session._id}`}
          className="text-blue-600 mt-2"
        >
          View Session
        </Link>
      </div>
    </div>
  );
};

export { ChatSessionCard };
