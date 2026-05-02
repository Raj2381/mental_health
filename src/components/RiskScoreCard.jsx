export default function RiskScoreCard({ score = 0, level = "Low" }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-500">Risk Score</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{score}</p>
      <p className="text-sm text-slate-600">{level}</p>
    </div>
  );
}
