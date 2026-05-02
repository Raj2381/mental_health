/**
 * Smart Stress Intelligence Engine
 * Generates dynamic insights and AI-powered recommendations based on user stress data
 */

/**
 * Generate dynamic insight based on stress pattern
 * @param {Object} stress - Stress data {academic, sleep, social, emotional}
 * @returns {string} Dynamic insight message
 */
export function generateInsight(stress = {}) {
  if (!stress || Object.values(stress).every(v => v === 0 || v === undefined)) {
    return "You're doing great. No major stress detected 🎉";
  }

  // Find highest stress category
  const entries = Object.entries(stress).filter(([_, v]) => v > 0);
  if (entries.length === 0) {
    return "You're doing great. No major stress detected 🎉";
  }

  const [type, value] = entries.sort((a, b) => b[1] - a[1])[0];

  // Dynamic insights based on stress type and severity
  const insights = {
    academic: {
      low: "You're managing academic pressure well. Keep up the balance.",
      medium: "Academic pressure is building. Consider breaking tasks into smaller steps.",
      high: "Academic stress is significant. Time for strategic planning and breaks.",
    },
    sleep: {
      low: "Your sleep is healthy. Continue your good sleep habits.",
      medium: "Sleep quality could improve. Maintain consistent sleep schedules.",
      high: "Sleep issues are affecting your wellness. Prioritize rest and recovery.",
    },
    social: {
      low: "Your social life feels balanced and positive.",
      medium: "Social dynamics need attention. Reach out to supportive people.",
      high: "Social stress is affecting you deeply. Consider talking to someone.",
    },
    emotional: {
      low: "Your emotional health is stable. Great job managing feelings.",
      medium: "Emotional stress is present. Mindfulness can help you process emotions.",
      high: "Emotional wellness needs attention. Professional support might help.",
    },
  };

  // Determine severity level
  let severity = "low";
  if (value > 60) severity = "high";
  else if (value > 30) severity = "medium";

  return insights[type]?.[severity] || "Maintain balance in all areas of your wellness.";
}

/**
 * Generate AI-powered recommendations
 * @param {Object} stress - Stress data {academic, sleep, social, emotional}
 * @returns {Array<string>} Array of personalized recommendations
 */
export function generateRecommendations(stress = {}) {
  const recommendations = [];
  const threshold = 20; // Minimum stress level to trigger recommendation

  if ((stress.academic || 0) > threshold) {
    recommendations.push({
      emoji: "📚",
      text: "Break study into smaller, focused sessions with regular breaks",
      category: "academic",
    });
    recommendations.push({
      emoji: "⏱️",
      text: "Use the Pomodoro technique (25 min focus, 5 min break)",
      category: "academic",
    });
  }

  if ((stress.sleep || 0) > threshold) {
    recommendations.push({
      emoji: "😴",
      text: "Maintain a consistent sleep schedule (same time daily)",
      category: "sleep",
    });
    recommendations.push({
      emoji: "📱",
      text: "Avoid screens 30 minutes before bedtime",
      category: "sleep",
    });
  }

  if ((stress.social || 0) > threshold) {
    recommendations.push({
      emoji: "👥",
      text: "Connect with supportive friends or community",
      category: "social",
    });
    recommendations.push({
      emoji: "💬",
      text: "Don't hesitate to reach out to a counsellor",
      category: "social",
    });
  }

  if ((stress.emotional || 0) > threshold) {
    recommendations.push({
      emoji: "🧘",
      text: "Practice meditation or deep breathing exercises",
      category: "emotional",
    });
    recommendations.push({
      emoji: "📔",
      text: "Keep a journal to process your emotions",
      category: "emotional",
    });
  }

  // Default positive message if stress is low
  if (recommendations.length === 0) {
    return [
      {
        emoji: "✨",
        text: "You're doing great! Keep maintaining your wellness balance.",
        category: "general",
      },
    ];
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
}

/**
 * Determine stress level color based on value
 * @param {number} value - Stress value (0-100)
 * @returns {string} Color class name
 */
export function getStressColor(value) {
  if (value === 0) return "bg-green-500/20 border-green-500/30 text-green-600";
  if (value < 20) return "bg-green-500/20 border-green-500/30 text-green-600";
  if (value < 40) return "bg-yellow-500/20 border-yellow-500/30 text-yellow-600";
  if (value < 60) return "bg-orange-500/20 border-orange-500/30 text-orange-600";
  return "bg-red-500/20 border-red-500/30 text-red-600";
}

/**
 * Get stress level label
 * @param {number} value - Stress value (0-100)
 * @returns {string} Stress level label
 */
export function getStressLevel(value) {
  if (value === 0) return "None";
  if (value < 25) return "Low";
  if (value < 50) return "Moderate";
  if (value < 75) return "High";
  return "Critical";
}

/**
 * Calculate overall stress score
 * @param {Object} stress - Stress data {academic, sleep, social, emotional}
 * @returns {number} Average stress score (0-100)
 */
export function calculateOverallStress(stress = {}) {
  const values = Object.values(stress).filter(v => typeof v === "number");
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Generate motivational message based on stress trends
 * @param {Object} stress - Current stress data
 * @param {Object} previousStress - Previous stress data (optional)
 * @returns {string} Motivational message
 */
export function generateMotivationalMessage(stress = {}, previousStress = {}) {
  const current = calculateOverallStress(stress);
  const previous = calculateOverallStress(previousStress);

  if (previous > 0 && current < previous) {
    const improvement = Math.round(((previous - current) / previous) * 100);
    return `Great progress! You've reduced stress by ${improvement}%. Keep it up! 💪`;
  }

  if (current === 0) {
    return "You're in excellent mental health! Maintain this balance. 🌟";
  }

  if (current < 30) {
    return "Your wellness is in good shape. Small improvements can help even more. 🌱";
  }

  if (current < 60) {
    return "You have opportunities to improve. Take it one step at a time. 🎯";
  }

  return "Your wellness needs attention. Reach out for support. 🤝";
}
