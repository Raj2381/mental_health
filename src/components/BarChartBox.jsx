import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function BarChartBox({ students = [] }) {
  const data = students.slice(0, 12).map((s, i) => ({
    name: s?.name ? String(s.name).split(" ")[0] : `S${i + 1}`,
    score: Number(s.assessmentScore || 0),
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
      <h3 className="mb-4 font-semibold">Risk Scores Overview</h3>

      {data.length > 0 ? (
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-slate-400">
          No student data to display
        </div>
      )}
    </div>
  );
}
