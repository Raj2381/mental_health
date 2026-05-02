import { motion as Motion } from "framer-motion";
import DashboardCard from "./DashboardCard";

export default function RiskScoreCard({ data }) {
  // ✅ SINGLE SOURCE: Only read from data.score and data.riskLevel
  const hasAssessment = Boolean(data?.hasAssessment);
  const score = Math.round(data?.score ?? 0);
  const riskLevel = data?.riskLevel ?? "Low";

  // 🎨 Dynamic color based on risk
  const getColor = () => {
    if (!hasAssessment) return "#94a3b8";
    if (score < 40) return "#22c55e"; // green
    if (score < 70) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  };

  const getLabel = () => {
    if (!hasAssessment) return "Pending";
    if (score < 40) return "Low Risk";
    if (score < 70) return "Moderate Risk";
    return "High Risk";
  };

  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const progress = score / 100;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <DashboardCard className="p-6" glow="from-emerald-500/14 via-sky-500/8 to-rose-500/12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Risk Score</p>
          <p className="soft-text mt-2 text-sm">
            {hasAssessment ? "From your latest assessment" : "Complete assessment to see risk score"}
          </p>
        </div>
        <div className="rounded-full border border-white/40 bg-white/45 px-3 py-1 text-xs font-semibold" style={{ color: getColor() }}>
          {getLabel()}
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-center">
        {/* SVG Circle */}
        <svg height={radius * 2} width={radius * 2} className="drop-shadow-[0_12px_32px_rgba(14,165,233,0.18)]">
          {/* Background circle */}
          <circle
            stroke="rgba(148,163,184,0.22)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Animated progress circle */}
          <Motion.circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference + " " + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
            }}
          />
        </svg>

        {/* Score Text */}
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-black text-[color:var(--text-main)]">
            {score}
          </span>
          <span className="text-xs text-[color:var(--text-muted)]">/100</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Score", value: score },
          { label: "Level", value: riskLevel },
          { label: "Status", value: hasAssessment ? "Active" : "Pending" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-white/40 px-3 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">{item.label}</p>
            <p className="mt-1 text-lg font-bold text-[color:var(--text-main)]">{item.value}</p>
          </div>
        ))}
      </div>
      </DashboardCard>
    </Motion.div>
  );
}
