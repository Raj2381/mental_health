import { activityList } from "../data/activityConfig";

export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function calculateActivityScore(dailyActivity = {}) {
  const completed = Number(dailyActivity?.completedCount ?? 0);
  const total = Number(dailyActivity?.totalCount ?? activityList.length);
  if (!total) return 0;
  return clamp((completed / total) * 100);
}

export function calculateAttendanceScore(attendanceRows = []) {
  if (!attendanceRows.length) return 0;
  const totals = attendanceRows.reduce(
    (acc, row) => {
      acc.attended += Number(row.attendedClasses || 0);
      acc.total += Number(row.totalClasses || 0);
      return acc;
    },
    { attended: 0, total: 0 }
  );

  if (!totals.total) return 0;
  return clamp((totals.attended / totals.total) * 100);
}

export function calculateConsistencyScore({ streak = 0, metrics = [], activityScore = 0 }) {
  const recentActivityAverage = metrics.length
    ? metrics.slice(0, 7).reduce((sum, item) => sum + Number(item.activityScore || 0), 0) / Math.min(metrics.length, 7)
    : activityScore;

  const streakBonus = Math.min(Number(streak || 0) * 8, 40);
  return clamp(recentActivityAverage * 0.65 + streakBonus);
}

export function calculateMentalScore({ assessmentScore = 0, activityScore = 0, consistencyScore = 0 }) {
  const balance = 100 - Number(assessmentScore || 0);
  return clamp(balance * 0.55 + activityScore * 0.2 + consistencyScore * 0.25);
}

export function calculateEngagementScore({ metrics = [], dailyActivity = {}, streak = 0 }) {
  const completionBonus = calculateActivityScore(dailyActivity) * 0.5;
  const streakBonus = Math.min(Number(streak || 0) * 6, 30);
  const recentUsage = metrics.length
    ? metrics.slice(0, 7).reduce((sum, item) => sum + Number(item.engagementScore || 0), 0) / Math.min(metrics.length, 7)
    : 55;
  return clamp(recentUsage * 0.35 + completionBonus + streakBonus);
}

export function derivePredictionStatus({ activityScore = 0, attendanceScore = 0, streak = 0, assessmentScore = 0, metrics = [] }) {
  const previousWeek = metrics.slice(1, 8);
  const lastWeekActivity = previousWeek.length
    ? previousWeek.reduce((sum, item) => sum + Number(item.activityScore || 0), 0) / previousWeek.length
    : activityScore;
  const lastWeekAttendance = previousWeek.length
    ? previousWeek.reduce((sum, item) => sum + Number(item.attendanceScore || 0), 0) / previousWeek.length
    : attendanceScore;

  const activityDelta = Math.round(activityScore - lastWeekActivity);
  const attendanceDelta = Math.round(attendanceScore - lastWeekAttendance);
  const droppingActivity = activityScore + 12 < lastWeekActivity;
  const droppingAttendance = attendanceScore + 10 < lastWeekAttendance;
  const lowAttendance = attendanceScore < 65;
  const brokenStreak = Number(streak || 0) <= 1;
  const highRisk = Number(assessmentScore || 0) >= 75;
  const reasons = [];

  if (droppingAttendance) reasons.push(`Attendance dropped ${Math.abs(attendanceDelta)}% this week`);
  if (droppingActivity) reasons.push(`Activity dropped ${Math.abs(activityDelta)}% this week`);
  if (brokenStreak) reasons.push("Your streak is close to breaking");
  if (highRisk) reasons.push("Assessment risk remains elevated");
  if (lowAttendance && !droppingAttendance) reasons.push("Attendance is below the healthy range");

  const warningCount = [droppingActivity, droppingAttendance, lowAttendance, brokenStreak, highRisk].filter(Boolean).length;
  const trend = warningCount >= 3 || droppingActivity || droppingAttendance
    ? "Declining"
    : activityDelta >= 0 && attendanceDelta >= 0
      ? "Improving"
      : "Stable";
  const confidence = warningCount >= 3 ? "High" : warningCount >= 1 ? "Medium" : "Low";
  const primaryReason = reasons[0] || "Signals are stable across attendance and activity";

  if (warningCount >= 3) {
    return {
      status: "at-risk",
      tone: "rose",
      title: "At Risk",
      message: "Your consistency dropped this week. Prioritize support and lighter routines.",
      reason: primaryReason,
      trend,
      confidence,
      actions: ["Book a counsellor session", "Add movement today"],
    };
  }

  if (warningCount >= 1) {
    return {
      status: "attention",
      tone: "amber",
      title: "Needs Attention",
      message: "A few signals softened this week. Protect your rhythm before it slips further.",
      reason: primaryReason,
      trend,
      confidence,
      actions: ["Complete your checklist", "Review attendance plan"],
    };
  }

  return {
    status: "well",
    tone: "emerald",
    title: "Doing Well",
    message: "Your routine and wellbeing indicators are holding steady.",
    reason: primaryReason,
    trend,
    confidence,
    actions: ["Keep your streak alive", "Maintain your study routine"],
  };
}

export function deriveProgressTrend(current = 0, previous = 0) {
  if (current > previous + 4) return { label: "Improving", direction: "up" };
  if (current < previous - 4) return { label: "Declining", direction: "down" };
  return { label: "Stable", direction: "flat" };
}

export function getXPAndLevel(metrics = {}) {
  const xp = clamp(
    Number(metrics.activityScore || 0) * 0.4 +
    Number(metrics.consistencyScore || 0) * 0.3 +
    Number(metrics.engagementScore || 0) * 0.3,
    0,
    100
  ) * 10;

  let level = "Beginner";
  if (xp >= 700) level = "Elite";
  else if (xp >= 400) level = "Consistent";

  const badges = [];
  if (Number(metrics.streak || 0) >= 7) badges.push("7-day streak");
  if (Number(metrics.activityScore || 0) === 100) badges.push("100% activity day");
  if (Number(metrics.attendanceScore || 0) >= 85) badges.push("Attendance keeper");

  return { xp, level, badges };
}

export function buildInsightCopy({ attendanceRows = [], metrics = [] }) {
  const insights = [];
  if (attendanceRows.length) {
    const weekdaysBias = attendanceRows.some((row) => Number(row.totalClasses || 0) >= 5);
    if (weekdaysBias) insights.push("You studied more consistently on weekdays.");
  }

  const exerciseDays = metrics.filter((item) => Number(item.activityScore || 0) >= 70 && Number(item.mentalScore || 0) >= 60);
  if (exerciseDays.length >= 2) {
    insights.push("Your mood improves on days with stronger activity completion.");
  }

  if (insights.length === 0) {
    insights.push("Keep logging progress daily to unlock stronger wellness insights.");
  }

  return insights.slice(0, 3);
}
