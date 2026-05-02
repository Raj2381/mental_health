import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Flame, Trophy, Zap, Calendar, TrendingUp } from 'lucide-react';
import { auth } from '../../firebase';
import { watchDailyProgress } from '../../services/firebase/adaptiveDailyProgress';

const milestones = [
  { days: 3, title: '3-Day Streak', icon: '🔥', color: 'from-orange-400 to-red-400' },
  { days: 7, title: 'Week Warrior', icon: '💪', color: 'from-blue-400 to-cyan-400' },
  { days: 14, title: 'Two Weeks Strong', icon: '🚀', color: 'from-purple-400 to-pink-400' },
  { days: 30, title: 'Month Master', icon: '👑', color: 'from-yellow-400 to-orange-400' },
];

export default function StreakTracker() {
  const [userId, setUserId] = useState(null);
  const [dailyProgress, setDailyProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get user auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      if (!user?.uid) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Watch daily progress for streak data
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchDailyProgress(userId, (data) => {
      setDailyProgress(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const streakData = dailyProgress?.streakData || {};
  const currentStreak = streakData.currentStreak || 0;
  const maxStreak = streakData.maxStreak || 0;
  const totalActiveDays = streakData.totalActiveDays || 0;

  // Get active milestones
  const activeMilestones = milestones.filter((m) => currentStreak >= m.days);
  const nextMilestone = milestones.find((m) => currentStreak < m.days);

  return (
    <div className="space-y-6">
      {/* Main Streak Display */}
      <Motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Current Streak</h2>
          <Flame className="w-12 h-12 text-amber-500 animate-pulse" />
        </div>

        <div className="space-y-6">
          {/* Main Streak Number */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
              {currentStreak}
            </div>
            <p className="text-slate-600 text-lg font-medium mt-2">
              {currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </Motion.div>

          {/* Streak Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 border border-amber-100"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-slate-600">Best Streak</span>
              </div>
              <p className="text-3xl font-bold text-amber-600">{maxStreak}</p>
            </Motion.div>

            <Motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 border border-blue-100"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-slate-600">Total Active</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{totalActiveDays}</p>
            </Motion.div>
          </div>

          {/* Motivation Message */}
          {currentStreak > 0 && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-amber-400/10 to-orange-400/10 border border-amber-200 rounded-lg p-4"
            >
              <p className="text-sm font-medium text-amber-900">
                🎯 {currentStreak > maxStreak ? "You're breaking your record!" : "Keep going to break your personal best!"}
              </p>
            </Motion.div>
          )}
        </div>
      </Motion.div>

      {/* Milestones */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
      >
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <span>Achievements</span>
        </h3>

        <div className="space-y-3">
          {/* Completed Milestones */}
          {activeMilestones.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-600 uppercase">Unlocked</p>
              {activeMilestones.map((milestone) => (
                <Motion.div
                  key={milestone.days}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r ${milestone.color} text-white`}
                >
                  <span className="text-2xl">{milestone.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold">{milestone.title}</p>
                    <p className="text-sm opacity-90">{milestone.days}-day streak</p>
                  </div>
                  <Flame className="w-5 h-5" />
                </Motion.div>
              ))}
            </div>
          )}

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold text-slate-500 uppercase">Next Goal</p>
              <Motion.div
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-3 p-3 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300"
              >
                <span className="text-2xl opacity-40">{nextMilestone.icon}</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-700">{nextMilestone.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                    <p className="text-sm text-slate-600">
                      {nextMilestone.days - currentStreak} more days to unlock
                    </p>
                  </div>
                </div>
              </Motion.div>
            </div>
          )}
        </div>
      </Motion.div>

      {/* Empty State */}
      {currentStreak === 0 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
        >
          <Flame className="w-12 h-12 mx-auto mb-3 opacity-30 text-blue-600" />
          <h4 className="font-semibold text-blue-900 mb-2">Start Your Streak</h4>
          <p className="text-sm text-blue-700">
            Complete 60% or more of your daily checklist to start building your streak today!
          </p>
        </Motion.div>
      )}
    </div>
  );
}
