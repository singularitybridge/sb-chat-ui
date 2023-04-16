import { ContextData, getMessageTextGPT, Message } from "../atoms/dataStore";
import Mustache from "mustache";
import sanitizeHtml from "sanitize-html";
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

const getChatHistory = async (sessionId: string) => {
  const response = await axios.get(
    `http://127.0.0.1:5000/chat_sessions/${sessionId}/messages`
  );
  return response.data;
};


const clearChat = (sessionId: string) => {
  return axios.delete(
    `http://127.0.0.1:5000/chat_sessions/${sessionId}/messages`
  );
};

const getGPTCompletion = async (
  promptTemplate: string,
  agentName: string,
  userName: string,
  message: string,
  history: Message[],
  contextData: ContextData[],
  temperature: number
) => {
  const tmp = await getGPTResponse(agentName, message);  
  return tmp.response;
};

export { getGPTCompletion, clearChat, getChatHistory };
