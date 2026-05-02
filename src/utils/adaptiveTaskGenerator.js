/**
 * Adaptive Task Generator
 * Generates personalized daily tasks based on assessment risk scores
 */

export const TASK_TEMPLATES = {
  social: [
    { id: 'social_1', text: 'Talk to at least 1 friend today', duration: '15 min', impact: 3 },
    { id: 'social_2', text: 'Join a group activity or class discussion', duration: '30 min', impact: 4 },
    { id: 'social_3', text: 'Avoid isolation for more than 3 hours', duration: 'All day', impact: 3 },
    { id: 'social_4', text: 'Message someone you trust', duration: '10 min', impact: 2 },
    { id: 'social_5', text: 'Attend a social gathering or club meeting', duration: '45 min', impact: 4 },
  ],
  anxiety: [
    { id: 'anxiety_1', text: 'Practice 5 min breathing exercise', duration: '5 min', impact: 2 },
    { id: 'anxiety_2', text: 'Write your thoughts in journal', duration: '15 min', impact: 3 },
    { id: 'anxiety_3', text: 'Avoid overthinking triggers', duration: 'All day', impact: 2 },
    { id: 'anxiety_4', text: 'Take short breaks every hour', duration: '5 min/hour', impact: 2 },
    { id: 'anxiety_5', text: 'Practice grounding technique (5-4-3-2-1)', duration: '5 min', impact: 3 },
  ],
  academic: [
    { id: 'academic_1', text: 'Complete 1 focused study session (25 min)', duration: '25 min', impact: 3 },
    { id: 'academic_2', text: 'Plan your tasks for tomorrow', duration: '10 min', impact: 2 },
    { id: 'academic_3', text: 'Avoid multitasking', duration: 'All day', impact: 2 },
    { id: 'academic_4', text: 'Break tasks into small steps', duration: '10 min', impact: 3 },
    { id: 'academic_5', text: 'Review one subject for 20 minutes', duration: '20 min', impact: 2 },
  ],
  sleep: [
    { id: 'sleep_1', text: 'Sleep before 12 AM', duration: 'Evening', impact: 4 },
    { id: 'sleep_2', text: 'Avoid phone 30 min before sleep', duration: '30 min', impact: 3 },
    { id: 'sleep_3', text: 'Maintain fixed sleep schedule', duration: 'All day', impact: 3 },
    { id: 'sleep_4', text: 'Do light stretching before bed', duration: '10 min', impact: 2 },
    { id: 'sleep_5', text: 'Avoid caffeine after 3 PM', duration: 'All day', impact: 2 },
  ],
  emotional: [
    { id: 'emotional_1', text: 'Talk to someone you trust', duration: '15 min', impact: 4 },
    { id: 'emotional_2', text: 'Do something you enjoy', duration: '30 min', impact: 3 },
    { id: 'emotional_3', text: 'Avoid negative self-talk', duration: 'All day', impact: 2 },
    { id: 'emotional_4', text: 'Practice gratitude - list 3 things', duration: '5 min', impact: 3 },
    { id: 'emotional_5', text: 'Watch something that makes you happy', duration: '20 min', impact: 2 },
  ],
};

export const BASE_HABITS = [
  { id: 'base_1', text: 'Daily Check-in', icon: '✓', category: 'wellness' },
  { id: 'base_2', text: 'Attended Class', icon: '📚', category: 'wellness' },
  { id: 'base_3', text: 'Followed Timetable', icon: '📅', category: 'wellness' },
  { id: 'base_4', text: 'Completed Tasks', icon: '✅', category: 'wellness' },
  { id: 'base_5', text: 'Exercised', icon: '💪', category: 'wellness' },
  { id: 'base_6', text: 'Meditated/Yoga', icon: '🧘', category: 'wellness' },
  { id: 'base_7', text: 'Socialized Healthily', icon: '👥', category: 'wellness' },
  { id: 'base_8', text: 'Studied Extra Hours', icon: '📖', category: 'wellness' },
];

/**
 * Identify top problem categories from assessment scores
 * @param {object} categoryScores - { academicStress, socialConnection, sleepQuality, anxietyStress, emotionalWellbeing }
 * @returns {array} Array of top 2-3 problem categories sorted by severity
 */
export function identifyProblemAreas(categoryScores = {}) {
  const scoreMapping = [
    { category: 'academic', score: categoryScores.academicStress || 0 },
    { category: 'social', score: categoryScores.socialConnection || 0 },
    { category: 'sleep', score: categoryScores.sleepQuality || 0 },
    { category: 'anxiety', score: categoryScores.anxietyStress || 0 },
    { category: 'emotional', score: categoryScores.emotionalWellbeing || 0 },
  ];

  return scoreMapping
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => ({
      category: item.category,
      score: item.score,
      severity: getSeverity(item.score),
    }));
}

/**
 * Determine severity level based on score
 * @param {number} score - Risk score 0-100
 * @returns {string} Severity level
 */
function getSeverity(score) {
  if (score <= 30) return 'low';
  if (score <= 55) return 'moderate';
  if (score <= 75) return 'high';
  return 'critical';
}

/**
 * Generate personalized daily tasks for a student
 * @param {object} categoryScores - Assessment category scores
 * @param {number} taskCount - Number of personalized tasks (default 3-5)
 * @returns {array} Array of personalized tasks
 */
export function generatePersonalizedTasks(categoryScores = {}, taskCount = 4) {
  const problemAreas = identifyProblemAreas(categoryScores);
  const personalizedTasks = [];

  // Select tasks from top problem areas
  problemAreas.forEach(({ category, severity }) => {
    const templates = TASK_TEMPLATES[category] || [];
    
    // Pick 1-2 tasks per problem area based on severity
    const tasksPerArea = severity === 'critical' ? 2 : 1;
    const selectedTasks = selectRandomItems(templates, tasksPerArea);
    
    personalizedTasks.push(...selectedTasks);
  });

  // Shuffle and limit to requested count
  return shuffle(personalizedTasks).slice(0, taskCount);
}

/**
 * Combine base habits with personalized tasks
 * @param {object} categoryScores - Assessment category scores
 * @param {object} existingProgress - Existing daily progress data
 * @returns {array} Complete daily checklist
 */
export function buildAdaptiveChecklist(categoryScores = {}, existingProgress = {}) {
  const personalizedTasks = generatePersonalizedTasks(categoryScores, 4);
  
  const checklist = {
    base: BASE_HABITS.map(habit => ({
      ...habit,
      completed: existingProgress[habit.id] || false,
      personalized: false,
    })),
    personalized: personalizedTasks.map(task => ({
      ...task,
      completed: existingProgress[task.id] || false,
      personalized: true,
      category: identifyTaskCategory(task.id),
      impact: task.impact || 0,
    })),
  };

  return checklist;
}

/**
 * Identify which category a task belongs to
 * @param {string} taskId - Task ID
 * @returns {string} Category name
 */
export function identifyTaskCategory(taskId) {
  if (taskId.startsWith('social_')) return 'social';
  if (taskId.startsWith('anxiety_')) return 'anxiety';
  if (taskId.startsWith('academic_')) return 'academic';
  if (taskId.startsWith('sleep_')) return 'sleep';
  if (taskId.startsWith('emotional_')) return 'emotional';
  return 'wellness';
}

/**
 * Calculate daily progress percentage
 * @param {array} tasks - All tasks in checklist
 * @returns {number} Completion percentage (0-100)
 */
export function calculateDailyProgress(tasks = []) {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Get feedback message based on completion percentage
 * @param {number} completionPercent - Completion percentage
 * @returns {object} Feedback object with message and emoji
 */
export function getDailyFeedback(completionPercent = 0) {
  if (completionPercent >= 100) {
    return { message: 'Perfect! You completed everything today! 🎉', type: 'success' };
  }
  if (completionPercent >= 80) {
    return { message: 'Great progress! Keep it up 🚀', type: 'success' };
  }
  if (completionPercent >= 60) {
    return { message: 'Good start! Try to complete more tasks 💪', type: 'info' };
  }
  if (completionPercent >= 40) {
    return { message: 'You need to stay consistent ⚠️', type: 'warning' };
  }
  if (completionPercent > 0) {
    return { message: 'Just getting started, keep going 🌱', type: 'info' };
  }
  return { message: 'Start your day with a task! 👋', type: 'neutral' };
}

/**
 * Utility: Select random items from array
 */
function selectRandomItems(array, count) {
  return array.sort(() => Math.random() - 0.5).slice(0, count);
}

/**
 * Utility: Shuffle array
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default {
  TASK_TEMPLATES,
  BASE_HABITS,
  identifyProblemAreas,
  generatePersonalizedTasks,
  buildAdaptiveChecklist,
  identifyTaskCategory,
  calculateDailyProgress,
  getDailyFeedback,
};
