import { activityList } from "../data/activityConfig";

const DAILY_QUOTES = [
  { text: "Small steps compound into meaningful change.", author: "Wellness Hub" },
  { text: "Consistency beats intensity when building a better routine.", author: "Wellness Hub" },
  { text: "Protect your energy, then spend it on what matters.", author: "Wellness Hub" },
  { text: "Rest is part of progress, not a reward for it.", author: "Wellness Hub" },
  { text: "A calm mind learns faster and recovers better.", author: "Wellness Hub" },
  { text: "Momentum starts with one completed task.", author: "Wellness Hub" },
  { text: "You do not need a perfect day to have a productive one.", author: "Wellness Hub" },
  { text: "Make today easier for tomorrow's version of you.", author: "Wellness Hub" },
];

const STRESS_LABELS = {
  academicStress: "academic",
  socialConnection: "social",
  emotionalWellbeing: "emotional",
  sleepQuality: "sleep",
  anxietyStress: "emotional",
};

export function getUserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function getDateParts(date = new Date(), timeZone = getUserTimeZone()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(date);

  return parts.reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
}

export function getDayKey(date = new Date(), timeZone = getUserTimeZone()) {
  const parts = getDateParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function dayKeyToUtc(dayKey) {
  if (!dayKey || typeof dayKey !== "string") return null;
  const [year, month, day] = dayKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return Date.UTC(year, month - 1, day);
}

export function getDayDifference(fromDayKey, toDayKey) {
  const fromUtc = dayKeyToUtc(fromDayKey);
  const toUtc = dayKeyToUtc(toDayKey);
  if (fromUtc == null || toUtc == null) return null;
  return Math.round((toUtc - fromUtc) / 86400000);
}

export function getGreeting(name = "Student", date = new Date(), timeZone = getUserTimeZone()) {
  const parts = getDateParts(date, timeZone);
  const hour = Number(parts.hour || 12);
  let prefix = "Good Evening";

  if (hour < 12) prefix = "Good Morning";
  else if (hour < 17) prefix = "Good Afternoon";

  const firstName = String(name || "Student").trim().split(" ")[0];
  return `${prefix}, ${firstName} 👋`;
}

export function getDailyQuote(dayKey = getDayKey()) {
  const index = Math.abs(
    [...String(dayKey)].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  ) % DAILY_QUOTES.length;
  return DAILY_QUOTES[index];
}

export function createDefaultActivityItems() {
  return activityList.reduce((acc, activity) => {
    acc[activity.key] = false;
    return acc;
  }, {});
}

export function normalizeActivityItems(rawActivity) {
  const defaults = createDefaultActivityItems();
  if (!rawActivity || typeof rawActivity !== "object") return defaults;

  const source = rawActivity.items && typeof rawActivity.items === "object"
    ? rawActivity.items
    : rawActivity;

  return activityList.reduce((acc, activity) => {
    acc[activity.key] = Boolean(source?.[activity.key]);
    return acc;
  }, defaults);
}

export function buildDailyActivityRecord(rawActivity, dayKey = getDayKey(), timeZone = getUserTimeZone()) {
  const rawDayKey = rawActivity?.dateKey;
  const hasLegacyBooleans = !rawDayKey && activityList.some((activity) => activity.key in (rawActivity || {}));
  const items = rawDayKey === dayKey || hasLegacyBooleans
    ? normalizeActivityItems(rawActivity)
    : createDefaultActivityItems();
  const completedCount = Object.values(items).filter(Boolean).length;

  return {
    dateKey: dayKey,
    timeZone,
    items,
    completedCount,
    totalCount: activityList.length,
    progressPercent: Math.round((completedCount / activityList.length) * 100),
  };
}

export function resolvePrimaryStressType(studentData = {}) {
  if (studentData?.primaryConcern && STRESS_LABELS[studentData.primaryConcern]) {
    return STRESS_LABELS[studentData.primaryConcern];
  }

  const entries = Object.entries(studentData?.categoryScores || {});
  if (entries.length === 0) return "balance";

  const [highestKey] = [...entries].sort(([, left], [, right]) => right - left)[0];
  return STRESS_LABELS[highestKey] || "balance";
}

export function getRiskMeta(studentData = {}) {
  const score = Number(studentData?.assessmentScore ?? 0);
  if (score >= 75) return { label: "High Risk", tone: "rose" };
  if (score >= 50) return { label: "Moderate Risk", tone: "amber" };
  return { label: "Low Risk", tone: "emerald" };
}

export function generateDailyRecommendations(studentData = {}, dailyActivity = buildDailyActivityRecord()) {
  const items = [];
  const riskScore = Number(studentData?.assessmentScore ?? 0);
  const stressType = resolvePrimaryStressType(studentData);
  const activityItems = dailyActivity?.items || createDefaultActivityItems();

  if (riskScore >= 75) {
    items.push({
      id: "counsellor",
      title: "Book a counsellor session",
      description: "Your current risk score suggests timely support would help.",
      accent: "rose",
    });
  }

  if (stressType === "social" || !activityItems.social) {
    items.push({
      id: "social",
      title: "Schedule one social touchpoint",
      description: "A short conversation with a friend or classmate can reduce isolation.",
      accent: "sky",
    });
  }

  if (stressType === "academic" || !activityItems.timetable || !activityItems.study) {
    items.push({
      id: "academic",
      title: "Use a lighter study sprint",
      description: "Try one focused 25-minute block and review only the next priority topic.",
      accent: "amber",
    });
  }

  if (stressType === "sleep") {
    items.push({
      id: "sleep",
      title: "Protect tonight's sleep window",
      description: "Wind down earlier and keep screens away for the last 30 minutes.",
      accent: "indigo",
    });
  }

  if (!activityItems.exercise && !activityItems.yoga) {
    items.push({
      id: "movement",
      title: "Add light movement",
      description: "A walk, stretch, or short workout will improve energy and mood.",
      accent: "emerald",
    });
  }

  if (!activityItems.checkin) {
    items.push({
      id: "checkin",
      title: "Complete your daily check-in",
      description: "Logging how you feel improves the quality of your recommendations.",
      accent: "violet",
    });
  }

  if (!activityItems.tasks) {
    items.push({
      id: "tasks",
      title: "Close one pending task",
      description: "Finish one small item now to rebuild momentum for the rest of the day.",
      accent: "orange",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "maintain",
      title: "Maintain your rhythm",
      description: "Your routine looks balanced today. Keep the same pace through the evening.",
      accent: "teal",
    });
  }

  return items.slice(0, 4);
}
