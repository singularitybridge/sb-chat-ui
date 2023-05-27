import { useEffect, useState } from "react";
import {  fetchChatSessions, fetchChatSessionById } from "../services/ChatSessionService";
import { IChatSession } from "../store/models/ChatSession";


export const useSession = (sessionId: string) => {
  const [session, setSession] = useState<IChatSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const updateSession = async (updatedSession: IChatSession) => {
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
