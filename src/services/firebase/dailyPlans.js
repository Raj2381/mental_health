import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

/**
 * Create or update daily plan for a user
 * @param {String} userId - User ID
 * @param {String} date - Date string (YYYY-MM-DD)
 * @param {Object} dailyPlanData - Daily plan object with tasks, basedOn, etc.
 * @returns {Promise<Object>} Created/updated daily plan
 */
export async function saveDailyPlan(userId, date, dailyPlanData) {
  try {
    const planRef = doc(
      db,
      "users",
      userId,
      "dailyPlans",
      date
    );

    const planWithMetadata = {
      ...dailyPlanData,
      userId,
      date,
      updatedAt: serverTimestamp(),
      createdAt: dailyPlanData.createdAt || serverTimestamp(),
    };

    await setDoc(planRef, planWithMetadata, { merge: true });

    return planWithMetadata;
  } catch (error) {
    console.error(`Error saving daily plan for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Get today's daily plan for a user
 * @param {String} userId - User ID
 * @param {String} date - Date string (YYYY-MM-DD), defaults to today
 * @returns {Promise<Object|null>} Daily plan object or null if not found
 */
export async function getTodaysDailyPlan(userId, date = null) {
  try {
    const targetDate = date || new Date().toISOString().split("T")[0];
    const planRef = doc(db, "users", userId, "dailyPlans", targetDate);
    const planSnap = await getDoc(planRef);

    if (planSnap.exists()) {
      return { id: planSnap.id, ...planSnap.data() };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching daily plan for user ${userId}:`, error);
    return null;
  }
}

/**
 * Get daily plans for a date range
 * @param {String} userId - User ID
 * @param {String} startDate - Start date (YYYY-MM-DD)
 * @param {String} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Array of daily plan objects
 */
export async function getDailyPlansByDateRange(userId, startDate, endDate) {
  try {
    const plansRef = collection(db, "users", userId, "dailyPlans");
    const q = query(
      plansRef,
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );

    const querySnap = await getDocs(q);
    return querySnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error fetching daily plans for user ${userId}:`, error);
    return [];
  }
}

/**
 * Mark a task as completed and update risk score
 * @param {String} userId - User ID
 * @param {String} date - Date string (YYYY-MM-DD)
 * @param {Number} taskIndex - Index of task in tasks array
 * @returns {Promise<Object>} Updated daily plan
 */
export async function completeTask(userId, date, taskIndex) {
  try {
    const planRef = doc(db, "users", userId, "dailyPlans", date);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error("Daily plan not found");
      return null;
    }

    const planData = planSnap.data();
    const tasks = planData.tasks || [];
    const stats = planData.stats || {};

    // Mark task as completed
    if (tasks[taskIndex]) {
      tasks[taskIndex].completed = true;
      tasks[taskIndex].completedAt = new Date().toISOString();
    }

    // Calculate new progress
    const completedCount = tasks.filter((t) => t.completed).length;
    const newProgress = {
      completed: completedCount,
      total: tasks.length,
      percentage: Math.round((completedCount / tasks.length) * 100),
    };

    // Calculate new risk score
    const originalRiskScore = stats.originalRiskScore || planData.basedOn?.totalScore || 0;
    const reductionPerTask = 0.5;
    const newRiskScore = Math.max(
      0,
      Math.round((originalRiskScore - completedCount * reductionPerTask) * 10) / 10
    );

    // Update daily plan in Firebase
    await updateDoc(planRef, {
      tasks,
      progress: newProgress,
      "stats.currentRiskScore": newRiskScore,
      updatedAt: serverTimestamp(),
    });

    // Update user's current risk score in student_data
    await updateUserRiskScore(userId, newRiskScore);

    return {
      ...planData,
      tasks,
      progress: newProgress,
      stats: { ...stats, currentRiskScore: newRiskScore },
    };
  } catch (error) {
    console.error(`Error completing task for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Unmark a task as completed and recalculate risk score
 * @param {String} userId - User ID
 * @param {String} date - Date string (YYYY-MM-DD)
 * @param {Number} taskIndex - Index of task in tasks array
 * @returns {Promise<Object>} Updated daily plan
 */
export async function uncompleteTask(userId, date, taskIndex) {
  try {
    const planRef = doc(db, "users", userId, "dailyPlans", date);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error("Daily plan not found");
      return null;
    }

    const planData = planSnap.data();
    const tasks = planData.tasks || [];
    const stats = planData.stats || {};

    // Mark task as not completed
    if (tasks[taskIndex]) {
      tasks[taskIndex].completed = false;
      tasks[taskIndex].completedAt = null;
    }

    // Calculate new progress
    const completedCount = tasks.filter((t) => t.completed).length;
    const newProgress = {
      completed: completedCount,
      total: tasks.length,
      percentage: Math.round((completedCount / tasks.length) * 100),
    };

    // Calculate new risk score
    const originalRiskScore = stats.originalRiskScore || planData.basedOn?.totalScore || 0;
    const reductionPerTask = 0.5;
    const newRiskScore = Math.max(
      0,
      Math.round((originalRiskScore - completedCount * reductionPerTask) * 10) / 10
    );

    // Update daily plan in Firebase
    await updateDoc(planRef, {
      tasks,
      progress: newProgress,
      "stats.currentRiskScore": newRiskScore,
      updatedAt: serverTimestamp(),
    });

    // Update user's current risk score in student_data
    await updateUserRiskScore(userId, newRiskScore);

    return {
      ...planData,
      tasks,
      progress: newProgress,
      stats: { ...stats, currentRiskScore: newRiskScore },
    };
  } catch (error) {
    console.error(`Error uncompleting task for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Listen to real-time updates of daily plan
 * @param {String} userId - User ID
 * @param {String} date - Date string (YYYY-MM-DD)
 * @param {Function} callback - Function to call with plan updates
 * @returns {Function} Unsubscribe function
 */
export function watchDailyPlan(userId, date, callback) {
  try {
    const planRef = doc(db, "users", userId, "dailyPlans", date);

    const unsubscribe = onSnapshot(planRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error(`Error watching daily plan for user ${userId}:`, error);
    return () => {};
  }
}

/**
 * Update user's risk score in student_data collection
 * This is called when tasks are completed to reflect improved mental health
 * @param {String} userId - User ID
 * @param {Number} newRiskScore - New risk score
 * @returns {Promise<void>}
 */
async function updateUserRiskScore(userId, newRiskScore) {
  try {
    const studentDataRef = doc(db, "student_data", userId);
    const studentSnap = await getDoc(studentDataRef);

    if (studentSnap.exists()) {
      const currentData = studentSnap.data();
      const riskHistory = currentData.riskHistory || [];

      // Add new entry to risk history
      riskHistory.push({
        score: newRiskScore,
        timestamp: new Date().toISOString(),
        source: "task_completion",
      });

      // Keep only last 30 days of history
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHistory = riskHistory.filter(
        (entry) => new Date(entry.timestamp) > thirtyDaysAgo
      );

      await updateDoc(studentDataRef, {
        currentRiskScore: newRiskScore,
        riskHistory: recentHistory,
        lastRiskUpdate: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error(`Error updating user risk score:`, error);
    // Non-critical error - don't throw
  }
}

/**
 * Get task completion statistics for a user
 * @param {String} userId - User ID
 * @param {Number} days - Number of days to analyze (default 7)
 * @returns {Promise<Object>} Statistics object
 */
export async function getTaskCompletionStats(userId, days = 7) {
  try {
    const today = new Date();
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = today.toISOString().split("T")[0];

    const plans = await getDailyPlansByDateRange(userId, startDateStr, endDateStr);

    const stats = {
      totalDays: plans.length,
      completedDays: 0,
      totalTasks: 0,
      completedTasks: 0,
      averageCompletion: 0,
      riskScoreChange: 0,
    };

    if (plans.length === 0) return stats;

    plans.forEach((plan) => {
      const tasks = plan.tasks || [];
      const completedTasks = tasks.filter((t) => t.completed).length;

      stats.totalTasks += tasks.length;
      stats.completedTasks += completedTasks;

      if (completedTasks === tasks.length && tasks.length > 0) {
        stats.completedDays += 1;
      }
    });

    // Calculate risk score change from first to last plan
    if (plans.length > 1) {
      const firstPlan = plans[0];
      const lastPlan = plans[plans.length - 1];
      const firstScore = firstPlan.stats?.originalRiskScore || firstPlan.basedOn?.totalScore || 0;
      const lastScore = lastPlan.stats?.currentRiskScore || lastPlan.basedOn?.totalScore || 0;
      stats.riskScoreChange = Math.round((firstScore - lastScore) * 10) / 10;
    }

    stats.averageCompletion =
      stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

    return stats;
  } catch (error) {
    console.error(`Error fetching task completion stats:`, error);
    return {};
  }
}
