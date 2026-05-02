import { motion as Motion } from "framer-motion";
import { Gauge, TrendingDown, TrendingUp } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

const toneMap = {
  strong: {
    ring: "from-emerald-400 to-teal-400",
    text: "text-emerald-500",
    track: "bg-emerald-400/16",
  },
  steady: {
    ring: "from-amber-400 to-orange-400",
    text: "text-amber-500",
    track: "bg-amber-400/16",
  },
  gentle: {
    ring: "from-rose-400 to-red-400",
    text: "text-rose-500",
    track: "bg-rose-400/16",
  },
};

function ScoreRing({ label, value, icon, tone, trend }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  const meta = toneMap[tone] || toneMap.steady;
  const trendUp = trend === "up";
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-[1.6rem] border border-white/35 bg-white/35 p-4 backdrop-blur-xl dark:bg-white/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[color:var(--text-muted)]">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--text-main)]">{safeValue}</p>
        </div>
        <div className={`rounded-2xl p-3 ${meta.track}`}>{icon}</div>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <div
          className="relative h-20 w-20 rounded-full"
          style={{
            background: `conic-gradient(${safeValue >= 76 ? "#10b981" : safeValue >= 56 ? "#f59e0b" : "#ef4444"} ${safeValue * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
          }}
        >
          <Motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-[9px] flex items-center justify-center rounded-full bg-[color:var(--panel-strong)] text-sm font-semibold text-[color:var(--text-main)]"
          >
            {safeValue}%
          </Motion.div>
        </div>
        <div>
          <div className={`inline-flex items-center gap-1 text-xs font-semibold ${meta.text}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {trendUp ? "Improving" : "Needs lift"}
          </div>
          <div className="mt-3 h-2.5 w-32 overflow-hidden rounded-full bg-white/40 dark:bg-white/10">
            <Motion.div
              initial={{ width: 0 }}
              animate={{ width: `${safeValue}%` }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${meta.ring}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PerformanceCard({ scores = [] }) {
  return (
    <DashboardCard className="p-6" glow="from-teal-500/16 via-sky-500/10 to-violet-500/12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
            Performance Overview
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Wellness scores</h2>
        </div>
        <div className="hidden rounded-2xl border border-white/35 bg-white/40 p-3 backdrop-blur md:flex">
          <Gauge className="h-5 w-5 text-sky-500" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {scores.map((score) => (
          <ScoreRing key={score.label} {...score} />
        ))}
      </div>
    </DashboardCard>
  );
}
