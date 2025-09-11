interface Session {
  date: string | number | Date;
  difficulty: string;
  wpm: number;
  accuracy: number;
}

export default function SessionList({ sessions }: { sessions: Session[] }) {
  return (
    <div>
      <h3 className="text-lg mb-2">Past Sessions</h3>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Difficulty</th>
            <th className="p-2 border">WPM</th>
            <th className="p-2 border">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s, i) => (
            <tr key={i}>
              <td className="p-2 border">{new Date(s.date).toLocaleString()}</td>
              <td className="p-2 border">{s.difficulty}</td>
              <td className="p-2 border">{s.wpm}</td>
              <td className="p-2 border">{s.accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
