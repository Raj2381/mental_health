import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Zap, TrendingDown } from "lucide-react";
import TaskCard from "./TaskCard";

/**
 * TasksList Component
 * Displays all daily tasks with progress tracking and risk score reduction
 * 
 * Props:
 * - tasks: Array of task objects
 * - progress: { completed, total, percentage }
 * - stats: { originalRiskScore, currentRiskScore, potentialReduction }
 * - onTaskToggle: Function to call when task is toggled
 * - isLoading: Whether toggle action is in progress
 */
export default function TasksList({
  tasks = [],
  progress = { completed: 0, total: 0, percentage: 0 },
  stats = { originalRiskScore: 0, currentRiskScore: 0, potentialReduction: 0 },
  onTaskToggle,
  isLoading = false,
}) {
  const [completedTasksCount, setCompletedTasksCount] = useState(0);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const count = tasks.filter((t) => t.completed).length;
      setCompletedTasksCount(count);
    }
  }, [tasks]);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No tasks for today</p>
      </div>
    );
  }

  const progressPercent = progress.percentage || 0;
  const originalScore = stats.originalRiskScore || 0;
  const currentScore = stats.currentRiskScore || 0;
  const scoreReduction = Math.round((originalScore - currentScore) * 10) / 10;
  const potentialReduction = stats.potentialReduction || 0;

  return (
    <div className="space-y-6">
      {/* Header with title and badge */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Today's Tasks
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Complete tasks to improve your wellbeing
          </p>
        </div>
        {completedTasksCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 text-sm font-semibold"
          >
            {completedTasksCount}/{tasks.length} done
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <motion.div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-700 dark:text-slate-300 font-medium">Progress</span>
          <span className="text-slate-600 dark:text-slate-400">{progressPercent}%</span>
        </div>
        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"
          />
        </div>
      </motion.div>

      {/* Risk score impact section */}
      <motion.div
        className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border border-blue-200 dark:border-blue-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Original risk score */}
        <div className="text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">
            Starting Score
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {originalScore}
          </div>
          <div className="text-xs text-slate-500 mt-1">Risk Level</div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl"
          >
            →
          </motion.div>
        </div>

        {/* Current risk score */}
        <div className="text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">
            Current Score
          </div>
          <motion.div
            key={currentScore}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold"
          >
            <span
              className={
                scoreReduction > 0 ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-slate-100"
              }
            >
              {currentScore}
            </span>
          </motion.div>
          {scoreReduction > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-600 dark:text-green-400 font-semibold mt-1 flex items-center justify-center gap-1"
            >
              <TrendingDown size={12} />
              {scoreReduction} ↓
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Potential impact message */}
      <motion.div
        className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-start gap-2 text-sm">
          <Zap size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-amber-900 dark:text-amber-100">
            <span className="font-semibold">Potential impact:</span> Complete all{" "}
            <span className="font-bold">{tasks.length}</span> tasks today to reduce your risk score by{" "}
            <span className="font-bold">{potentialReduction}</span> points!
          </div>
        </div>
      </motion.div>

      {/* Tasks list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task, index) => (
            <TaskCard
              key={`${task.title}-${index}`}
              task={task}
              index={index}
              onToggle={onTaskToggle}
              isLoading={isLoading}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Completion celebration */}
      {progressPercent === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 border-2 border-green-300 dark:border-green-700 rounded-lg text-center"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="text-3xl mb-2"
          >
            🎉
          </motion.div>
          <h3 className="font-bold text-green-900 dark:text-green-100 mb-1">
            Amazing! All tasks completed!
          </h3>
          <p className="text-sm text-green-800 dark:text-green-200">
            Your risk score has improved by{" "}
            <span className="font-bold">{scoreReduction}</span> points. Keep it up tomorrow!
          </p>
        </motion.div>
      )}
    </div>
  );
}
