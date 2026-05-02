import { motion as Motion } from "framer-motion";
import { Heart, BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import DashboardCard from "./DashboardCard";

/**
 * Wellness Overview Component
 * Shows high-level wellness status with alerts and recommendations
 * 
 * Props:
 * - scores: object - { activity, consistency, mental, attendance, xp }
 * - riskScore: number - Current risk score (0-100)
 * - streak: number - Current streak days
 * - loading: boolean
 */
export default function WellnessOverview({
  scores = {},
  riskScore = 0,
  streak = 0,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-40 rounded-xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  const activity = Number(scores.activity ?? 0);
  const consistency = Number(scores.consistency ?? 0);
  const mental = Number(scores.mental ?? 0);
  const attendance = Number(scores.attendance ?? 0);
  const risk = Number(riskScore ?? 0);
  const streakDays = Number(streak ?? 0);

  // Calculate overall wellness status
  const avgScore = (activity + consistency + mental + attendance) / 4;
  const wellnessStatus = getWellnessStatus(avgScore, risk, streakDays);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Wellness Status Card */}
      <Motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DashboardCard
          className={`p-6 relative overflow-hidden ${wellnessStatus.gradient}`}
          glow={wellnessStatus.glow}
        >
          {/* Animated accent */}
          <Motion.div
            className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              background: `radial-gradient(circle, ${wellnessStatus.accentColor} 0%, transparent 70%)`,
            }}
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg backdrop-blur-xl border ${wellnessStatus.iconBg}`}
                >
                  <Heart size={20} color={wellnessStatus.iconColor} />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    Wellness Status
                  </p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 ${wellnessStatus.badge}`}
              >
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {wellnessStatus.label}
              </div>
            </div>

            {/* Status Title and Message */}
            <div className="mb-5">
              <p className="text-2xl font-bold text-[color:var(--text-main)] mb-2">
                {wellnessStatus.title}
              </p>
              <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
                {wellnessStatus.message}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 p-3 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10">
              <MetricItem label="Overall" value={Math.round(avgScore)} />
              <MetricItem label="Risk Level" value={risk} isRisk />
              <MetricItem label="Streak" value={`${streakDays}d`} />
              <MetricItem label="Trend" value={wellnessStatus.trend} isTrend />
            </div>

            {/* Action */}
            {wellnessStatus.needsAttention && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <AlertCircle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-5 text-[color:var(--text-secondary)]">
                  {wellnessStatus.actionMessage}
                </p>
              </div>
            )}
          </div>
        </DashboardCard>
      </Motion.div>

      {/* Score Breakdown Card */}
      <Motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DashboardCard
          className="p-6 bg-[linear-gradient(135deg,rgba(6,182,212,0.05)_0%,rgba(59,130,246,0.05)_100%)]"
          glow="from-cyan-500/12 via-blue-500/8 to-transparent"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10">
              <BarChart3 size={20} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                Score Breakdown
              </p>
            </div>
          </div>

          {/* Score Bars */}
          <div className="space-y-4">
            <ScoreBar label="Activity" value={activity} />
            <ScoreBar label="Consistency" value={consistency} />
            <ScoreBar label="Mental" value={mental} />
            <ScoreBar label="Attendance" value={attendance} />
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-[color:var(--text-muted)] mb-3">Overall Wellness</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-[color:var(--text-main)]">
                  {Math.round(avgScore)}%
                </p>
                <p className="text-xs text-[color:var(--text-secondary)] mt-1">
                  {avgScore >= 70 ? "Keep it up! 🚀" : avgScore >= 50 ? "Room to improve 📈" : "Focus on recovery 💙"}
                </p>
              </div>
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${getScoreColor(
                  avgScore
                ).circle}`}
              >
                {Math.round(avgScore)}
              </div>
            </div>
          </div>
        </DashboardCard>
      </Motion.div>
    </div>
  );
}

/**
 * Calculate wellness status based on scores
 */
function getWellnessStatus(avgScore, riskScore, streak) {
  const risk = Number(riskScore ?? 0);
  const needsAttention = avgScore < 50 || risk > 70;

  if (avgScore >= 70 && risk < 40) {
    return {
      title: "Thriving",
      label: "Optimal",
      message: "Your wellbeing metrics are excellent. Maintain this momentum!",
      status: "thriving",
      gradient: "bg-[linear-gradient(135deg,rgba(16,185,129,0.1)_0%,rgba(20,184,166,0.08)_100%)]",
      glow: "from-emerald-500/15 via-teal-500/8 to-transparent",
      badge: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      iconBg: "bg-emerald-500/12 border-emerald-500/20",
      iconColor: "#10b981",
      accentColor: "#10b981",
      trend: "↑ Strong",
      needsAttention: false,
      actionMessage: "",
    };
  }

  if (avgScore >= 50 && risk <= 70 && streak > 0) {
    return {
      title: "Stable",
      label: "Good",
      message: "Your wellness is progressing well. Keep your routine consistent.",
      status: "stable",
      gradient: "bg-[linear-gradient(135deg,rgba(59,130,246,0.1)_0%,rgba(147,51,234,0.08)_100%)]",
      glow: "from-blue-500/15 via-purple-500/8 to-transparent",
      badge: "bg-blue-500/12 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      iconBg: "bg-blue-500/12 border-blue-500/20",
      iconColor: "#3b82f6",
      accentColor: "#3b82f6",
      trend: "→ Holding",
      needsAttention: false,
      actionMessage: "",
    };
  }

  if (avgScore < 50 || risk > 70) {
    return {
      title: "Needs Support",
      label: "Attention",
      message: "Your wellbeing needs focus. Small steps can make a big difference.",
      status: "needs-support",
      gradient: "bg-[linear-gradient(135deg,rgba(239,68,68,0.1)_0%,rgba(244,63,94,0.08)_100%)]",
      glow: "from-red-500/15 via-rose-500/8 to-transparent",
      badge: "bg-amber-500/12 text-amber-600 dark:text-amber-400 border border-amber-500/20",
      iconBg: "bg-amber-500/12 border-amber-500/20",
      iconColor: "#f59e0b",
      accentColor: "#f59e0b",
      trend: "↓ Declining",
      needsAttention: true,
      actionMessage: "Consider booking a counselor session to discuss your wellness plan.",
    };
  }

  // Default
  return {
    title: "Starting",
    label: "Building",
    message: "Begin your wellness journey by completing daily activities.",
    status: "starting",
    gradient: "bg-[linear-gradient(135deg,rgba(168,85,247,0.1)_0%,rgba(139,92,246,0.08)_100%)]",
    glow: "from-purple-500/15 via-indigo-500/8 to-transparent",
    badge: "bg-purple-500/12 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    iconBg: "bg-purple-500/12 border-purple-500/20",
    iconColor: "#a855f7",
    accentColor: "#a855f7",
    trend: "○ New",
    needsAttention: false,
    actionMessage: "",
  };
}

/**
 * Get color class for overall score circle
 */
function getScoreColor(score) {
  const value = Number(score ?? 0);

  if (value >= 70) {
    return {
      circle: "bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_100%)] text-white",
    };
  }

  if (value >= 50) {
    return {
      circle: "bg-[linear-gradient(135deg,#f59e0b_0%,#f97316_100%)] text-white",
    };
  }

  return {
    circle: "bg-[linear-gradient(135deg,#ef4444_0%,#f43f5e_100%)] text-white",
  };
}

/**
 * Metric Item Component
 */
function MetricItem({ label, value, isRisk = false, isTrend = false }) {
  return (
    <div>
      <p className="text-xs text-[color:var(--text-muted)] mb-1">{label}</p>
      <p className={`text-lg font-bold ${isRisk || isTrend ? "text-white" : "text-[color:var(--text-main)]"}`}>
        {value}
        {isRisk || (typeof value === "string" && !isTrend) ? "" : "%"}
      </p>
    </div>
  );
}

/**
 * Score Bar Component
 */
function ScoreBar({ label, value }) {
  const numValue = Number(value ?? 0);
  const color =
    numValue >= 70
      ? "bg-[linear-gradient(90deg,#10b981_0%,#14b8a6_100%)]"
      : numValue >= 50
        ? "bg-[linear-gradient(90deg,#f59e0b_0%,#f97316_100%)]"
        : "bg-[linear-gradient(90deg,#ef4444_0%,#f43f5e_100%)]";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-medium text-[color:var(--text-muted)]">{label}</p>
        <p className="text-xs font-bold text-[color:var(--text-main)]">{Math.round(numValue)}%</p>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <Motion.div
          className={`h-1.5 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(numValue, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
