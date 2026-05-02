/**
 * WELLNESS DATA FLOW SERVICE
 * Unified hub for assessment data processing, scoring, and Firebase synchronization
 * Ensures: Assessment → Scores → Tasks → Dashboard rendering
 */

import { db } from "../firebase";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { calculateTotalRiskScore } from "../utils/adaptiveRiskCalculator.js";
import { generatePersonalizedTasks } from "../utils/aiTaskGenerator.js";

/**
 * STEP 1: Convert assessment answers to wellness score
 * Input: answers object from Assessment.jsx
 * Output: { academicStress, socialConnection, sleepQuality, anxietyStress, emotionalWellbeing, overall, riskLevel }
 */
export function processAssessmentAnswers(answers, subAnswers = {}, categoryScores = {}) {
  try {
    console.log("🔄 [Wellness] Processing assessment answers...");
    
    // Use the existing risk calculator (it already does proper scoring)
    const { score: overallScore, categoryScores: calculatedScores, riskLevel } = 
      calculateTotalRiskScore(answers, subAnswers);

    const wellnessScores = {
      academicStress: calculatedScores.academicStress || 0,
      socialConnection: calculatedScores.socialConnection || 0,
      sleepQuality: calculatedScores.sleepQuality || 0,
      anxietyStress: calculatedScores.anxietyStress || 0,
      emotionalWellbeing: calculatedScores.emotionalWellbeing || 0,
      overall: overallScore,
      riskLevel: riskLevel.level || "Low",
      riskColor: riskLevel.color || "emerald",
    };

    console.log("✅ [Wellness] Scores calculated:", wellnessScores);
    return wellnessScores;
  } catch (error) {
    console.error("❌ [Wellness] Score calculation error:", error);
    return {
      academicStress: 0,
      socialConnection: 0,
      sleepQuality: 0,
      anxietyStress: 0,
      emotionalWellbeing: 0,
      overall: 0,
      riskLevel: "Low",
      riskColor: "emerald",
    };
  }
}

/**
 * STEP 2: Save assessment and scores to Firestore
 * Stores: assessments collection + updates users document with latest scores
 */
export async function saveWellnessData(userId, assessmentData) {
  if (!userId || !assessmentData) {
    console.error("❌ [Wellness] Missing userId or assessmentData");
    return null;
  }

  try {
    console.log("💾 [Wellness] Saving to Firestore...", userId);

    // The assessment is already saved by createAssessmentRecord in Assessment.jsx
    // We just need to update the user document with current scores and risk level

    const userRef = doc(db, "users", userId);

    const latestAssessment = {
      score: assessmentData.overall || 0,
      riskLevel: assessmentData.riskLevel || "Low",
      riskColor: assessmentData.riskColor || "emerald",
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, {
      latestAssessment: {
        ...latestAssessment,
        categories: {
          academic: assessmentData.academicStress || 0,
          sleep: assessmentData.sleepQuality || 0,
          social: assessmentData.socialConnection || 0,
          emotional: assessmentData.emotionalWellbeing || 0,
        },
      },
      riskScore: latestAssessment.score,
      riskLevel: latestAssessment.riskLevel,
      riskColor: latestAssessment.riskColor,
      categoryScores: {
        academic: assessmentData.academicStress || 0,
        social: assessmentData.socialConnection || 0,
        sleep: assessmentData.sleepQuality || 0,
        anxiety: assessmentData.anxietyStress || 0,
        emotional: assessmentData.emotionalWellbeing || 0,
      },
      lastAssessmentUpdated: serverTimestamp(),
    }, { merge: true });

    console.log("✅ [Wellness] Scores saved to user document");
    return assessmentData;
  } catch (error) {
    console.error("❌ [Wellness] Save error:", error);
    return null;
  }
}

/**
 * STEP 3: Generate and save personalized tasks based on scores
 * Creates daily tasks from lowest category + risk level
 */
export async function generateAndSavePersonalizedTasks(userId, wellnessScores) {
  if (!userId || !wellnessScores) {
    console.error("❌ [Wellness] Cannot generate tasks - missing data");
    return [];
  }

  try {
    console.log("🎯 [Wellness] Generating personalized tasks...");

    // Find lowest scoring category
    const scores = {
      academic: wellnessScores.academicStress || 0,
      social: wellnessScores.socialConnection || 0,
      sleep: wellnessScores.sleepQuality || 0,
      anxiety: wellnessScores.anxietyStress || 0,
      emotional: wellnessScores.emotionalWellbeing || 0,
    };

    const lowestCategory = Object.entries(scores).reduce((prev, curr) => 
      curr[1] < prev[1] ? curr : prev
    )[0];

    const riskLevel = wellnessScores.riskLevel || "Low";

    // Generate tasks
    const tasks = generatePersonalizedTasks({
      totalScore: wellnessScores.overall || 0,
      riskLevel,
      categories: {
        academic: { score: wellnessScores.academicStress || 0 },
        social: { score: wellnessScores.socialConnection || 0 },
        sleep: { score: wellnessScores.sleepQuality || 0 },
        anxiety: { score: wellnessScores.anxietyStress || 0 },
        emotional: { score: wellnessScores.emotionalWellbeing || 0 },
      },
    }) || [];

    // Save to Firestore for today's date
    const today = new Date().toISOString().split("T")[0];
    const tasksRef = doc(db, "users", userId, "dailyTasks", today);

    await setDoc(tasksRef, {
      tasks: tasks.slice(0, 4), // Top 4 tasks
      lowestCategory,
      riskLevel,
      generatedAt: serverTimestamp(),
      completed: [],
    }, { merge: true });

    console.log("✅ [Wellness] Tasks generated & saved:", tasks.length, "tasks");
    return tasks.slice(0, 4);
  } catch (error) {
    console.error("❌ [Wellness] Task generation error:", error);
    return [];
  }
}

/**
 * STEP 4: Fetch wellness data for dashboard
 * Returns current scores and latest assessment
 */
export async function fetchWellnessData(userId) {
  if (!userId) {
    console.error("❌ [Wellness] No userId provided");
    return null;
  }

  try {
    console.log("📊 [Wellness] Fetching wellness data for user:", userId);

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.warn("⚠️  [Wellness] User document not found");
      return null;
    }

    const userData = userSnap.data();
    const wellnessData = {
      riskScore: userData?.riskScore || 0,
      riskLevel: userData?.riskLevel || "Low",
      riskColor: userData?.riskColor || "emerald",
      categoryScores: userData?.categoryScores || {
        academic: 0,
        social: 0,
        sleep: 0,
        anxiety: 0,
        emotional: 0,
      },
      lastUpdated: userData?.lastAssessmentUpdated,
    };

    console.log("✅ [Wellness] Wellness data fetched:", wellnessData);
    return wellnessData;
  } catch (error) {
    console.error("❌ [Wellness] Fetch error:", error);
    return null;
  }
}

/**
 * STEP 5: Watch wellness data in real-time
 * Returns unsubscribe function for real-time updates
 */
export function watchWellnessData(userId, callback) {
  if (!userId) {
    console.error("❌ [Wellness] No userId for watching");
    callback(null);
    return () => {};
  }

  try {
    console.log("👁️  [Wellness] Setting up real-time watch for:", userId);

    const userRef = doc(db, "users", userId);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const wellnessData = {
          riskScore: userData?.riskScore || 0,
          riskLevel: userData?.riskLevel || "Low",
          riskColor: userData?.riskColor || "emerald",
          categoryScores: userData?.categoryScores || {
            academic: 0,
            social: 0,
            sleep: 0,
            anxiety: 0,
            emotional: 0,
          },
          lastUpdated: userData?.lastAssessmentUpdated,
        };
        callback(wellnessData);
      } else {
        // New user - no data yet
        console.warn("⚠️  [Wellness] No user data - this appears to be a new user");
        callback(null);
      }
    }, (error) => {
      console.error("❌ [Wellness] Real-time watch error:", error);
      callback(null);
    });

    return unsubscribe;
  } catch (error) {
    console.error("❌ [Wellness] Watch setup error:", error);
    return () => {};
  }
}

/**
 * STEP 6: Fetch today's personalized tasks
 */
export async function fetchTodaysTasks(userId) {
  if (!userId) {
    console.error("❌ [Wellness] No userId for tasks");
    return [];
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const tasksRef = doc(db, "users", userId, "dailyTasks", today);
    const tasksSnap = await getDoc(tasksRef);

    if (tasksSnap.exists()) {
      const tasksData = tasksSnap.data();
      console.log("✅ [Wellness] Today's tasks fetched:", tasksData.tasks?.length || 0);
      return tasksData.tasks || [];
    }

    console.log("ℹ️  [Wellness] No tasks for today - user may need to complete assessment");
    return [];
  } catch (error) {
    console.error("❌ [Wellness] Task fetch error:", error);
    return [];
  }
}

/**
 * STEP 7: Watch today's tasks in real-time
 */
export function watchTodaysTasks(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  try {
    const today = new Date().toISOString().split("T")[0];
    const tasksRef = doc(db, "users", userId, "dailyTasks", today);

    const unsubscribe = onSnapshot(tasksRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().tasks || []);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("❌ [Wellness] Tasks watch error:", error);
      callback([]);
    });

    return unsubscribe;
  } catch (error) {
    console.error("❌ [Wellness] Tasks watch setup error:", error);
    return () => {};
  }
}

/**
 * STEP 8: Calculate risk level from score
 */
export function getRiskLevel(score) {
  if (score >= 75) return "Low";
  if (score >= 50) return "Medium";
  return "High";
}

/**
 * STEP 9: Calculate mental health summary
 */
export function calculateMentalHealthSummary(categoryScores = {}) {
  const causes = [];
  
  if ((categoryScores.academic || 0) > 70) causes.push("Academic pressure");
  if ((categoryScores.social || 0) > 70) causes.push("Social concerns");
  if ((categoryScores.sleep || 0) > 70) causes.push("Sleep issues");
  if ((categoryScores.anxiety || 0) > 70) causes.push("Anxiety");
  if ((categoryScores.emotional || 0) > 70) causes.push("Emotional stress");

  return {
    causes: causes.length > 0 ? causes : ["Overall wellness"],
    hasCriticalConcern: Object.values(categoryScores).some(score => score > 85),
  };
}

/**
 * STEP 10: Complete data pipeline
 * All-in-one function for assessment → scores → tasks flow
 */
export async function processCompleteAssessmentPipeline(
  userId,
  answers,
  subAnswers,
  existingCategoryScores
) {
  if (!userId || !answers) {
    console.error("❌ [Wellness] Pipeline error - missing required data");
    return null;
  }

  try {
    console.log("🚀 [Wellness] Starting complete assessment pipeline...");

    // Step 1: Calculate scores
    const wellnessScores = processAssessmentAnswers(
      answers,
      subAnswers,
      existingCategoryScores
    );

    // Step 2: Save scores to Firestore
    await saveWellnessData(userId, wellnessScores);

    // Step 3: Generate tasks
    await generateAndSavePersonalizedTasks(userId, wellnessScores);

    console.log("✅ [Wellness] Complete pipeline finished!");
    return wellnessScores;
  } catch (error) {
    console.error("❌ [Wellness] Pipeline error:", error);
    return null;
  }
}

export default {
  processAssessmentAnswers,
  saveWellnessData,
  generateAndSavePersonalizedTasks,
  fetchWellnessData,
  watchWellnessData,
  fetchTodaysTasks,
  watchTodaysTasks,
  getRiskLevel,
  calculateMentalHealthSummary,
  processCompleteAssessmentPipeline,
};
