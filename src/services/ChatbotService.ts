export interface Chatbot {
  _id: string;
  avatarImage: string;
  backgroundImage: string;
  current_state: string;
  description: string;
  key: string;
  maxTokens: number;
  model: string;
  name: string;
  namespace: string;
  prommpt: string;
  prompt: string;
  states: State[];
  temperature: number;
}

interface State {
  model: string;
  name: string;
  processors: Processor[];
  prompt: string;
}

interface Processor {
  processor_data: any;
  processor_name: string;
}


export async function fetchChatbots(): Promise<Chatbot[]> {
  const response = await fetch("http://127.0.0.1:5000/chatbots");
  const chatbots = await response.json();
  return chatbots;
}
