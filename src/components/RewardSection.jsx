export default function RewardSection({ points = 0 }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <p className="text-sm text-slate-500">Reward Points</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{points}</p>
    </div>
  );
}
