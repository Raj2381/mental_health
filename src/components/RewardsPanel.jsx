export default function RewardsPanel({ rewards = [] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Rewards</h3>
      {rewards.length === 0 ? <p className="text-sm text-slate-500">No rewards yet.</p> : (
        <ul className="space-y-2">
          {rewards.map((r) => <li key={r} className="text-sm text-slate-700">{r}</li>)}
        </ul>
      )}
    </div>
  );
}
