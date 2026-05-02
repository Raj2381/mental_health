const badgeClassMap = {
  high: "bg-rose-100 text-rose-700 border-rose-200",
  moderate: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function getRiskTone(level = "") {
  const normalized = level.toLowerCase();
  if (normalized.includes("high")) return "high";
  if (normalized.includes("moderate") || normalized.includes("medium")) return "moderate";
  return "low";
}

export default function StudentCard({ student, onViewDetails }) {
  const tone = getRiskTone(student.assessmentLevel);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{student.name}</h3>
          <p className="text-xs text-slate-500 mt-1">{student.id}</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClassMap[tone]}`}
        >
          {student.assessmentLevel}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500">Risk Score</p>
          <p className="text-2xl font-bold text-slate-900">{student.assessmentScore}</p>
        </div>
        <button
          type="button"
          onClick={() => onViewDetails(student)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
