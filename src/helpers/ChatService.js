const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const mapChatToPrompt = (chat) => {
  let prompt = "\n";
  chat.forEach((message) => {
    prompt += `${message.author}: ${message.text}\n`;
  });
  return prompt;
}


const getGPTCompletion = async (agentName, message, history) => {

  const userName = 'avi'; 
  const prevChatAsText = mapChatToPrompt(history);     


  const prompt = `
  The following is a conversation between ${userName} and an AI therapist named ${agentName}. The therapist is calm, patient and emphatic. his goal is to help ${userName} feel better and act in positive ways.
  \n ${prevChatAsText}
  \n ${userName}: ${message}
  \n ${agentName}: `;

  console.log('request',prompt);


  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    temperature: 0.6,
    max_tokens: 120,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0.6,
    stop: [` ${userName}:`, ` ${agentName}:`],
  });

  console.log('gpt response', response);
  
  return response.data.choices[0].text.replace(`${agentName}:`, '');
};







export { getGPTCompletion };
