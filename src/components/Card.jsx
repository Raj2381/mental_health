const toneMap = {
  neutral: "surface-card text-[color:var(--text-main)]",
  danger: "surface-card border-rose-400/30 text-[color:var(--text-main)]",
  warning: "surface-card border-amber-400/30 text-[color:var(--text-main)]",
  success: "surface-card border-emerald-400/30 text-[color:var(--text-main)]",
};

export default function Card({ title, value, subtitle, tone = "neutral" }) {
  const toneClass = toneMap[tone] || toneMap.neutral;

  return (
    <div className={`rounded-lg border p-3 shadow ${toneClass}`}>
      <p className="readable-label text-xs font-medium">{title}</p>
      <h2 className="mt-1.5 text-xl font-semibold">{value}</h2>
      {subtitle ? <p className="readable-muted mt-1 text-xs">{subtitle}</p> : null}
    </div>
  );
}
