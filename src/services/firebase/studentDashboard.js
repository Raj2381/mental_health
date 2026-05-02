import { doc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { activityList } from "../../data/activityConfig";
import { COLLECTIONS } from "./collections";
import {
  buildDailyActivityRecord,
  generateDailyRecommendations,
  getDailyQuote,
  getDayDifference,
  getDayKey,
  getUserTimeZone,
  normalizeActivityItems,
  resolvePrimaryStressType,
} from "../../utils/dashboardPersonalization";

function buildDashboardPayload(existingData = {}, options = {}) {
  const timeZone = options.timeZone || getUserTimeZone();
  const todayKey = options.dayKey || getDayKey(new Date(), timeZone);
  const currentActivity = buildDailyActivityRecord(existingData.dailyActivities, todayKey, timeZone);
  const nextItems = {
    ...currentActivity.items,
    ...(options.activityKey ? { [options.activityKey]: Boolean(options.value) } : {}),
  };
  const completedCount = Object.values(nextItems).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / activityList.length) * 100);
  const previousDayKey = existingData.lastActiveDateKey || existingData.lastActiveDate || null;
  const dayGap = getDayDifference(previousDayKey, todayKey);

  let streak = Number(existingData.streak || 0);
  if (!previousDayKey) streak = 1;
  else if (dayGap === 1) streak += 1;
  else if (dayGap > 1) streak = 1;
  else if (streak < 1) streak = 1;

  const dailyActivities = {
    dateKey: todayKey,
    timeZone,
    items: nextItems,
    completedCount,
    totalCount: activityList.length,
    progressPercent,
  };

  return {
    streak,
    lastActiveDateKey: todayKey,
    lastActiveDate: todayKey,
    dailyActivities,
    recommendations: generateDailyRecommendations(existingData, dailyActivities),
    quoteOfTheDay: {
      ...getDailyQuote(todayKey),
      dateKey: todayKey,
    },
    stressType: resolvePrimaryStressType(existingData),
    wellnessMeta: {
      timeZone,
      lastSyncedDateKey: todayKey,
      activityVersion: 2,
    },
  };
}

export async function syncStudentDashboard(uid) {
  if (!uid) return null;

  const studentRef = doc(db, COLLECTIONS.studentData, uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(studentRef);
    const current = snapshot.exists() ? snapshot.data() : { userId: uid };
    const payload = buildDashboardPayload(current);
    transaction.set(
      studentRef,
      {
        userId: uid,
        ...payload,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
    return payload;
  });
}

export async function updateStudentDailyActivity(uid, activityKey, value) {
  if (!uid || !activityKey) return null;

  const studentRef = doc(db, COLLECTIONS.studentData, uid);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(studentRef);
    const current = snapshot.exists() ? snapshot.data() : { userId: uid };
    const payload = buildDashboardPayload(current, { activityKey, value });
    transaction.set(
      studentRef,
      {
        userId: uid,
        ...payload,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
    return payload;
  });
}

export async function ensureStudentDashboardSeed(uid) {
  if (!uid) return;
  const timeZone = getUserTimeZone();
  const dayKey = getDayKey(new Date(), timeZone);
  await setDoc(
    doc(db, COLLECTIONS.studentData, uid),
    {
      userId: uid,
      streak: 1,
      lastActiveDateKey: dayKey,
      dailyActivities: {
        dateKey: dayKey,
        timeZone,
        items: normalizeActivityItems({}),
        completedCount: 0,
        totalCount: activityList.length,
        progressPercent: 0,
      },
      recommendations: [],
      quoteOfTheDay: {
        ...getDailyQuote(dayKey),
        dateKey: dayKey,
      },
      stressType: "balance",
      wellnessMeta: {
        timeZone,
        activityVersion: 2,
      },
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );
}
