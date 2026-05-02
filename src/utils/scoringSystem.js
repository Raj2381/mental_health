/**
 * COMPREHENSIVE SCORING SYSTEM
 * 
 * Calculates Activity, Consistency, Mental, and XP scores
 * with real-time updates from daily checkins and assessments
 */

export const SCORING_CONFIG = {
  // Activity Score: 0-100 based on today's tasks
  activity: {
    totalTasks: 8,
    weights: {
      completed: 1.0,
    },
  },
  // Consistency Score: 0-100 based on last 7 days
  consistency: {
    lookbackDays: 7,
    minThreshold: 50, // At least 50% tasks to count as "completed day"
  },
  // Mental Score: 0-100 inverse of risk score
  mental: {
    riskWeight: 1.0,
    activityBonus: 0.2,
    consistencyBonus: 0.2,
  },
  // XP System
  xp: {
    levels: {
      Beginner: { min: 0, max: 100 },
      Intermediate: { min: 101, max: 300 },
      Advanced: { min: 301, max: 700 },
      Expert: { min: 701, max: Infinity },
    },
    weights: {
      activity: 0.4,
      consistency: 0.3,
      attendance: 0.2,
      streak: 0.1,
    },
  },
};

/**
 * Calculate Activity Score (0-100)
 * Based on today's completed tasks out of 8
 * 
 * @param {Object} dailyActivity - { completedCount, totalCount }
 * @returns {number} Activity score 0-100
 */
export function calculateActivityScore(dailyActivity = {}) {
  const completed = Number(dailyActivity?.completedCount ?? 0);
  const total = Number(dailyActivity?.totalCount ?? SCORING_CONFIG.activity.totalTasks);
  
  if (!total) return 0;
  return clamp((completed / total) * 100, 0, 100);
}

/**
 * Calculate Consistency Score (0-100)
 * Based on how many days in last 7 completed >= 50% tasks
 * 
 * @param {Array} dailyMetrics - Array of daily metric objects with activityScore
 * @returns {number} Consistency score 0-100
 */
export function calculateConsistencyScore(dailyMetrics = []) {
  if (!dailyMetrics.length) return 0;

  // Get last 7 days of metrics
  const last7Days = dailyMetrics.slice(0, 7);
  
  // Count days where activity >= 50%
  const completedDays = last7Days.filter(
    (metric) => Number(metric.activityScore ?? 0) >= SCORING_CONFIG.consistency.minThreshold
  ).length;

  const consistencyPercent = (completedDays / SCORING_CONFIG.consistency.lookbackDays) * 100;
  return clamp(consistencyPercent, 0, 100);
}

/**
 * Calculate Mental Score (0-100)
 * Inverse of risk score: 100 - riskScore
 * Higher risk = lower mental score
 * 
 * @param {number} riskScore - Current risk score (0-100)
 * @returns {number} Mental score 0-100
 */
export function calculateMentalScore(riskScore = 0) {
  const score = 100 - clamp(Number(riskScore ?? 0), 0, 100);
  return clamp(score, 0, 100);
}

/**
 * Calculate Attendance Score (0-100)
 * Based on total attended/total classes
 * 
 * @param {Array} attendanceData - Array of { attendedClasses, totalClasses }
 * @returns {number} Attendance score 0-100
 */
export function calculateAttendanceScore(attendanceData = []) {
  if (!attendanceData.length) return 0;

  const totals = attendanceData.reduce(
    (acc, row) => {
      acc.attended += Number(row.attendedClasses || 0);
      acc.total += Number(row.totalClasses || 0);
      return acc;
    },
    { attended: 0, total: 0 }
  );

  if (!totals.total) return 0;
  return clamp((totals.attended / totals.total) * 100, 0, 100);
}

/**
 * Calculate Streak Bonus (0-100)
 * Multiplier for consecutive days of completion
 * 
 * @param {number} streakDays - Current streak count
 * @returns {number} Streak score 0-100 (capped)
 */
export function calculateStreakBonus(streakDays = 0) {
  const bonus = Math.min(Number(streakDays ?? 0) * 10, 100);
  return clamp(bonus, 0, 100);
}

/**
 * Calculate XP (Total Points)
 * Weighted combination of all scores
 * 
 * Formula:
 * XP = (activity * 0.4) + (consistency * 0.3) + (attendance * 0.2) + (streak * 0.1)
 * Then multiply by 10 for point scale (0-1000)
 * 
 * @param {Object} scores - { activity, consistency, attendance, streak }
 * @returns {number} XP points 0-1000
 */
export function calculateXP(scores = {}) {
  const activity = Number(scores.activity ?? 0);
  const consistency = Number(scores.consistency ?? 0);
  const attendance = Number(scores.attendance ?? 0);
  const streak = Number(scores.streak ?? 0);

  const streakBonus = calculateStreakBonus(streak);

  const weighted =
    activity * SCORING_CONFIG.xp.weights.activity +
    consistency * SCORING_CONFIG.xp.weights.consistency +
    attendance * SCORING_CONFIG.xp.weights.attendance +
    streakBonus * SCORING_CONFIG.xp.weights.streak;

  return clamp(weighted * 10, 0, 1000);
}

/**
 * Get Level based on XP
 * 
 * @param {number} xp - Total XP points
 * @returns {Object} { level, nextLevelXp, currentLevelXp, progressPercent }
 */
export function getLevelFromXP(xp = 0) {
  const levels = SCORING_CONFIG.xp.levels;
  let currentLevel = "Beginner";
  let currentLevelXp = 0;
  let nextLevelXp = 100;

  for (const [level, range] of Object.entries(levels)) {
    if (xp >= range.min && xp <= range.max) {
      currentLevel = level;
      currentLevelXp = range.min;
      
      // Get next level's min if it exists
      const levelKeys = Object.keys(levels);
      const currentIndex = levelKeys.indexOf(level);
      if (currentIndex < levelKeys.length - 1) {
        nextLevelXp = levels[levelKeys[currentIndex + 1]].min;
      }
      break;
    }
  }

  const progressInLevel = nextLevelXp - currentLevelXp;
  const progressPercent = ((xp - currentLevelXp) / progressInLevel) * 100;

  return {
    level: currentLevel,
    xp,
    currentLevelXp,
    nextLevelXp,
    progressPercent: clamp(progressPercent, 0, 100),
  };
}

/**
 * Get Score Status (for UI coloring)
 * 
 * @param {number} score - Score value 0-100
 * @returns {Object} { status, color, label, icon }
 */
export function getScoreStatus(score = 0) {
  const value = Number(score ?? 0);

  if (value < 40) {
    return {
      status: "critical",
      color: "from-red-500/20 to-rose-500/10",
      textColor: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-500/12",
      label: "Needs Lift",
      tone: "rose",
    };
  }

  if (value < 70) {
    return {
      status: "improving",
      color: "from-amber-500/20 to-orange-500/10",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/12",
      label: "Improving",
      tone: "amber",
    };
  }

  return {
    status: "strong",
    color: "from-emerald-500/20 to-teal-500/10",
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/12",
    label: "Strong",
    tone: "emerald",
  };
}

/**
 * Get gradient based on score
 * For animated progress bars
 * 
 * @param {number} score - Score 0-100
 * @returns {string} CSS gradient
 */
export function getScoreGradient(score = 0) {
  const value = Number(score ?? 0);

  if (value < 40) {
    return "bg-[linear-gradient(90deg,#ef4444_0%,#f43f5e_100%)]"; // Red
  }

  if (value < 70) {
    return "bg-[linear-gradient(90deg,#f59e0b_0%,#f97316_100%)]"; // Amber
  }

  return "bg-[linear-gradient(90deg,#10b981_0%,#14b8a6_100%)]"; // Green
}

/**
 * Clamp value between min and max
 * 
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(value ?? 0))));
}

/**
 * Format XP for display
 * 
 * @param {number} xp - XP value
 * @returns {string} Formatted XP string
 */
export function formatXP(xp = 0) {
  const value = Number(xp ?? 0);
  return Math.floor(value).toLocaleString();
}
