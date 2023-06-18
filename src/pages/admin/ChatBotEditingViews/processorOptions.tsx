
const processorOptions = [
  {
    value: "response_to_ui",
    text: "Response To UI",
    secondaryText: "Map GPT response the relevant UI component (text, select)",
    processor_data: {
      type : "text",
      modifyResponse: 1,
    }
  },
  {
    value: "extract_json",
    text: "Extract JSON",
    secondaryText: "Extract JSON from the GPT response",
    processor_data: {
      modifyResponse: 1,
      saveResponseToSessionStore: 0,
    }

  },  
  {
    value: "generate_images",
    text: "Generate Images",
    secondaryText: "Generate images using the GPT response",
    processor_data: {
      modifyResponse: 1,
      saveResponseToSessionStore: 0,
    }
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
      maxHistoryMessages: "4",
      model: "gpt-3.5-turbo",
      modifyResponse: 1,
      prompt: "based on the conversation, return an array with companies, tasks per company and log work per company in a JSON foramt",
      saveResponseToSessionStore: 0,
      temprature: "0.85"
    }
  },
  {
    value : 'ner',
    text : 'NER - Named Entity Recognition',
    secondaryText : 'Perform Named Entity Recognition on the GPT response',
    processor_data : {
      key : 'nerKey',
      saveResponseToSessionStore: 1,
      modifyResponse: 0,
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
      'newState': "get_user_input",  
    } 
  },
];

export { processorOptions };




