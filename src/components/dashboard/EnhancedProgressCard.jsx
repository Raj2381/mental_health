import { motion as Motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp } from "lucide-react";
import DashboardCard from "./DashboardCard";

function TrendIcon({ direction }) {
  if (direction === "up") return <ArrowUpRight className="h-4 w-4" />;
  if (direction === "down") return <ArrowDownRight className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
}

/**
 * Enhanced Progress Card with Status Colors
 * 
 * Props:
 * - title: string - Card title
 * - value: number - Score 0-100
 * - trend: { label, direction } - Trend data
 * - status: string - "critical" | "improving" | "strong"
 * - accent: string - Tailwind gradient for card
 * - showGlow: boolean - Add glowing effect for high scores
 */
export default function ProgressCard({
  title,
  value = 0,
  trend,
  status = "improving",
  accent = "from-sky-500/20 to-violet-500/10",
  showGlow = false,
}) {
  const numValue = Number(value ?? 0);

  // Determine colors based on status
  const statusConfig = {
    critical: {
      accent: "from-red-500/20 to-rose-500/10",
      bar: "bg-[linear-gradient(90deg,#ef4444_0%,#f43f5e_100%)]",
      badge: "bg-red-500/12 text-red-600 dark:text-red-400",
      glow: "from-red-500/20 via-rose-500/10 to-transparent",
    },
    improving: {
      accent: "from-amber-500/20 to-orange-500/10",
      bar: "bg-[linear-gradient(90deg,#f59e0b_0%,#f97316_100%)]",
      badge: "bg-amber-500/12 text-amber-600 dark:text-amber-400",
      glow: "from-amber-500/20 via-orange-500/10 to-transparent",
    },
    strong: {
      accent: "from-emerald-500/20 to-teal-500/10",
      bar: "bg-[linear-gradient(90deg,#10b981_0%,#14b8a6_100%)]",
      badge: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
      glow: "from-emerald-500/20 via-teal-500/10 to-transparent",
    },
  };

  const colors = statusConfig[status] || statusConfig.improving;

  return (
    <DashboardCard 
      className="p-5 relative overflow-hidden" 
      glow={showGlow && numValue >= 70 ? colors.glow : accent}
    >
      {/* Animated background for high scores */}
      {numValue >= 70 && (
        <Motion.div
          className="absolute inset-0 opacity-0"
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            background: `radial-gradient(circle at center, ${colors.bar} 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative z-10">
        {/* Title */}
        <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
          {title}
        </p>

        {/* Score and Trend */}
        <div className="mt-4 flex items-end justify-between gap-4">
          <Motion.p
            className="text-4xl font-black text-[color:var(--text-main)]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {Math.round(numValue)}
          </Motion.p>

          {/* Trend Badge */}
          <div
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${colors.badge}`}
          >
            <TrendIcon direction={trend?.direction} />
            {trend?.label || "Stable"}
          </div>
        </div>

        {/* Status Label - only show if score < 70 */}
        {numValue < 70 && (
          <p className="mt-2 text-xs font-medium text-[color:var(--text-muted)]">
            {status === "critical"
              ? "Needs your attention"
              : status === "improving"
                ? "Keep building momentum"
                : "Great progress!"}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/25">
          <Motion.div
            className={`h-2 rounded-full shadow-lg ${colors.bar}`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(0, Math.min(100, numValue))}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          />
        </div>

        {/* Percentage text */}
        <p className="mt-2 text-right text-xs text-[color:var(--text-muted)]">
          {Math.round(numValue)}%
        </p>
      </div>
    </DashboardCard>
  );
}
