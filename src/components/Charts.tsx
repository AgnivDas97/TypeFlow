import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

interface Session {
  wpm: number;
  accuracy: number;
  date: string;
}

export default function Charts({ sessions }: { sessions: Session[] }) {
  if (!sessions.length) return <p>No sessions yet</p>;

  const avgWpm = Math.round(sessions.reduce((a, s) => a + s.wpm, 0) / sessions.length);
  const avgAcc = Math.round(sessions.reduce((a, s) => a + s.accuracy, 0) / sessions.length);

  const pieData = [
    { name: "WPM", value: avgWpm },
    { name: "Accuracy", value: avgAcc },
  ];
  const colors = ["#8884d8", "#82ca9d"];

  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} label>
            {pieData.map((entry, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={sessions}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="wpm" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
