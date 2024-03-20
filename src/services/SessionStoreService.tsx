export interface SessionStore {
  _id: string;
  data: any;
  sessionId: string;
}

export async function deleteSessionStore(sessionId: string): Promise<any> {
  const response = await fetch(
    `http://127.0.0.1:5000/session_store/${sessionId}`,
    {
      method: 'DELETE',
    },
  );
  const result = await response.json();
  return result;
}

export async function fetchSessionStore(
  sessionId: string,
): Promise<SessionStore> {
  const response = await fetch(
    `http://127.0.0.1:5000/session_store/${sessionId}`,
  );
  const sessionStore = await response.json();
  return sessionStore;
}
