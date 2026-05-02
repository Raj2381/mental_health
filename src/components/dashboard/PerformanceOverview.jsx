import { motion as Motion } from "framer-motion";
import { TrendingUp, Award, Zap, Target } from "lucide-react";
import DashboardCard from "./DashboardCard";
import EnhancedProgressCard from "./EnhancedProgressCard";
import { formatXP } from "../../utils/scoringSystem";

/**
 * Performance Overview Component
 * Shows Activity, Consistency, Mental, and XP/Level
 * 
 * Props:
 * - scores: object - { activity, consistency, mental, xp, level, progressPercent }
 * - statuses: object - { activity, consistency, mental, attendance } with color data
 * - trends: object - { activity, consistency, mental } with trend data
 * - loading: boolean - Loading state
 */
export default function PerformanceOverview({
  scores = {},
  statuses = {},
  trends = {},
  loading = false,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  const activity = Number(scores.activity ?? 0);
  const consistency = Number(scores.consistency ?? 0);
  const mental = Number(scores.mental ?? 0);
  const xp = Number(scores.xp ?? 0);
  const level = scores.level || "Beginner";
  const progressPercent = Number(scores.progressPercent ?? 0);

  return (
    <div className="space-y-6">
      {/* Main Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <EnhancedProgressCard
          title="Activity Score"
          value={activity}
          status={getStatus(activity)}
          trend={trends.activity || { label: "Stable", direction: "flat" }}
          accent="from-sky-500/20 to-cyan-500/10"
          showGlow={activity >= 70}
        />
        <EnhancedProgressCard
          title="Consistency"
          value={consistency}
          status={getStatus(consistency)}
          trend={trends.consistency || { label: "Stable", direction: "flat" }}
          accent="from-violet-500/20 to-purple-500/10"
          showGlow={consistency >= 70}
        />
        <EnhancedProgressCard
          title="Mental Score"
          value={mental}
          status={getStatus(mental)}
          trend={trends.mental || { label: "Stable", direction: "flat" }}
          accent="from-emerald-500/20 to-teal-500/10"
          showGlow={mental >= 70}
        />
      </div>

      {/* XP and Level Card */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DashboardCard
          className="p-6 bg-[linear-gradient(135deg,#08111f_0%,#1d4ed8_40%,#0f766e_100%)] text-white overflow-hidden relative"
          glow="from-sky-500/20 via-teal-500/12 to-violet-500/8"
        >
          {/* Animated background */}
          <Motion.div
            className="absolute inset-0 opacity-10"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, #10b981 0%, transparent 50%)",
                "radial-gradient(circle at 0% 0%, #3b82f6 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20">
                  <Zap size={20} className="text-amber-300" />
                </div>
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.22em] text-white/70">
                    Experience Points
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    Daily Performance Multiplier
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black">{formatXP(xp)}</p>
                <p className="text-xs text-white/60 mt-1">Points</p>
              </div>
            </div>

            {/* Level Section */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10">
              {/* Current Level */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Award size={18} className="text-yellow-300" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Current Level</p>
                  <p className="text-lg font-bold">{level}</p>
                </div>
              </div>

              {/* Progress to Next Level */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10">
                  <Target size={18} className="text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Level Progress</p>
                  <p className="text-lg font-bold">{Math.round(progressPercent)}%</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-white/70">
                  Progress to {getNextLevel(level)}
                </p>
                <p className="text-xs text-white/50">{Math.round(progressPercent)}%</p>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden backdrop-blur-xl border border-white/20">
                <Motion.div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,#fbbf24_0%,#f97316_100%)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercent, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/60 mb-3">
                Daily Achievements
              </p>
              <div className="flex flex-wrap gap-2">
                {activity >= 80 && (
                  <Badge label="High Activity" icon="🎯" />
                )}
                {consistency >= 80 && (
                  <Badge label="Consistent" icon="🔥" />
                )}
                {mental >= 80 && (
                  <Badge label="Mentally Strong" icon="💪" />
                )}
                {xp >= 500 && (
                  <Badge label="XP Milestone" icon="⭐" />
                )}
                {!activity && !consistency && !mental && (
                  <p className="text-xs text-white/50 italic">Complete tasks to earn badges</p>
                )}
              </div>
            </div>
          </div>
        </DashboardCard>
      </Motion.div>
    </div>
  );
}

/**
 * Get status level for UI coloring
 */
function getStatus(score) {
  const value = Number(score ?? 0);
  if (value < 40) return "critical";
  if (value < 70) return "improving";
  return "strong";
}

/**
 * Get next level
 */
function getNextLevel(currentLevel) {
  const levels = ["Beginner", "Intermediate", "Advanced", "Expert"];
  const index = levels.indexOf(currentLevel);
  if (index >= 0 && index < levels.length - 1) {
    return levels[index + 1];
  }
  return "Max Level";
}

/**
 * Badge Component
 */
function Badge({ label, icon }) {
  return (
    <Motion.div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl hover:bg-white/15 transition-colors"
      whileHover={{ scale: 1.05 }}
    >
      <span>{icon}</span>
      <span className="text-xs font-semibold text-white">{label}</span>
    </Motion.div>
  );
}
