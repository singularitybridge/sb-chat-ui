import { ContextData, getMessageTextGPT, Message } from "../atoms/dataStore-old";
import Mustache from "mustache";
import axios from "axios";

const getGPTResponse = async (sessionId: string, message: string) => {
  const response = await axios.post(
    `http://127.0.0.1:5000/chat_sessions/${sessionId}/messages`,
    {
      content: message,
    }
  );
  return response.data;
};

const deleteMessageFromSession = async (sessionId: string, messageId: string) => {
  const response = await axios.delete(
    `http://127.0.0.1:5000/chat_sessions/${sessionId}/messages/${messageId}`
  );
  return response.data;
};


const getSessionMessages = async (sessionId: string) => {
  const response = await axios.get(
    `http://127.0.0.1:5000/chat_sessions/${sessionId}/messages`
  );
  return response.data;
};

const clearSession = (sessionId: string) => {
  return axios.delete(
    `http://127.0.0.1:5000/chat_sessions/${sessionId}/messages`
  );
};

const getGPTCompletion = async (
  promptTemplate: string,
  sessionId: string,
  userName: string,
  message: string,
  history: Message[],  
  temperature: number
) => {
  const tmp = await getGPTResponse(sessionId, message);  
  return tmp;
  // return tmp.response;
};

const getSession = async (sessionId: string) => {
  const response = await axios.get(`http://127.0.0.1:5000/chat_sessions/${sessionId}`);
  return response.data;
};

export { getGPTCompletion, clearSession, getSessionMessages, getSession, deleteMessageFromSession };
