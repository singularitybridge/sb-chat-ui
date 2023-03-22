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

const mapChatToPrompt = (chat: Message[]) => {
  let prompt = "\n";
  chat.forEach((message) => {
    prompt += `${message.sender}: ${getMessageTextGPT(message)}\n`;
  });
  return prompt;
};

const sanitizeContextDataToString = (contextData: ContextData[]) => {
  let processedData = "";
  contextData.forEach((item) => {
    processedData += `${item.title}\n\n${item.description}\n\n`;
  });
  return processedData;
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

  const tmp = await getGPTResponse("jack", message);
  const responseText = tmp.response;

  return sanitizeHtml(responseText);
};

export { getGPTCompletion };
