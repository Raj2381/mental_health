import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6"];

export default function PieChartBox({ data = [] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 h-64 min-w-0">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          No data to display
        </div>
      )}
    </div>
  );
}
