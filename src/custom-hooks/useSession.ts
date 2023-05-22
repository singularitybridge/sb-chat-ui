import { useEffect, useState } from "react";
import {  fetchChatSessions, fetchChatSessionById } from "../services/ChatSessionService";
import { ChatSession } from "../components/admin/chatSessions/ChatSessionCard";

export const defaultSession: ChatSession = {
  _id: "",
  active: false,
  chatbot_key: "",
  created_at: "",
  updated_at: "",
  user_id: "",
  current_state: "",
};

export const useSession = (sessionId: string) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const updateSession = async (updatedSession: ChatSession) => {
    try {
      const { _id, ...rest } = updatedSession;
      const response = await fetch(
        `http://127.0.0.1:5000/chat_sessions/${updatedSession._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rest),
        }
      );
      const updatedData = await response.json();
      console.log("Session updated", updatedData);
      setSession(updatedData);
    } catch (err) {
      console.error("Error updating session:", err);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await fetchChatSessionById(sessionId);
        setSession(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching session:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  return { session, setSession, loading, error, updateSession };
};
