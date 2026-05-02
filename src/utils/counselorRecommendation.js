export function getCounselorRecommendation(studentData = {}) {
  const score = Number(studentData?.assessmentScore ?? 0);
  if (score > 75) return "High-priority follow-up within 24 hours.";
  if (score >= 50) return "Weekly monitoring and guided interventions.";
  return "Maintain routine support and monthly check-ins.";
}
