import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { db } from "../../firebase";

// Real-time listener for progress data
export function watchStudentProgress(userId, callback) {
  if (!userId) {
    console.warn("watchStudentProgress: userId is required");
    return () => {};
  }

  try {
    // Listen to student_data document directly (most efficient)
    const unsubscribe = onSnapshot(
      doc(db, "student_data", userId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback({
            userId,
            dailyActivities: data.dailyActivities || {},
            streak: data.streak || 0,
            lastActiveDateKey: data.lastActiveDateKey,
            recommendations: data.recommendations || [],
            lastUpdated: data.lastUpdated,
            ...data,
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error("watchStudentProgress error:", error);
        callback(null);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("watchStudentProgress setup error:", error);
    return () => {};
  }
}

// Real-time listener specifically for daily activities
export function watchDailyActivities(userId, callback) {
  if (!userId) return () => {};

  try {
    const unsubscribe = onSnapshot(
      doc(db, "student_data", userId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const dailyActivities = data.dailyActivities || {};
          const result = {
            dailyActivities,
            completedCount: dailyActivities.completedCount ?? 0,
            totalCount: dailyActivities.totalCount ?? 0,
            progressPercent: dailyActivities.progressPercent ?? 0,
            dateKey: dailyActivities.dateKey,
            items: dailyActivities.items || {},
          };
          console.log("watchDailyActivities emitting:", result);
          callback(result);
        } else {
          console.warn("watchDailyActivities: No student_data document found for user", userId);
          callback({
            dailyActivities: {},
            completedCount: 0,
            totalCount: 0,
            progressPercent: 0,
            dateKey: null,
            items: {},
          });
        }
      },
      (error) => {
        console.error("watchDailyActivities error:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("watchDailyActivities setup error:", error);
    return () => {};
  }
}

// Update daily activity with real-time reflection
export async function updateDailyActivityOptimistic(userId, updates) {
  if (!userId) throw new Error("userId is required");

  try {
    const studentRef = doc(db, "student_data", userId);

    // Optimistic update - immediately reflect in UI
    // (The listener will sync when server updates)
    return new Promise((resolve, reject) => {
      setDoc(
        studentRef,
        {
          dailyActivities: {
            ...updates,
            lastModified: serverTimestamp(),
          },
          lastUpdated: serverTimestamp(),
        },
        { merge: true }
      )
        .then(() => resolve(updates))
        .catch((error) => {
          console.error("Failed to update daily activity:", error);
          reject(error);
        });
    });
  } catch (error) {
    console.error("updateDailyActivityOptimistic error:", error);
    throw error;
  }
}

// Sync entire student progress - atomic operation
export async function syncStudentProgressAtomic(userId, progressData) {
  if (!userId) throw new Error("userId is required");

  const studentRef = doc(db, "student_data", userId);

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(studentRef);
    const existing = snapshot.exists() ? snapshot.data() : { userId };

    const merged = {
      ...existing,
      ...progressData,
      lastUpdated: serverTimestamp(),
    };

    transaction.set(studentRef, merged, { merge: true });
    return merged;
  });
}

// Batch update multiple daily metrics
export async function updateDailyMetricsBatch(userId, metrics) {
  if (!userId) throw new Error("userId is required");

  const dailyMetricsRef = doc(db, "dailyMetrics", userId);

  return setDoc(
    dailyMetricsRef,
    {
      userId,
      ...metrics,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Listen to real-time streaks
export function watchStreakData(userId, callback) {
  if (!userId) return () => {};

  return onSnapshot(
    doc(db, "student_data", userId),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          streak: data.streak || 0,
          lastActiveDateKey: data.lastActiveDateKey,
          totalPoints: data.totalPoints || 0,
          level: data.level || 1,
        });
      }
    },
    (error) => {
      console.error("watchStreakData error:", error);
    }
  );
}

// Listen to recommendations in real-time
export function watchRecommendations(userId, callback) {
  if (!userId) return () => {};

  return onSnapshot(
    doc(db, "student_data", userId),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          recommendations: data.recommendations || [],
          quoteOfTheDay: data.quoteOfTheDay || {},
        });
      }
    },
    (error) => {
      console.error("watchRecommendations error:", error);
    }
  );
}
