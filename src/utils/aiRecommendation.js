export function getAIRecommendations(studentData = {}) {
  const tips = [];
  if ((studentData?.assessmentScore ?? 0) > 75) tips.push("Schedule an urgent counselling session.");
  if ((studentData?.categoryScores?.sleepQuality ?? 0) > 60) tips.push("Prioritize a fixed sleep routine.");
  if (tips.length === 0) tips.push("Continue regular check-ins and monitor wellbeing.");
  return tips;
}
