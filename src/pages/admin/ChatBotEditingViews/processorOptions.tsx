const processorOptions = [
  {
    value: "response_to_ui",
    text: "Response To UI",
    secondaryText: "Map GPT response the relevant UI component (text, select)",
    tmp : true
  },
  {
    value: "generate_images",
    text: "Generate Images",
    secondaryText: "Generate images using the GPT response",
  },
  {
    value: "generate_video",
    text: "Generate Video",
    secondaryText: "Generate videos using the GPT response",
  },
  {
    value: "gpt_query",
    text: "GPT Query",
    secondaryText: "Perform a query using the GPT model",
    processor_data: {
      key: "gptKey",
      maxTokens: "800",
      max_history_messages: "3",
      model: "gpt-3.5-turbo",
      modifyResponse: 0,
      prompt: "based on the conversation, return an array with companies, tasks per company and log work per company in a JSON foramt",
      saveResponseToSessionStore: 1,
      temprature: "0.5"
    }
  },
  {
    value: "set_session_variable",
    text: "Set Session Variable",
    secondaryText: "Set a session variable based on the GPT response",
    processor_data: {
      nextProcessor : "response_to_ui",
    }
  },
  {
    value: "generate_audio",
    text: "Generate Audio",
    secondaryText: "Generate audio using the GPT response",
  },
  {
    value: "generate_video_2",
    text: "Generate Video",
    secondaryText:
      "Generate videos using the GPT response (alternative option)",
  },
  {
    value: "query_index",
    text: "Query Index",
    secondaryText: "Query an index based on the GPT response",
  },
  {
    value: "update_file",
    text: "Update File",
    secondaryText: "Update a file based on the GPT response",
  },
  {
    value: "set_state",
    text: "Set State",
    secondaryText: "Set the state of the chatbot",

    processor_data: {
      nextState: "get_user_input",  
    } 
  },
];

export { processorOptions };




