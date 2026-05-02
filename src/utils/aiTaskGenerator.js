/**
 * AI-Powered Dynamic Task Generator
 * Generates personalized daily tasks based on assessment risk scores and reasons
 */

/**
 * Task generation rules mapping categories to specific tasks
 */
const TASK_TEMPLATES = {
  academic: {
    "Too many assignments": [
      { title: "Break assignments into 25-min study sprints", impact: "Reduce overwhelm", reason: "Too many assignments" },
      { title: "Complete 1 high-priority assignment today", impact: "Build momentum", reason: "Too many assignments" },
    ],
    "Time management": [
      { title: "Create a 3-task priority list for today", impact: "Stay organized", reason: "Time management issues" },
      { title: "Study for 2 focused hours (no distractions)", impact: "Improve focus", reason: "Time management issues" },
    ],
    "Concentration issues": [
      { title: "Study in a quiet, dedicated space", impact: "Enhance focus", reason: "Concentration issues" },
      { title: "Take 5-min breaks every 25 minutes (Pomodoro)", impact: "Maintain focus", reason: "Concentration issues" },
    ],
    "Performance pressure": [
      { title: "Review 1 topic you know well for confidence", impact: "Build confidence", reason: "Performance pressure" },
      { title: "Talk to a teacher about academic goals", impact: "Reduce anxiety", reason: "Performance pressure" },
    ],
    default: [
      { title: "Attend all classes today", impact: "Build consistency", reason: "Academic performance" },
      { title: "Complete today's homework on time", impact: "Stay on track", reason: "Academic performance" },
      { title: "Review today's lessons for 30 minutes", impact: "Reinforce learning", reason: "Academic performance" },
    ],
  },

  social: {
    "Loneliness": [
      { title: "Text or call 1 friend for 10 minutes", impact: "Combat isolation", reason: "Feeling lonely" },
      { title: "Sit with someone during lunch/break", impact: "Build connection", reason: "Feeling lonely" },
    ],
    "Social anxiety": [
      { title: "Greet 3 people at school/college", impact: "Build confidence", reason: "Social anxiety" },
      { title: "Ask someone a question in class", impact: "Practice speaking", reason: "Social anxiety" },
    ],
    "Difficulty making friends": [
      { title: "Join 1 club or group activity", impact: "Find your community", reason: "Difficulty making friends" },
      { title: "Compliment someone genuinely", impact: "Build connections", reason: "Difficulty making friends" },
    ],
    "Feeling excluded": [
      { title: "Initiate a conversation with a classmate", impact: "Feel included", reason: "Feeling excluded" },
      { title: "Invite someone to join an activity", impact: "Build belonging", reason: "Feeling excluded" },
    ],
    default: [
      { title: "Interact with at least 1 friend today", impact: "Strengthen bonds", reason: "Social wellbeing" },
      { title: "Join a group discussion or class activity", impact: "Build connection", reason: "Social wellbeing" },
      { title: "Have a meaningful conversation", impact: "Feel connected", reason: "Social wellbeing" },
    ],
  },

  sleep: {
    "Insomnia": [
      { title: "No screens 30 minutes before bed", impact: "Improve sleep onset", reason: "Insomnia" },
      { title: "Practice a 5-minute wind-down routine", impact: "Prepare mind for sleep", reason: "Insomnia" },
    ],
    "Late nights": [
      { title: "Sleep before 11:30 PM tonight", impact: "Get adequate rest", reason: "Late night habits" },
      { title: "Set a phone alarm for 11 PM (bedtime reminder)", impact: "Build sleep routine", reason: "Late night habits" },
    ],
    "Not enough sleep": [
      { title: "Sleep for 7-8 hours tonight", impact: "Restore energy", reason: "Insufficient sleep" },
      { title: "Avoid caffeine after 4 PM", impact: "Improve sleep quality", reason: "Insufficient sleep" },
    ],
    "Irregular sleep": [
      { title: "Go to bed at same time as yesterday", impact: "Build routine", reason: "Irregular sleep" },
      { title: "Wake up at your target time tomorrow", impact: "Regulate schedule", reason: "Irregular sleep" },
    ],
    default: [
      { title: "Sleep before 11 PM", impact: "Maintain health", reason: "Sleep hygiene" },
      { title: "Avoid screens before bedtime", impact: "Improve sleep quality", reason: "Sleep hygiene" },
      { title: "Get 7-8 hours of sleep", impact: "Restore energy", reason: "Sleep hygiene" },
    ],
  },

  anxiety: {
    "Panic attacks": [
      { title: "Practice 5-minute deep breathing (4-7-8 technique)", impact: "Calm nervous system", reason: "Panic attacks" },
      { title: "Keep a comfort object with you today", impact: "Feel grounded", reason: "Panic attacks" },
    ],
    "Excessive worry": [
      { title: "Write down your worries, then release them", impact: "Clear your mind", reason: "Excessive worry" },
      { title: "Challenge 1 negative thought with evidence", impact: "Reframe worry", reason: "Excessive worry" },
    ],
    "Physical tension": [
      { title: "Do a 10-minute body scan meditation", impact: "Release tension", reason: "Physical tension" },
      { title: "Stretch for 5 minutes", impact: "Reduce stiffness", reason: "Physical tension" },
    ],
    "Racing thoughts": [
      { title: "Write a journal entry for 10 minutes", impact: "Organize thoughts", reason: "Racing thoughts" },
      { title: "Practice mindfulness for 5 minutes", impact: "Slow down mind", reason: "Racing thoughts" },
    ],
    default: [
      { title: "Practice 5-minute deep breathing", impact: "Reduce stress", reason: "Anxiety management" },
      { title: "Do one relaxing activity you enjoy", impact: "Calm mind", reason: "Anxiety management" },
      { title: "Write down your feelings in a journal", impact: "Process emotions", reason: "Anxiety management" },
    ],
  },

  emotional: {
    "Sadness": [
      { title: "Do one activity that brings you joy", impact: "Lift mood", reason: "Feeling sad" },
      { title: "Spend time with someone you care about", impact: "Feel supported", reason: "Feeling sad" },
    ],
    "Frustration": [
      { title: "Take a 15-minute walk to cool off", impact: "Clear your head", reason: "Feeling frustrated" },
      { title: "Do something physical (exercise, sports)", impact: "Release anger", reason: "Feeling frustrated" },
    ],
    "Loneliness": [
      { title: "Call or visit someone you trust", impact: "Feel connected", reason: "Feeling lonely" },
      { title: "Join a group activity or gathering", impact: "Combat isolation", reason: "Feeling lonely" },
    ],
    "Self-doubt": [
      { title: "Write 3 things you're good at", impact: "Boost confidence", reason: "Self-doubt" },
      { title: "Do something you're confident about", impact: "Prove yourself capable", reason: "Self-doubt" },
    ],
    default: [
      { title: "Do one activity you genuinely enjoy", impact: "Improve wellbeing", reason: "Emotional health" },
      { title: "Talk to someone you trust", impact: "Feel heard", reason: "Emotional health" },
      { title: "Practice self-compassion for 5 minutes", impact: "Be kind to yourself", reason: "Emotional health" },
    ],
  },
};

/**
 * Generate personalized tasks based on assessment data
 * @param {Object} assessmentData - { totalScore, categories: { academic, social, sleep, anxiety, emotional } }
 * @returns {Array} Array of personalized task objects
 */
export function generatePersonalizedTasks(assessmentData) {
  if (!assessmentData || !assessmentData.categories) {
    return getDefaultTasks();
  }

  const { categories } = assessmentData;
  let tasks = [];
  const taskSet = new Set(); // Prevent duplicate tasks

  // Identify critical categories (score >= 60)
  const criticalCategories = Object.entries(categories)
    .filter(([_, categoryData]) => categoryData && categoryData.score >= 60)
    .sort((a, b) => b[1].score - a[1].score);

  // Generate tasks for each critical category
  criticalCategories.forEach(([categoryKey, categoryData]) => {
    const tasksForCategory = generateTasksForCategory(
      categoryKey,
      categoryData,
      taskSet
    );
    tasks = tasks.concat(tasksForCategory);
  });

  // If no critical categories, add default wellness tasks
  if (tasks.length === 0) {
    tasks = getDefaultTasks();
  }

  // Limit to 8 tasks maximum
  return tasks.slice(0, 8);
}

/**
 * Generate tasks for a specific category
 * @param {String} categoryKey - Category name (academic, social, sleep, anxiety, emotional)
 * @param {Object} categoryData - { score, reasons: [] }
 * @param {Set} taskSet - Set to track used tasks and prevent duplicates
 * @returns {Array} Array of task objects for this category
 */
function generateTasksForCategory(categoryKey, categoryData, taskSet) {
  const tasks = [];
  const templates = TASK_TEMPLATES[categoryKey] || {};

  // Priority 1: Tasks based on specific reasons given by student
  if (categoryData.reasons && Array.isArray(categoryData.reasons)) {
    categoryData.reasons.forEach((reason) => {
      const reasonTasks = templates[reason] || [];
      reasonTasks.forEach((task) => {
        if (!taskSet.has(task.title)) {
          tasks.push(task);
          taskSet.add(task.title);
        }
      });
    });
  }

  // Priority 2: If high score but no specific reasons, use default tasks
  if (tasks.length === 0 && categoryData.score >= 75) {
    const defaultTasks = templates.default || [];
    defaultTasks.forEach((task) => {
      if (!taskSet.has(task.title)) {
        tasks.push(task);
        taskSet.add(task.title);
      }
    });
  }

  return tasks;
}

/**
 * Get default wellness tasks for low-risk students
 * @returns {Array} Array of default tasks
 */
function getDefaultTasks() {
  return [
    { title: "Attend all classes today", impact: "Stay consistent", reason: "Daily wellness" },
    { title: "Interact with at least 1 friend", impact: "Strengthen bonds", reason: "Daily wellness" },
    { title: "Sleep 7-8 hours tonight", impact: "Restore energy", reason: "Daily wellness" },
    { title: "Practice 5 minutes of mindfulness", impact: "Calm mind", reason: "Daily wellness" },
    { title: "Do one activity you enjoy", impact: "Improve mood", reason: "Daily wellness" },
  ];
}

/**
 * Calculate risk reduction based on completed tasks
 * @param {Number} originalScore - Original risk score (0-100)
 * @param {Number} completedTasks - Number of completed tasks
 * @param {Number} totalTasks - Total tasks for the day
 * @returns {Number} New risk score after task completion
 */
export function calculateReducedRiskScore(originalScore, completedTasks, totalTasks) {
  if (totalTasks === 0) return originalScore;

  // Each task reduces risk by 0.5 per task
  // Maximum reduction: (completedTasks * 0.5)
  const reductionPercentage = (completedTasks / totalTasks) * 100;
  const maxReduction = completedTasks * 0.5;
  const actualReduction = Math.min(maxReduction, (reductionPercentage / 100) * originalScore);

  return Math.max(0, Math.round((originalScore - actualReduction) * 10) / 10);
}

/**
 * Get task category color/gradient for UI display
 * @param {String} reason - Task reason/motivation
 * @returns {Object} { icon, color, gradient }
 */
export function getTaskCategoryMetadata(reason) {
  const reasonMap = {
    // Academic
    "Too many assignments": { icon: "📚", color: "indigo", gradient: "from-indigo-500 to-violet-500" },
    "Time management issues": { icon: "⏱️", color: "amber", gradient: "from-amber-500 to-orange-400" },
    "Concentration issues": { icon: "🎯", color: "blue", gradient: "from-blue-500 to-cyan-400" },
    "Performance pressure": { icon: "🏆", color: "orange", gradient: "from-orange-500 to-red-400" },

    // Social
    "Feeling lonely": { icon: "💔", color: "rose", gradient: "from-rose-500 to-orange-400" },
    "Social anxiety": { icon: "😰", color: "pink", gradient: "from-pink-500 to-rose-400" },
    "Difficulty making friends": { icon: "👥", color: "purple", gradient: "from-purple-500 to-indigo-400" },
    "Feeling excluded": { icon: "🚫", color: "red", gradient: "from-red-500 to-orange-400" },

    // Sleep
    "Insomnia": { icon: "😴", color: "cyan", gradient: "from-cyan-500 to-blue-400" },
    "Late night habits": { icon: "🌙", color: "slate", gradient: "from-slate-600 to-slate-400" },
    "Insufficient sleep": { icon: "😩", color: "gray", gradient: "from-gray-600 to-slate-500" },
    "Irregular sleep": { icon: "⏰", color: "teal", gradient: "from-teal-500 to-emerald-400" },

    // Anxiety
    "Panic attacks": { icon: "🔥", color: "red", gradient: "from-red-500 to-orange-400" },
    "Excessive worry": { icon: "😟", color: "orange", gradient: "from-orange-500 to-amber-400" },
    "Physical tension": { icon: "🤐", color: "yellow", gradient: "from-yellow-500 to-orange-400" },
    "Racing thoughts": { icon: "⚡", color: "yellow", gradient: "from-yellow-500 to-amber-400" },

    // Emotional
    "Feeling sad": { icon: "😢", color: "blue", gradient: "from-blue-600 to-cyan-500" },
    "Feeling frustrated": { icon: "😤", color: "red", gradient: "from-red-500 to-orange-400" },
    "Self-doubt": { icon: "❓", color: "gray", gradient: "from-gray-500 to-slate-400" },

    // Default
    default: { icon: "✨", color: "green", gradient: "from-green-500 to-emerald-400" },
  };

  return reasonMap[reason] || reasonMap.default;
}

/**
 * Format task data for Firebase storage
 * @param {Array} tasks - Generated tasks
 * @param {String} userId - User ID
 * @param {String} date - Date string (YYYY-MM-DD)
 * @param {Object} assessmentData - Original assessment data
 * @returns {Object} Formatted daily plan object
 */
export function formatDailyPlanForFirebase(tasks, userId, date, assessmentData) {
  return {
    userId,
    date,
    dateCreated: new Date().toISOString(),
    tasks: tasks.map((task) => ({
      ...task,
      completed: false,
      completedAt: null,
    })),
    basedOn: {
      totalScore: assessmentData.totalScore,
      riskLevel: assessmentData.riskLevel,
      categories: assessmentData.categories,
    },
    progress: {
      completed: 0,
      total: tasks.length,
      percentage: 0,
    },
    stats: {
      originalRiskScore: assessmentData.totalScore,
      currentRiskScore: assessmentData.totalScore,
      potentialReduction: tasks.length * 0.5,
    },
  };
}

/**
 * Validate assessment data structure
 * @param {Object} assessmentData - Assessment data to validate
 * @returns {Boolean} True if valid
 */
export function isValidAssessmentData(assessmentData) {
  return (
    assessmentData &&
    typeof assessmentData.totalScore === "number" &&
    assessmentData.categories &&
    typeof assessmentData.categories === "object"
  );
}
