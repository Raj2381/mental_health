export function generateAlertsForStudent(student = {}, risk = {}) {
  const alerts = [];
  const score = Number(risk?.score ?? student?.assessmentScore ?? 0);
  if (score > 75) {
    alerts.push({
      studentId: student.id,
      studentName: student.fullName || student.name || "Student",
      level: "high",
      title: "High Risk Detected",
      message: `Risk score is ${score}. Prioritize outreach.`,
      color: "#ef4444",
    });
  }
  return alerts;
}

export function generateStudentInsights(student = {}, risk = {}, moodLogs = []) {
  return {
    summary: risk?.explanation || "No detailed risk explanation available.",
    moodEntries: moodLogs.length,
    trend: student?.riskTrend || "stable",
  };
}

export function calculateDashboardStats(students = [], riskScores = {}) {
  let highRisk = 0;
  let moderateRisk = 0;
  let lowRisk = 0;

  students.forEach((student) => {
    const score = Number(riskScores?.[student.id]?.score ?? student?.assessmentScore ?? 0);
    if (score > 75) highRisk += 1;
    else if (score >= 50) moderateRisk += 1;
    else lowRisk += 1;
  });

  return {
    totalStudents: students.length,
    highRisk,
    moderateRisk,
    lowRisk,
  };
}

export function getRiskDistribution(riskScores = {}) {
  const values = Object.values(riskScores);
  let high = 0;
  let moderate = 0;
  let low = 0;

  values.forEach((r) => {
    const score = Number(r?.score ?? 0);
    if (score > 75) high += 1;
    else if (score >= 50) moderate += 1;
    else low += 1;
  });

  return [
    { name: "High", value: high },
    { name: "Moderate", value: moderate },
    { name: "Low", value: low },
  ];
}

export function calculateTrendData(days = 30) {
  const result = [];
  for (let i = Math.max(1, days - 6); i <= days; i += 1) {
    result.push({ day: `Day ${i}`, value: 40 + (i % 5) * 8 });
  }
  return result;
}

export function getSessionStats(sessions = [], scope = "month") {
  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  return {
    scope,
    total,
    completed,
    pending: total - completed,
  };
}
