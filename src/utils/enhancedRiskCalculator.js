/**
 * Enhanced Risk Score Calculator with weighted metrics
 * Provides detailed analysis and trend tracking
 */

export function calculateEnhancedRiskScore(studentData) {
  // Weighted scoring (30-40% each category)
  const weights = {
    academicStress: 0.30,
    attendance: 0.20,
    sleepRoutine: 0.20,
    emotionalState: 0.30,
  };

  let totalScore = 0;

  // 1. Academic Stress (0-100)
  const academicStress = calculateAcademicStress(studentData);
  totalScore += academicStress * weights.academicStress;

  // 2. Attendance (0-100, inverted - lower attendance = higher risk)
  const attendanceRisk = studentData.attendance ? Math.max(0, 100 - studentData.attendance) : 50;
  totalScore += attendanceRisk * weights.attendance;

  // 3. Sleep & Routine (0-100)
  const sleepRisk = calculateSleepRisk(studentData);
  totalScore += sleepRisk * weights.sleepRoutine;

  // 4. Emotional State (0-100)
  const emotionalRisk = calculateEmotionalRisk(studentData);
  totalScore += emotionalRisk * weights.emotionalState;

  // Categorize risk level
  let riskLevel = "Low";
  let riskColor = "green";
  let severity = "Safe";

  if (totalScore < 30) {
    riskLevel = "Low";
    riskColor = "green";
    severity = "You're doing well!";
  } else if (totalScore < 60) {
    riskLevel = "Moderate";
    riskColor = "yellow";
    severity = "Monitor your wellbeing";
  } else if (totalScore < 80) {
    riskLevel = "High";
    riskColor = "orange";
    severity = "Consider seeking support";
  } else {
    riskLevel = "Critical";
    riskColor = "red";
    severity = "Immediate support recommended";
  }

  // Calculate trend
  const trend = studentData.previousScore
    ? totalScore > studentData.previousScore
      ? "worsening"
      : totalScore < studentData.previousScore
      ? "improving"
      : "stable"
    : "stable";

  // Generate explanation
  const explanation = generateRiskExplanation(
    academicStress,
    attendanceRisk,
    sleepRisk,
    emotionalRisk
  );

  return {
    score: Math.round(totalScore),
    level: riskLevel,
    color: riskColor,
    severity,
    trend,
    explanation,
    breakdown: {
      academicStress: Math.round(academicStress),
      attendance: Math.round(attendanceRisk),
      sleep: Math.round(sleepRisk),
      emotional: Math.round(emotionalRisk),
    },
  };
}

function calculateAcademicStress(data) {
  // Factors: GPA, workload, deadlines, grades
  let stress = 50; // baseline

  if (data.gpa) {
    if (data.gpa < 2.0) stress += 30;
    else if (data.gpa < 3.0) stress += 15;
    else if (data.gpa >= 3.8) stress += 10; // perfectionism stress
  }

  if (data.assignmentsDue) stress += data.assignmentsDue * 5;
  if (data.upcomingExams) stress += 25;

  return Math.min(100, stress);
}

function calculateSleepRisk(data) {
  let risk = 50; // baseline

  if (data.sleepHours) {
    if (data.sleepHours < 6) risk += 30;
    else if (data.sleepHours < 7) risk += 15;
    else if (data.sleepHours > 9) risk += 10; // oversleeping can indicate depression
  }

  if (data.sleepQuality === "Poor") risk += 25;
  else if (data.sleepQuality === "Fair") risk += 15;

  if (data.morningRoutineRegular === false) risk += 10;

  return Math.min(100, risk);
}

function calculateEmotionalRisk(data) {
  let risk = 0;

  // Mental state assessment
  if (data.mentalState === "Struggling") risk += 40;
  else if (data.mentalState === "Sometimes stressed") risk += 20;
  else if (data.mentalState === "Doing well") risk += 5;

  // Medication & therapy
  if (data.onMedication) risk += 15;
  if (data.inTherapy) risk -= 10;

  // Social indicators
  if (data.socialConnection === "Isolated") risk += 25;
  else if (data.socialConnection === "Limited") risk += 15;
  else if (data.socialConnection === "Strong") risk -= 10;

  return Math.max(0, Math.min(100, risk));
}

function generateRiskExplanation(academic, attendance, sleep, emotional) {
  const factors = [];

  if (academic > 60) factors.push("high academic pressure");
  if (attendance > 40) factors.push("low attendance");
  if (sleep > 60) factors.push("irregular sleep routine");
  if (emotional > 60) factors.push("emotional stress");

  if (factors.length === 0) {
    return "All wellness indicators are positive. Keep up the good work!";
  }

  if (factors.length === 1) {
    return `Your primary concern is ${factors[0]}. Let's address this together.`;
  }

  return `Your stress is elevated due to ${factors.slice(0, -1).join(", ")} and ${factors[factors.length - 1]}.`;
}

export function getRiskTrendIndicator(trend) {
  if (trend === "improving") {
    return { emoji: "up", text: "Improving", color: "green" };
  } else if (trend === "worsening") {
    return { emoji: "down", text: "Worsening", color: "red" };
  }
  return { emoji: "flat", text: "Stable", color: "blue" };
}
