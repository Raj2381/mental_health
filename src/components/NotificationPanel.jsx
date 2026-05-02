export default function NotificationPanel({ students = [] }) {
  const highRisk = students
    .filter((s) => Number(s.assessmentScore) > 75)
    .sort((a, b) => Number(b.assessmentScore || 0) - Number(a.assessmentScore || 0));

  return (
    <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">High-Risk Alerts</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
          {highRisk.length}
        </span>
      </div>

      {highRisk.length === 0 ? (
        <p className="text-sm text-slate-500">No high-risk students.</p>
      ) : (
        <div className="space-y-2">
          {highRisk.slice(0, 8).map((s, i) => (
            <div key={s.id || i} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <span className="font-semibold">{s?.name || `Student ${String(s.id || "").slice(0, 6)}`}</span>
              <span className="ml-2">Score: {Number(s.assessmentScore || 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
