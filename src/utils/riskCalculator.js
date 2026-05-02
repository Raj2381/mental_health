// ✅ Normalize helper (0–100)
const normalize = (value, max) => (value / max) * 100;

export function calculateRiskScore(answers) {
  if (!answers) return null;

  let totalScore = 0;

  // 🎯 CATEGORY WEIGHTS (balanced mental model)
  const weights = {
    academicStress: 0.25,
    socialConnection: 0.15,
    sleepQuality: 0.20,
    anxietyStress: 0.20,
    emotionalWellbeing: 0.20,
  };

  // 🔁 REVERSE QUESTIONS (positive → reduce risk)
  const reverseQuestions = {
    academicStress: [3],      // time balance
    sleepQuality: [2],        // wake refreshed
    anxietyStress: [3],       // can calm yourself
    socialConnection: [0, 2], // friendships + support
  };

  let crisisFlag = false;
  const categoryScores = {};

  Object.keys(answers).forEach((category) => {
    const section = answers[category];
    if (!section) return;

    let sectionScore = 0;

    section.forEach((value, index) => {
      if (value == null) return;

      let score = value;

      // 🔁 Reverse scoring (important)
      if (reverseQuestions[category]?.includes(index)) {
        score = 5 - value; // flip 1↔4
      }

      // 🚨 CRISIS DETECTION
      if (category === "emotionalWellbeing" && index === 3 && value >= 3) {
        crisisFlag = true;
      }

      sectionScore += score;
    });

    const maxSectionScore = section.length * 4;

    const normalized = normalize(sectionScore, maxSectionScore);

    categoryScores[category] = Math.round(normalized);

    totalScore += normalized * weights[category];
  });

  // ✅ FINAL SCORE (0–100)
  let finalScore = Math.round(totalScore);

  // 🚨 Force high risk if crisis
  if (crisisFlag) {
    finalScore = Math.max(finalScore, 85);
  }

  // 🎯 RISK LEVEL
  let level = "Low";
  let color = "green";

  if (finalScore >= 75) {
    level = "High";
    color = "red";
  } else if (finalScore >= 50) {
    level = "Moderate";
    color = "orange";
  }

  // 🧠 RECOMMENDATIONS (OPTIONAL BUT SMART)
  const recommendations = [];

  if (categoryScores.academicStress > 60) {
    recommendations.push("Reduce academic pressure and take breaks");
  }

  if (categoryScores.sleepQuality > 60) {
    recommendations.push("Improve sleep schedule (7-8 hours)");
  }

  if (categoryScores.socialConnection > 60) {
    recommendations.push("Increase social interaction and support");
  }

  if (categoryScores.anxietyStress > 60) {
    recommendations.push("Practice breathing or mindfulness exercises");
  }

  if (categoryScores.emotionalWellbeing > 70) {
    recommendations.push("Consider talking to a counsellor");
  }

  if (crisisFlag) {
    recommendations.push("⚠️ Immediate counselling is strongly recommended");
  }

  const problemAreas = Object.entries(categoryScores)
    .filter(([, score]) => score > 60)
    .map(([category]) => category);

  return {
    score: finalScore,
    level,
    riskColor: color,
    color,
    categoryScores,
    recommendations,
    problemAreas,
    crisisFlag,
  };
}
