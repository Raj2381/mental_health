// Risk Scoring Engine: Calculates adaptive risk scores with category breakdown

import {
  categoryWeights,
  impactScores,
  durationScores,
  ASSESSMENT_QUESTIONS,
  getRiskLevel,
  isWorstAnswer,
  getQuestionById,
} from "./assessmentConfig";

export function calculateTotalRiskScore(answers, subAnswers = {}) {
  try {
    // Map answers and subAnswers by question ID
    const categoryScores = {};
    const sections = ["academicStress", "socialConnection", "sleepQuality", "anxietyStress", "emotionalWellbeing"];
    
    let totalWeightedScore = 0;
    let totalWeight = 0;

    sections.forEach(section => {
      let sectionScore = 0;
      let sectionQuestionCount = 0;

      ASSESSMENT_QUESTIONS.forEach(q => {
        if (q.section === section) {
          sectionQuestionCount++;
          const answerText = answers[q.id];
          
          if (answerText) {
            // Base score: position in options array (0-4 = worst to best)
            const optionIndex = q.options.indexOf(answerText);
            const baseScore = (optionIndex + 1) * 20; // 20-100 scale
            
            let questionScore = baseScore;

            // Worst answer penalty
            if (isWorstAnswer(q.id, answerText)) {
              questionScore += 15; // Additional penalty
              
              // Sub-question impact bonus
              const sub = subAnswers[q.id];
              if (sub?.impact) {
                const impactBonus = impactScores[sub.impact] || 0;
                questionScore += impactBonus * 10;
              }
              
              // Duration bonus
              if (sub?.duration) {
                const durationBonus = durationScores[sub.duration] || 0;
                questionScore += durationBonus * 5;
              }
            }

            sectionScore += Math.min(questionScore, 100);
          }
        }
      });

      // Average for section
      const avgScore = sectionQuestionCount > 0 ? sectionScore / sectionQuestionCount : 0;
      categoryScores[section] = Math.round(avgScore);

      // Apply category weight
      const weight = categoryWeights[section] || 1;
      totalWeightedScore += avgScore * weight;
      totalWeight += weight;
    });

    // Calculate final risk score
    let finalScore = Math.round(totalWeightedScore / totalWeight);

    // Critical adjustment: Check for self-harm ideation (q24)
    const q24 = ASSESSMENT_QUESTIONS.find(q => q.id === "q24");
    if (q24 && isWorstAnswer("q24", answers["q24"])) {
      const q24Sub = subAnswers["q24"];
      if (q24Sub?.impact === "Yes, detailed" || q24Sub?.impact === "Already attempted") {
        finalScore = 100; // CRITICAL
      } else {
        finalScore = Math.max(finalScore, 85); // HIGH
      }
    }

    return {
      score: Math.min(Math.max(finalScore, 0), 100),
      categoryScores,
      riskLevel: getRiskLevel(Math.min(Math.max(finalScore, 0), 100)),
    };
  } catch (error) {
    console.error("Risk calculation error:", error);
    return {
      score: 0,
      categoryScores: {},
      riskLevel: getRiskLevel(0),
    };
  }
}

export function checkCriticalAlert(answers, subAnswers = {}) {
  try {
    // Q24: Self-harm ideation
    const q24Answer = answers["q24"];
    
    if (q24Answer && isWorstAnswer("q24", q24Answer)) {
      const q24Sub = subAnswers["q24"];

      return {
        isCritical: true,
        severity: q24Sub?.impact === "Yes, detailed" || q24Sub?.impact === "Already attempted" ? "immediate" : "warning",
        message: q24Sub?.impact === "Yes, detailed" || q24Sub?.impact === "Already attempted"
          ? "You've indicated you have a plan to harm yourself. Please reach out for help immediately. Crisis support is available 24/7."
          : "You're experiencing thoughts of self-harm. Please talk to a counsellor or mental health professional. You're not alone.",
        reason: q24Sub?.reason || null,
        duration: q24Sub?.duration || null,
        impact: q24Sub?.impact || null,
        suggestedAction: "contact_counsellor",
      };
    }

    return { isCritical: false };
  } catch (error) {
    console.error("Critical alert check error:", error);
    return { isCritical: false };
  }
}

export function getDetailedBreakdown(answers, subAnswers = {}) {
  try {
    const breakdown = {
      answers,
      subAnswers,
      flaggedQuestions: [],
      categoryScores: {},
    };

    const sections = ["academicStress", "socialConnection", "sleepQuality", "anxietyStress", "emotionalWellbeing"];

    sections.forEach(section => {
      ASSESSMENT_QUESTIONS.forEach(q => {
        if (q.section === section) {
          const answerText = answers[q.id];
          if (answerText && isWorstAnswer(q.id, answerText)) {
            breakdown.flaggedQuestions.push({
              questionId: q.id,
              section,
              question: q.text,
              answer: answerText,
              subAnswer: subAnswers[q.id] || null,
            });
          }
        }
      });
    });

    // Calculate category scores
    sections.forEach(section => {
      let sectionScore = 0;
      let sectionQuestionCount = 0;

      ASSESSMENT_QUESTIONS.forEach(q => {
        if (q.section === section) {
          sectionQuestionCount++;
          const answerText = answers[q.id];
          
          if (answerText) {
            const optionIndex = q.options.indexOf(answerText);
            const baseScore = (optionIndex + 1) * 20;
            sectionScore += Math.min(baseScore, 100);
          }
        }
      });

      breakdown.categoryScores[section] = sectionQuestionCount > 0 
        ? Math.round(sectionScore / sectionQuestionCount) 
        : 0;
    });

    return breakdown;
  } catch (error) {
    console.error("Breakdown calculation error:", error);
    return {
      answers,
      subAnswers,
      flaggedQuestions: [],
      categoryScores: {},
    };
  }
}
