/**
 * Adaptive Daily Progress Firebase Service
 * Handles real-time sync of daily tasks, progress, and score updates
 */

import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  buildAdaptiveChecklist, 
  calculateDailyProgress,
  identifyProblemAreas,
} from '../adaptiveTaskGenerator';
import {
  calculateScoreReductions,
  updateStreakData,
  createScoreSnapshot,
} from '../adaptiveScoreReducer';

/**
 * Initialize or update daily checklist for a user
 * @param {string} userId - User ID
 * @param {object} categoryScores - Latest assessment scores
 * @returns {Promise} Updated checklist data
 */
export async function initializeDailyChecklist(userId, categoryScores = {}) {
  if (!userId) throw new Error('userId is required');

  try {
    const todayKey = new Date().toISOString().split('T')[0];
    const studentRef = doc(db, 'student_data', userId);
    
    // Get existing progress for today
    const existingData = await getDoc(studentRef);
    const existingProgress = existingData.data()?.dailyProgress?.[todayKey] || {};

    // Generate adaptive checklist
    const checklist = buildAdaptiveChecklist(categoryScores, existingProgress);

    // Calculate progress
    const allTasks = [...checklist.base, ...checklist.personalized];
    const completionPercent = calculateDailyProgress(allTasks);

    const dailyChecklistData = {
      date: todayKey,
      categoryScores,
      problemAreas: identifyProblemAreas(categoryScores),
      checklist,
      allTasks,
      completionPercent,
      base: {
        completed: checklist.base.filter(t => t.completed).length,
        total: checklist.base.length,
      },
      personalized: {
        completed: checklist.personalized.filter(t => t.completed).length,
        total: checklist.personalized.length,
      },
      lastUpdated: serverTimestamp(),
      createdAt: existingProgress.createdAt || serverTimestamp(),
    };

    // Update Firebase with nested structure
    await updateDoc(studentRef, {
      [`dailyProgress.${todayKey}`]: dailyChecklistData,
      lastDailyChecklistUpdate: serverTimestamp(),
    });

    return dailyChecklistData;
  } catch (error) {
    console.error('Error initializing daily checklist:', error);
    throw error;
  }
}

/**
 * Mark a task as complete/incomplete
 * @param {string} userId - User ID
 * @param {string} taskId - Task ID
 * @param {boolean} completed - Completion status
 * @returns {Promise} Updated task data
 */
export async function updateTaskCompletion(userId, taskId, completed = true) {
  if (!userId || !taskId) throw new Error('userId and taskId are required');

  try {
    const todayKey = new Date().toISOString().split('T')[0];
    const studentRef = doc(db, 'student_data', userId);

    // Get current data
    const snapshot = await getDoc(studentRef);
    const dailyProgress = snapshot.data()?.dailyProgress?.[todayKey] || {};
    const checklist = dailyProgress.checklist || { base: [], personalized: [] };

    // Update task completion
    const updateChecklist = (tasks) =>
      tasks.map(t => (t.id === taskId ? { ...t, completed } : t));

    checklist.base = updateChecklist(checklist.base);
    checklist.personalized = updateChecklist(checklist.personalized);

    // Recalculate progress
    const allTasks = [...checklist.base, ...checklist.personalized];
    const completionPercent = calculateDailyProgress(allTasks);

    // Get completed task IDs for score reduction
    const completedTaskIds = allTasks
      .filter(t => t.completed && t.personalized)
      .map(t => t.id);

    // Calculate score reductions
    const streakData = snapshot.data()?.streakData || {};
    const { updatedScores, reductions } = calculateScoreReductions(
      completedTaskIds,
      snapshot.data()?.categoryScores || {},
      streakData
    );

    // Update streak
    const newStreakData = updateStreakData(streakData, completionPercent, todayKey);

    // Create score snapshot for tracking
    const scoreSnapshot = createScoreSnapshot(updatedScores, todayKey);

    const updates = {
      [`dailyProgress.${todayKey}`]: {
        ...dailyProgress,
        checklist,
        allTasks,
        completionPercent,
        base: {
          completed: checklist.base.filter(t => t.completed).length,
          total: checklist.base.length,
        },
        personalized: {
          completed: checklist.personalized.filter(t => t.completed).length,
          total: checklist.personalized.length,
        },
        scoreReductions: reductions,
        lastUpdated: serverTimestamp(),
      },
      categoryScores: updatedScores,
      streakData: newStreakData,
      [`scoreHistory.${todayKey}`]: scoreSnapshot,
      lastTaskUpdate: serverTimestamp(),
    };

    await updateDoc(studentRef, updates);

    return {
      taskId,
      completed,
      completionPercent,
      scoreReductions: reductions,
      streakData: newStreakData,
      updatedCategoryScores: updatedScores,
    };
  } catch (error) {
    console.error('Error updating task completion:', error);
    throw error;
  }
}

/**
 * Real-time listener for daily progress
 * @param {string} userId - User ID
 * @param {function} callback - Callback with daily progress data
 * @returns {function} Unsubscribe function
 */
export function watchDailyProgress(userId, callback) {
  if (!userId) {
    console.warn('watchDailyProgress: userId is required');
    return () => {};
  }

  try {
    const todayKey = new Date().toISOString().split('T')[0];
    const studentRef = doc(db, 'student_data', userId);

    const unsubscribe = onSnapshot(
      studentRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const todayProgress = data.dailyProgress?.[todayKey] || {
            date: todayKey,
            completionPercent: 0,
            allTasks: [],
            checklist: { base: [], personalized: [] },
          };

          callback({
            ...todayProgress,
            streakData: data.streakData || {},
            categoryScores: data.categoryScores || {},
          });
        }
      },
      (error) => {
        console.error('watchDailyProgress error:', error);
        callback(null);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('watchDailyProgress setup error:', error);
    return () => {};
  }
}

/**
 * Get score history for trend visualization
 * @param {string} userId - User ID
 * @param {number} days - Number of days to fetch (default 30)
 * @returns {Promise} Array of score snapshots
 */
export async function getScoreHistory(userId, days = 30) {
  if (!userId) throw new Error('userId is required');

  try {
    const snapshot = await getDoc(doc(db, 'student_data', userId));
    const data = snapshot.data();
    const scoreHistory = data?.scoreHistory || {};

    // Filter last N days
    const today = new Date();
    const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

    const history = Object.entries(scoreHistory)
      .filter(([dateKey]) => new Date(dateKey) >= startDate)
      .map(([dateKey, snapshot]) => ({ dateKey, ...snapshot }))
      .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

    return history;
  } catch (error) {
    console.error('Error fetching score history:', error);
    return [];
  }
}

/**
 * Real-time listener for score history and trends
 * @param {string} userId - User ID
 * @param {function} callback - Callback with score history
 * @param {number} days - Days to listen for (default 30)
 * @returns {function} Unsubscribe function
 */
export function watchScoreHistory(userId, callback, days = 30) {
  if (!userId) return () => {};

  try {
    const studentRef = doc(db, 'student_data', userId);

    const unsubscribe = onSnapshot(studentRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const scoreHistory = data.scoreHistory || {};

        const today = new Date();
        const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);

        const history = Object.entries(scoreHistory)
          .filter(([dateKey]) => new Date(dateKey) >= startDate)
          .map(([dateKey, snap]) => ({ dateKey, ...snap }))
          .sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));

        callback(history);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error('watchScoreHistory error:', error);
    return () => {};
  }
}

/**
 * Get counsellor's view of student daily progress
 * @param {string} studentId - Student user ID
 * @returns {Promise} Student's latest daily progress
 */
export async function getCounsellorStudentProgress(studentId) {
  if (!studentId) throw new Error('studentId is required');

  try {
    const snapshot = await getDoc(doc(db, 'student_data', studentId));
    if (!snapshot.exists()) return null;

    const data = snapshot.data();
    const todayKey = new Date().toISOString().split('T')[0];
    const todayProgress = data.dailyProgress?.[todayKey];

    return {
      studentId,
      todayProgress,
      streakData: data.streakData || {},
      categoryScores: data.categoryScores || {},
      lastUpdate: data.lastTaskUpdate,
    };
  } catch (error) {
    console.error('Error fetching student progress for counsellor:', error);
    return null;
  }
}

/**
 * Real-time listener for counsellor - multiple students
 * @param {array} studentIds - Array of student IDs
 * @param {function} callback - Callback with all student progress
 * @returns {array} Array of unsubscribe functions
 */
export function watchCounsellorStudentProgress(studentIds = [], callback) {
  if (!studentIds.length) return [];

  const unsubscribers = studentIds.map(studentId => {
    try {
      const studentRef = doc(db, 'student_data', studentId);
      const todayKey = new Date().toISOString().split('T')[0];

      return onSnapshot(studentRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback({
            studentId,
            todayProgress: data.dailyProgress?.[todayKey],
            streakData: data.streakData,
            completionPercent: data.dailyProgress?.[todayKey]?.completionPercent || 0,
          });
        }
      });
    } catch (error) {
      console.error(`Error watching student ${studentId}:`, error);
      return () => {};
    }
  });

  return unsubscribers;
}

export default {
  initializeDailyChecklist,
  updateTaskCompletion,
  watchDailyProgress,
  getScoreHistory,
  watchScoreHistory,
  getCounsellorStudentProgress,
  watchCounsellorStudentProgress,
};
