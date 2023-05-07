const processorOptions = [
  {
    value: "response_to_ui",
    text: "Response To UI",
    secondaryText: "Map GPT response the relevant UI component (text, select)",
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
    text: "GPT_Query",
    secondaryText: "Perform a query using the GPT model",
  },
  {
    value: "set_session_variable",
    text: "Set Session Variable",
    secondaryText: "Set a session variable based on the GPT response",
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
  },
];

export { processorOptions };
