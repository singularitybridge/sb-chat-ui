export async function fetchChatSessions() {
  const response = await fetch("http://127.0.0.1:5000/chat_sessions");
  const chatSessions = await response.json();
  return chatSessions;
}
