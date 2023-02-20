import { Configuration, OpenAIApi, CreateCompletionRequest } from "openai";
import { ContextData, Message } from "../atoms/dataStore";
import Mustache from "mustache";

const configuration = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const mapChatToPrompt = (chat: Message[]) => {
  let prompt = "\n";
  chat.forEach((message) => {
    prompt += `${message.sender}: ${message.text}\n`;
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
  contextData: ContextData[]
) => {
  console.log("getGPTCompletion", agentName, userName, message);
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
    temperature: 0.8,
    max_tokens: 200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [`${userName}:`, `${agentName}:`],
  };

  const response = await openai.createCompletion(request);
  console.log("gpt response", response);

  const responseText =
    response?.data?.choices[0]?.text?.replace(`${agentName}:`, "") || "";
  return decodeURIComponent(responseText);
};

export { getGPTCompletion };
