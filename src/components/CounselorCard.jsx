export default function CounselorCard({ student, onViewDetails }) {
  const score = Number(student?.assessmentScore || 0);
  const level = student?.assessmentLevel || (score > 75 ? "High" : score >= 50 ? "Moderate" : "Low");

  const badgeClass =
    score > 75
      ? "bg-rose-500/14 text-rose-600 dark:text-rose-300"
      : score >= 50
        ? "bg-amber-500/14 text-amber-600 dark:text-amber-300"
        : "bg-emerald-500/14 text-emerald-600 dark:text-emerald-300";

  return (
    <div className="surface-card rounded-lg p-3 shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm text-[color:var(--text-main)]">{student?.name || `Student ${String(student?.id || "").slice(0, 6)}`}</h3>
          <p className="readable-muted text-xs">{student?.id || "No ID"}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${badgeClass}`}>{level}</span>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        <p className="text-xs text-[color:var(--text-muted)]">Score: <span className="font-semibold text-[color:var(--text-main)]">{score}</span></p>
        <button
          type="button"
          onClick={() => onViewDetails?.(student)}
          className="interactive-surface rounded-md px-2.5 py-1 text-xs font-medium text-[color:var(--text-main)]"
        >
          Details
        </button>
      </div>
    </div>
  );
}
