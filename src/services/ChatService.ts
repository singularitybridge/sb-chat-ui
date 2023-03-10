import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { ContextData, getMessageTextGPT, Message } from "../atoms/dataStore";
import Mustache from "mustache";
import sanitizeHtml from 'sanitize-html';

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

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
  const prevChatAsText = mapChatToPrompt(history);
  const prompt = Mustache.render(promptTemplate, {
    userName,
    agentName,
    prevChatAsText,
    message,
    contextData: sanitizeContextDataToString(contextData),
  });

  console.log("request", prompt);

  const request: CreateCompletionRequest = {
    model: "text-davinci-003",
    prompt: prompt,
    temperature: temperature,
    max_tokens: 200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [`${userName}:`, `${agentName}:`],
  };

  const response = await openai.createCompletion(request);
  console.log("gpt response", response);

  const responseText = response?.data?.choices[0]?.text?.replace(`${agentName}:`, "") || "";  
  return sanitizeHtml(responseText);
};

export { getGPTCompletion };
