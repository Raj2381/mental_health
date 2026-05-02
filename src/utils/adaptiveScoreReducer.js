/**
 * Score Reduction System
 * Updates assessment scores based on daily task completion
 * Rewards consistent progress with streak bonuses
 */

/**
 * Calculate score reduction based on completed tasks
 * @param {array} completedTasks - Array of completed task IDs
 * @param {object} categoryScores - Current category scores
 * @param {object} streakData - Streak information
 * @returns {object} Updated category scores and reduction details
 */
export function calculateScoreReductions(completedTasks = [], categoryScores = {}, streakData = {}) {
  const reductions = {};
  const updatedScores = { ...categoryScores };
  let totalReduction = 0;

  // Group tasks by category
  const tasksByCategory = groupTasksByCategory(completedTasks);

  // Calculate reductions per category
  Object.entries(tasksByCategory).forEach(([category, tasks]) => {
    if (tasks.length === 0) return;

    // Base reduction: 2-5 points per category based on task count
    let categoryReduction = Math.min(tasks.length * 2.5, 10); // Max 10 per category

    // Apply streak bonus (consistency multiplier)
    const streakBonus = calculateStreakBonus(streakData.currentStreak || 0);
    categoryReduction *= (1 + streakBonus);

    // Apply to actual score
    const originalScore = updatedScores[getFullCategoryName(category)] || 0;
    updatedScores[getFullCategoryName(category)] = Math.max(0, originalScore - categoryReduction);

    reductions[category] = {
      originalScore,
      newScore: updatedScores[getFullCategoryName(category)],
      reduction: categoryReduction,
      taskCount: tasks.length,
      streakBonus,
    };

    totalReduction += categoryReduction;
  });

  return {
    updatedScores,
    reductions,
    totalReduction,
    totalDailyReduction: Math.min(totalReduction, 10), // Max total reduction per day
    timestamp: new Date(),
  };
}

/**
 * Group completed tasks by category
 * @param {array} completedTasks - Task IDs
 * @returns {object} Tasks grouped by category
 */
function groupTasksByCategory(completedTasks = []) {
  const grouped = {
    social: [],
    anxiety: [],
    academic: [],
    sleep: [],
    emotional: [],
  };

  completedTasks.forEach(taskId => {
    if (taskId.startsWith('social_')) grouped.social.push(taskId);
    else if (taskId.startsWith('anxiety_')) grouped.anxiety.push(taskId);
    else if (taskId.startsWith('academic_')) grouped.academic.push(taskId);
    else if (taskId.startsWith('sleep_')) grouped.sleep.push(taskId);
    else if (taskId.startsWith('emotional_')) grouped.emotional.push(taskId);
  });

  return grouped;
}

/**
 * Map short category name to full Firestore field name
 * @param {string} category - Short category (social, anxiety, etc)
 * @returns {string} Full field name
 */
function getFullCategoryName(category) {
  const mapping = {
    social: 'socialConnection',
    anxiety: 'anxietyStress',
    academic: 'academicStress',
    sleep: 'sleepQuality',
    emotional: 'emotionalWellbeing',
  };
  return mapping[category] || category;
}

/**
 * Calculate streak bonus multiplier
 * 3+ day streak = 10% bonus reduction
 * 7+ day streak = 20% bonus reduction
 * 14+ day streak = 30% bonus reduction
 * @param {number} currentStreak - Current streak days
 * @returns {number} Bonus multiplier (0.0 - 0.3)
 */
export function calculateStreakBonus(currentStreak = 0) {
  if (currentStreak >= 14) return 0.3; // 30% boost
  if (currentStreak >= 7) return 0.2; // 20% boost
  if (currentStreak >= 3) return 0.1; // 10% boost
  return 0; // No boost
}

/**
 * Update streak data based on daily completion
 * @param {object} streakData - Current streak data
 * @param {number} completionPercent - Today's completion percentage
 * @param {string} today - Today's date key (YYYY-MM-DD)
 * @returns {object} Updated streak data
 */
export function updateStreakData(streakData = {}, completionPercent = 0, today = null) {
  const todayKey = today || new Date().toISOString().split('T')[0];
  const completionThreshold = 60; // 60%+ completes the day

  const currentStreak = streakData.currentStreak || 0;
  const lastActiveDate = streakData.lastActiveDate || null;
  const maxStreak = streakData.maxStreak || 0;

  let newStreak = currentStreak;
  const previousDate = getPreviousDate(lastActiveDate || todayKey);

  // Check if continuing streak
  if (lastActiveDate === previousDate) {
    // Yesterday was active, continue if today is completed
    if (completionPercent >= completionThreshold) {
      newStreak = currentStreak + 1;
    } else {
      newStreak = 0; // Break streak
    }
  } else if (lastActiveDate === todayKey) {
    // Already recorded for today
    if (completionPercent >= completionThreshold) {
      newStreak = Math.max(1, currentStreak);
    } else {
      newStreak = 0;
    }
  } else {
    // Starting fresh or gap
    newStreak = completionPercent >= completionThreshold ? 1 : 0;
  }

  const newMaxStreak = Math.max(maxStreak, newStreak);

  return {
    currentStreak: newStreak,
    lastActiveDate: completionPercent >= completionThreshold ? todayKey : lastActiveDate,
    maxStreak: newMaxStreak,
    streakBrokenCount: streakData.streakBrokenCount || 0,
    totalActiveDay: (streakData.totalActiveDays || 0) + (completionPercent >= completionThreshold ? 1 : 0),
  };
}

/**
 * Get previous date key
 * @param {string} dateKey - Date in YYYY-MM-DD format
 * @returns {string} Previous date in YYYY-MM-DD format
 */
function getPreviousDate(dateKey) {
  const date = new Date(dateKey);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Get streak milestone rewards
 * @param {number} currentStreak - Current streak days
 * @returns {object} Milestone info
 */
export function getStreakMilestone(currentStreak = 0) {
  const milestones = [
    { days: 3, title: '3-Day Streak! 🔥', reward: '3 points', badge: 'streak_3' },
    { days: 7, title: 'Week Warrior! 💪', reward: '7 points', badge: 'streak_7' },
    { days: 14, title: 'Two Weeks Strong! 🚀', reward: '14 points', badge: 'streak_14' },
    { days: 30, title: 'Month Master! 👑', reward: '30 points', badge: 'streak_30' },
  ];

  return milestones
    .filter(m => currentStreak >= m.days)
    .sort((a, b) => b.days - a.days)
    .slice(0, 1)[0] || null;
}

/**
 * Calculate daily score snapshot for tracking
 * @param {object} categoryScores - Current scores
 * @param {string} date - Date key
 * @returns {object} Score snapshot
 */
export function createScoreSnapshot(categoryScores = {}, date = null) {
  const dateKey = date || new Date().toISOString().split('T')[0];
  
  return {
    date: dateKey,
    scores: {
      academicStress: categoryScores.academicStress || 0,
      socialConnection: categoryScores.socialConnection || 0,
      sleepQuality: categoryScores.sleepQuality || 0,
      anxietyStress: categoryScores.anxietyStress || 0,
      emotionalWellbeing: categoryScores.emotionalWellbeing || 0,
    },
    average: calculateAverageScore(categoryScores),
    timestamp: new Date().getTime(),
  };
}

/**
 * Calculate average of all category scores
 * @param {object} categoryScores - Category scores
 * @returns {number} Average score
 */
export function calculateAverageScore(categoryScores = {}) {
  const scores = Object.values(categoryScores).filter(s => typeof s === 'number');
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * Compare two score snapshots for progress
 * @param {object} oldSnapshot - Previous score snapshot
 * @param {object} newSnapshot - Current score snapshot
 * @returns {object} Progress analysis
 */
export function analyzeScoreProgress(oldSnapshot = {}, newSnapshot = {}) {
  const oldAverage = oldSnapshot.average || 0;
  const newAverage = newSnapshot.average || 0;
  const improvement = oldAverage - newAverage;
  const improvementPercent = oldAverage > 0 ? Math.round((improvement / oldAverage) * 100) : 0;

  // Category-by-category comparison
  const categoryProgress = {};
  Object.keys(newSnapshot.scores || {}).forEach(category => {
    const oldScore = oldSnapshot.scores?.[category] || 0;
    const newScore = newSnapshot.scores?.[category] || 0;
    categoryProgress[category] = {
      oldScore,
      newScore,
      change: oldScore - newScore,
      improved: newScore < oldScore,
    };
  });

  return {
    overallImprovement: improvement,
    improvementPercent,
    averageOld: oldAverage,
    averageNew: newAverage,
    categoryProgress,
    trend: improvement > 0 ? 'positive' : improvement < 0 ? 'negative' : 'stable',
  };
}

export default {
  calculateScoreReductions,
  calculateStreakBonus,
  updateStreakData,
  getStreakMilestone,
  createScoreSnapshot,
  calculateAverageScore,
  analyzeScoreProgress,
};
