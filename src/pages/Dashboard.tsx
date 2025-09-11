import { useAuth } from "../hooks/useAuth";
import * as auth from "../services/auth";
import TypingTest from "../components/TypingTest";
import Charts from "../components/Charts";
import SessionList from "../components/SessionList";
import { useState, useEffect } from "react";
import { fetchSessionsApi } from "../services/sessionApi";

interface Session {
  id: string;
  wpm: number;
  accuracy: number;
  date: string;
  difficulty: string;
  // add other fields as needed
}

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);

  async function loadSessions() {
    const data = await fetchSessionsApi();
    setSessions(data);
  }

  useEffect(() => { loadSessions(); }, []);

  function handleLogout() {
    auth.logout();
    setUser(null);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl">Welcome, {user?.name}</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white p-2 rounded">
          Logout
        </button>
      </div>

      <TypingTest onFinish={loadSessions} />

      <div className="mt-8">
        <h2 className="text-xl mb-2">Your Progress</h2>
        <Charts sessions={sessions} />
        <SessionList sessions={sessions} />
      </div>
    </div>
  );
}
