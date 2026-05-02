import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { getTaskCategoryMetadata } from "../utils/aiTaskGenerator";

/**
 * TaskCard Component
 * Displays individual AI-generated task with completion checkbox and metadata
 * 
 * Props:
 * - task: { title, reason, impact, completed, completedAt }
 * - index: Position in task list
 * - onToggle: Function to call when task is checked/unchecked
 * - isLoading: Whether the toggle action is in progress
 */
export default function TaskCard({ task, index, onToggle, isLoading = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const metadata = getTaskCategoryMetadata(task.reason);

  if (!task) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative rounded-lg border-2 p-4 transition-all cursor-pointer
        ${
          task.completed
            ? "border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-700"
            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
        }
      `}
      onClick={() => onToggle(index)}
    >
      {/* Background gradient on hover */}
      <AnimatePresence>
        {isHovered && !task.completed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.02 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 rounded-lg bg-gradient-to-r ${metadata.gradient}`}
            pointerEvents="none"
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative flex items-start gap-4">
        {/* Checkbox */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(index);
          }}
          disabled={isLoading}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 mt-1 focus:outline-none transition-colors"
        >
          <AnimatePresence mode="wait">
            {task.completed ? (
              <motion.div
                key="checked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-green-600 dark:text-green-400"
              >
                <CheckCircle2 size={24} strokeWidth={2.5} />
              </motion.div>
            ) : (
              <motion.div
                key="unchecked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
              >
                <Circle size={24} strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Task details */}
        <div className="flex-1 min-w-0">
          {/* Task title */}
          <motion.h3
            animate={{
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "rgb(107 114 128)" : "inherit",
            }}
            className={`
              font-semibold text-base transition-colors
              ${task.completed ? "text-gray-500 dark:text-gray-400" : "text-slate-900 dark:text-slate-100"}
            `}
          >
            {task.title}
          </motion.h3>

          {/* Task metadata badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Reason badge */}
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`
                inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                bg-gradient-to-r ${metadata.gradient}
                text-white shadow-sm
              `}
            >
              <span>{metadata.icon}</span>
              <span className="font-medium">{task.reason}</span>
            </motion.span>

            {/* Impact badge */}
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="
                inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium
                bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200
              "
            >
              <span>📊</span>
              <span>{task.impact}</span>
            </motion.span>
          </div>

          {/* Completion timestamp */}
          {task.completed && task.completedAt && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              className="text-xs text-gray-500 dark:text-gray-400 mt-2"
            >
              ✓ Completed {formatCompletionTime(task.completedAt)}
            </motion.p>
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-blue-500"
          >
            <AlertCircle size={20} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Format completion time for display
 * @param {String} completedAt - ISO timestamp
 * @returns {String} Formatted time string
 */
function formatCompletionTime(completedAt) {
  const completedDate = new Date(completedAt);
  const now = new Date();

  const diffMs = now - completedDate;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  return completedDate.toLocaleDateString();
}
