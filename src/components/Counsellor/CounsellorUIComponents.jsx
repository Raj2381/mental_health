export function InfoTile({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function AlertItem({ text = "", color = "#ef4444" }) {
  return (
    <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: color, color }}>
      {text}
    </div>
  );
}
