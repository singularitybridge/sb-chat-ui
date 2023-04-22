import React, { useState } from "react";
import { ContentContainer } from "../components/ContentContainer";
import { useEffect } from "react";
import { fetchChatSessions } from "../services/ChatSessionService";
import { Link } from "react-router-dom";
import Menu from "../components/admin/Menu";

interface ChatSession {
  _id: string;
  active: boolean;
  chatbot_key: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}


const Admin: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    async function fetchData() {
      const sessions = await fetchChatSessions();
      setChatSessions(sessions);
    }

    fetchData();
  }, []);

  return (
    <ContentContainer>


      <Menu />  


      <div className="p-4">
    <h1 className="text-3xl mb-4">Admin</h1>
    <h2 className="text-xl mb-4">Chat Sessions</h2>
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="border p-2">ID</th>
          <th className="border p-2">User ID</th>
          <th className="border p-2">Chatbot Key</th>
          <th className="border p-2">Created At</th>
        </tr>
      </thead>
      <tbody>
        {chatSessions.map((session) => (
          <tr key={session._id}>
            <td className="border p-2">
              <Link to={`/admin/chat-sessions/${session._id}`} className="text-blue-600">
                {session._id}
              </Link>
            </td>
            <td className="border p-2">{session.user_id}</td>
            <td className="border p-2">{session.chatbot_key}</td>
            <td className="border p-2">{session.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>


  <div className="overflow-x-auto">
  <table className="table w-full">
    {/* head */}
    <thead>
      <tr>
        <th></th>
        <th>Name</th>
        <th>Job</th>
        <th>Favorite Color</th>
      </tr>
    </thead>
    <tbody>
      {/* row 1 */}
      <tr>
        <th>1</th>
        <td>Cy Ganderton</td>
        <td>Quality Control Specialist</td>
        <td>Blue</td>
      </tr>
      {/* row 2 */}
      <tr>
        <th>2</th>
        <td>Hart Hagerty</td>
        <td>Desktop Support Technician</td>
        <td>Purple</td>
      </tr>
      {/* row 3 */}
      <tr>
        <th>3</th>
        <td>Brice Swyre</td>
        <td>Tax Accountant</td>
        <td>Red</td>
      </tr>
    </tbody>
  </table>
</div>


    </ContentContainer>
  );
};

export { Admin };
