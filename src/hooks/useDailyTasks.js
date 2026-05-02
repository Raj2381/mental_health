import { useState, useEffect, useCallback } from "react";
import { generatePersonalizedTasks, formatDailyPlanForFirebase, isValidAssessmentData } from "../utils/aiTaskGenerator";
import {
  getTodaysDailyPlan,
  saveDailyPlan,
  completeTask,
  uncompleteTask,
  watchDailyPlan,
} from "../services/firebase/dailyPlans";

/**
 * Hook to manage AI-generated daily tasks
 * Fetches assessment data, generates tasks, and syncs with Firebase
 *
 * @param {String} userId - User ID
 * @param {Object} assessmentData - Latest assessment data { totalScore, categories, riskLevel }
 * @returns {Object} { tasks, progress, stats, isLoading, error, toggleTask }
 */
export function useDailyTasks(userId, assessmentData) {
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [stats, setStats] = useState({
    originalRiskScore: 0,
    currentRiskScore: 0,
    potentialReduction: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Initialize tasks on component mount or when assessment changes
  useEffect(() => {
    if (!userId || !isValidAssessmentData(assessmentData)) {
      return;
    }

    initializeDailyTasks();
  }, [userId, assessmentData?.totalScore]); // Only depend on totalScore to prevent infinite loops

  // Watch for real-time updates to today's plan
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchDailyPlan(userId, today, (plan) => {
      if (plan) {
        updateTasksFromPlan(plan);
      }
    });

    return () => unsubscribe?.();
  }, [userId]);

  const initializeDailyTasks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if plan already exists for today
      const existingPlan = await getTodaysDailyPlan(userId, today);

      if (existingPlan) {
        // Use existing plan
        updateTasksFromPlan(existingPlan);
      } else if (isValidAssessmentData(assessmentData)) {
        // Generate new tasks from assessment
        const generatedTasks = generatePersonalizedTasks(assessmentData);
        const dailyPlanData = formatDailyPlanForFirebase(
          generatedTasks,
          userId,
          today,
          assessmentData
        );

        // Save to Firebase
        await saveDailyPlan(userId, today, dailyPlanData);
        updateTasksFromPlan(dailyPlanData);
      }
    } catch (err) {
      console.error("Error initializing daily tasks:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTasksFromPlan = (plan) => {
    if (!plan) return;

    setTasks(plan.tasks || []);
    setProgress(plan.progress || { completed: 0, total: 0, percentage: 0 });
    setStats(plan.stats || {
      originalRiskScore: 0,
      currentRiskScore: 0,
      potentialReduction: 0,
    });
  };

  const toggleTask = useCallback(
    async (taskIndex) => {
      if (isToggling || !userId) return;

      const task = tasks[taskIndex];
      if (!task) return;

      setIsToggling(true);

      try {
        if (task.completed) {
          // Uncomplete task
          await uncompleteTask(userId, today, taskIndex);
        } else {
          // Complete task
          await completeTask(userId, today, taskIndex);
        }
        // Plan will be updated via real-time listener
      } catch (err) {
        console.error("Error toggling task:", err);
        setError(err.message);
      } finally {
        setIsToggling(false);
      }
    },
    [tasks, userId, isToggling]
  );

  return {
    tasks,
    progress,
    stats,
    isLoading,
    error,
    toggleTask,
    isToggling,
  };
}
