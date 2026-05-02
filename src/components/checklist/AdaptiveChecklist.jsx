import { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { CheckCircle2, Circle, Zap, TrendingDown, Flame, AlertCircle } from 'lucide-react';
import { auth } from '../../firebase';
import { 
  watchDailyProgress, 
  updateTaskCompletion,
  initializeDailyChecklist,
} from '../../services/firebase/adaptiveDailyProgress';
import { getDailyFeedback, identifyProblemAreas } from '../../utils/adaptiveTaskGenerator';
import { getStreakMilestone } from '../../utils/adaptiveScoreReducer';

const colors = {
  social: 'from-blue-500 to-cyan-500',
  anxiety: 'from-orange-500 to-red-500',
  academic: 'from-purple-500 to-pink-500',
  sleep: 'from-indigo-500 to-blue-500',
  emotional: 'from-rose-500 to-orange-500',
  wellness: 'from-green-500 to-emerald-500',
};

const categoryIcons = {
  social: '👥',
  anxiety: '😰',
  academic: '📚',
  sleep: '😴',
  emotional: '💭',
  wellness: '✨',
};

export default function AdaptiveChecklist() {
  const [userId, setUserId] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Get user auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      if (!user?.uid) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize checklist and listen for updates
  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    // Initialize checklist with current scores
    initializeDailyChecklist(userId, {})
      .catch((err) => console.error('Failed to initialize checklist:', err));

    // Set up real-time listener
    const unsubscribe = watchDailyProgress(userId, (data) => {
      setDailyProgress(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleTaskToggle = async (taskId, currentStatus) => {
    if (!userId || updatingTaskId) return;

    try {
      setUpdatingTaskId(taskId);
      await updateTaskCompletion(userId, taskId, !currentStatus);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const feedback = useMemo(() => {
    return getDailyFeedback(dailyProgress?.completionPercent || 0);
  }, [dailyProgress?.completionPercent]);

  const streakMilestone = useMemo(() => {
    return getStreakMilestone(dailyProgress?.streakData?.currentStreak || 0);
  }, [dailyProgress?.streakData?.currentStreak]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your checklist...</p>
        </div>
      </div>
    );
  }

  if (!dailyProgress) {
    return (
      <div className="p-8 text-center text-gray-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Unable to load your daily checklist. Please try again.</p>
      </div>
    );
  }

  const allTasks = dailyProgress.allTasks || [];
  const completionPercent = dailyProgress.completionPercent || 0;
  const streak = dailyProgress.streakData?.currentStreak || 0;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Today's Checklist</h2>
          {streakMilestone && (
            <div className="flex items-center space-x-2 bg-amber-500/20 px-3 py-1 rounded-full">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold">{streakMilestone.title}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm opacity-75">Progress</span>
            <span className="text-2xl font-bold">{completionPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
            <Motion.div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Feedback Message */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-green-500/20 text-green-200'
              : feedback.type === 'warning'
              ? 'bg-orange-500/20 text-orange-200'
              : feedback.type === 'info'
              ? 'bg-blue-500/20 text-blue-200'
              : 'bg-slate-700/50 text-slate-200'
          }`}
        >
          {feedback.message}
        </Motion.div>
      </Motion.div>

      {/* Problem Areas Alert */}
      {dailyProgress.problemAreas?.length > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4"
        >
          <h4 className="font-semibold text-orange-900 mb-2 flex items-center space-x-2">
            <TrendingDown className="w-4 h-4" />
            <span>Focus Areas</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {dailyProgress.problemAreas.map((area) => (
              <div
                key={area.category}
                className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${colors[area.category]} text-white`}
              >
                {categoryIcons[area.category]} {area.category}
                <span className="ml-1 opacity-75">({Math.round(area.score)})</span>
              </div>
            ))}
          </div>
        </Motion.div>
      )}

      {/* Base Habits */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
      >
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Daily Habits ({dailyProgress.base?.completed || 0}/{dailyProgress.base?.total || 0})</span>
        </h3>
        <div className="space-y-2">
          {dailyProgress.checklist?.base?.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleTaskToggle(task.id, task.completed)}
              isUpdating={updatingTaskId === task.id}
            />
          ))}
        </div>
      </Motion.div>

      {/* Personalized Tasks */}
      {dailyProgress.checklist?.personalized?.length > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm"
        >
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>
              AI Recommended ({dailyProgress.personalized?.completed || 0}/{dailyProgress.personalized?.total || 0})
            </span>
          </h3>
          <div className="space-y-2">
            {dailyProgress.checklist.personalized.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => handleTaskToggle(task.id, task.completed)}
                isUpdating={updatingTaskId === task.id}
                isPersonalized={true}
              />
            ))}
          </div>
        </Motion.div>
      )}

      {/* Streak Info */}
      {streak > 0 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center space-x-2 text-amber-600 font-medium"
        >
          <Flame className="w-5 h-5" />
          <span>{streak} day streak! Keep it up!</span>
        </Motion.div>
      )}
    </div>
  );
}

/**
 * Individual task item component
 */
function TaskItem({ task, onToggle, isUpdating, isPersonalized = false }) {
  const categoryColor = colors[task.category] || colors.wellness;
  const categoryIcon = categoryIcons[task.category] || '✨';

  return (
    <Motion.button
      layout
      onClick={onToggle}
      disabled={isUpdating}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {/* Checkbox */}
      <div className="flex-shrink-0 mt-1">
        {task.completed ? (
          <Motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-6 h-6 rounded-full bg-gradient-to-r ${categoryColor} flex items-center justify-center text-white`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </Motion.div>
        ) : (
          <Circle className="w-6 h-6 text-slate-300" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium ${
              task.completed ? 'line-through text-slate-400' : 'text-slate-900'
            }`}
          >
            {task.text}
          </p>
          {isPersonalized && (
            <span className="flex-shrink-0 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
              AI
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 mt-1">
          <span className="text-xs text-slate-500 flex items-center space-x-1">
            <span className="text-lg">{categoryIcon}</span>
            <span>{task.category}</span>
          </span>
          {task.duration && (
            <span className="text-xs text-slate-400">•  {task.duration}</span>
          )}
          {task.impact && (
            <span className="text-xs text-slate-400">•  Impact: {task.impact}/5</span>
          )}
        </div>
      </div>
    </Motion.button>
  );
}
