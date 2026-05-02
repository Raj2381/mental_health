import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

export default function RiskAnalytics({ distributionData, categoryData }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-900">Risk Analytics</h2>

      <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Risk Distribution</p>
          <div className="h-72 min-w-0">
            {distributionData && distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {distributionData.map((_, index) => (
                      <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                No distribution data
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">Average Category Scores</p>
          <div className="h-72 min-w-0">
            {categoryData && categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">
                No category data
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
