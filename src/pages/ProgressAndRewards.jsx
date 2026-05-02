import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { getCurrentUser } from "../services/auth";
import { watchCurrentUser } from "../services/firebase/users";
import { watchUserDailyMetrics } from "../services/firebase/dailyMetrics";
import Layout from "../components/Layout";
import { calculateRewardPoints, getRewardTier, nextTierThreshold } from "../utils/rewardSystem";

function Card({ title, children, className = "", animate = true }) {
  return (
    <Motion.div
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.4 }}
      className={`bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}
    >
      {title && (
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          {title}
        </h3>
      )}
      {children}
    </Motion.div>
  );
}

function ProgressBar({ value, label, showPercent = true, animated = true }) {
  const percentage = Math.min(Math.max(value, 0), 100);
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {showPercent && (
          <Motion.span
            animate={animated ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            {Math.round(percentage)}%
          </Motion.span>
        )}
      </div>
      <div className="h-3 w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-full overflow-hidden shadow-inner">
        <Motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
        />
      </div>
    </div>
  );
}

function Badge({ title, variant = "default", icon = "🏆" }) {
  const variantStyles = {
    default: "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-800 border border-indigo-300",
    success: "bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300",
    warning: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 border border-amber-300",
    danger: "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-800 border border-rose-300",
    premium: "bg-gradient-to-br from-yellow-100 to-orange-100 text-orange-800 border border-orange-300"
  };

  return (
    <Motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-md transition-all ${variantStyles[variant] || variantStyles.default}`}
    >
      <span className="text-lg">{icon}</span>
      {title}
    </Motion.div>
  );
}

export default function ProgressAndRewards() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [progressData, setProgressData] = useState({
    streak: 0,
    lastLogin: null,
    achievements: [],
    totalPoints: 0,
    lastActivityDate: null
  });
  const [dailyActivities, setDailyActivities] = useState({
    dailyCheckIn: false,
    attendedClass: false,
    followedTimetable: false,
    completedTasks: false,
    exercised: false,
    meditatedOrYoga: false,
    socializedHealthily: false,
    studiedExtraHours: false
  });
  const [newBadges, setNewBadges] = useState([]);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) navigate("/login");
    setCurrentUser(user);
  }, [navigate]);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Watch user profile from Firestore
    const unsubProfile = watchCurrentUser(currentUser.id, (userData) => {
      if (userData) {
        setProfileData(userData);
        console.log("✅ [PROGRESS REWARDS] Profile loaded:", userData);
      }
    });

    // Watch daily metrics from Firestore to calculate progress
    const unsubMetrics = watchUserDailyMetrics(currentUser.id, (metricsData) => {
      if (metricsData && metricsData.length > 0) {
        const todayMetrics = metricsData[0];
        console.log("✅ [PROGRESS REWARDS] Daily metrics loaded:", todayMetrics);
        
        // Update daily activities from Firestore metrics
        setDailyActivities(todayMetrics.items || {});
        
        // Calculate total points from historical metrics
        const totalPoints = metricsData.reduce((sum, metric) => {
          const points = calculateRewardPoints(metric.items || {});
          return sum + points;
        }, 0);
        
        setProgressData({
          streak: metricsData.filter(m => m.progressPercent > 0).length || 0,
          lastLogin: new Date(),
          achievements: [],
          totalPoints: totalPoints,
          lastActivityDate: todayMetrics.date || new Date(),
        });
        
        setStudentData({
          streak: metricsData.filter(m => m.progressPercent > 0).length || 0,
          lastLogin: new Date(),
          achievements: [],
          totalPoints: totalPoints,
          lastActivityDate: todayMetrics.date,
          dailyActivities: todayMetrics.items || {}
        });
      }
    });

    return () => {
      unsubProfile?.();
      unsubMetrics?.();
    };
  }, [currentUser]);

  const points = useMemo(() => {
    return progressData.totalPoints || 0;
  }, [progressData.totalPoints]);

  const tier = useMemo(() => getRewardTier(points), [points]);
  const nextThreshold = useMemo(() => nextTierThreshold(points), [points]);

  const handleUpdateProgress = async () => {
    if (!currentUser?.id) return;

    const activityPoints = calculateRewardPoints(dailyActivities);
    const newTotalPoints = (progressData.totalPoints || 0) + activityPoints;

    try {
      // Daily activities are already updated in Firestore via Progress page
      // This is just for UI feedback
      console.log("✅ [PROGRESS REWARDS] Progress updated for user:", currentUser.id, "New points:", newTotalPoints);
      setFeedback("Progress updated successfully! 🎉");
      setTimeout(() => setFeedback(""), 3000);
    } catch (error) {
      setFeedback("Failed to update progress. Please try again.");
    }
  };

  if (!currentUser) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="rounded-2xl bg-white/80 p-8 shadow-lg">
            <p className="text-slate-700">Loading... Please wait.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50/30 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          {/* Enhanced Header */}
          <Motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <p className="text-blue-50 text-sm font-semibold uppercase tracking-widest mb-2">Welcome back,</p>
              <h1 className="text-4xl lg:text-5xl font-black mb-2">{profileData?.name ?? "Student"}</h1>
              <p className="text-blue-100 text-lg">Track your progress and earn exclusive rewards 🏆</p>
              
              <div className="flex flex-wrap gap-3 mt-6">
                <Motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 flex items-center gap-2"
                >
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-xs text-blue-100 font-medium">Total Points</p>
                    <p className="text-2xl font-bold">{points}</p>
                  </div>
                </Motion.div>
                
                <Motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 flex items-center gap-2"
                >
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-xs text-blue-100 font-medium">Current Streak</p>
                    <p className="text-2xl font-bold">{progressData.streak} Days</p>
                  </div>
                </Motion.div>
                
                <Motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="px-5 py-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 flex items-center gap-2"
                >
                  <span className="text-2xl">🏅</span>
                  <div>
                    <p className="text-xs text-blue-100 font-medium">Current Tier</p>
                    <p className="text-2xl font-bold">{tier}</p>
                  </div>
                </Motion.div>
              </div>
            </div>
          </Motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level Progress */}
          <Card title="🏆 Tier Progress" className="lg:col-span-2">
            <div className="space-y-8">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mb-1">Current Tier</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{tier}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mb-1">Points to Next Tier</p>
                  <p className="text-2xl font-bold text-blue-600">{nextThreshold - points > 0 ? nextThreshold - points : "Maxed Out!"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">Tier Progress</span>
                    <span className="text-xs font-bold text-slate-500">{points}/{nextThreshold} points</span>
                  </div>
                  <ProgressBar 
                    value={(points / nextThreshold) * 100} 
                    label="" 
                    showPercent={false}
                    animated={true}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">Total Achievements</p>
                  <Motion.p
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl font-black text-purple-600"
                  >
                    {progressData.achievements?.length ?? 0}
                  </Motion.p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-1">Active Streak</p>
                  <Motion.p
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                    className="text-3xl font-black text-orange-600"
                  >
                    {progressData.streak}
                  </Motion.p>
                </div>
              </div>
            </div>
          </Card>

          {/* Daily Streak Card */}
          <Card title="🔥 Daily Streak">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mb-1">Current Streak</p>
                  <p className="text-4xl font-black text-orange-600">{progressData.streak || 0}</p>
                  <p className="text-xs text-slate-600 mt-1">days logged in</p>
                </div>
                <Motion.div
                  animate={{ rotate: [0, 10, -10, 0], y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-6xl"
                >
                  🔥
                </Motion.div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm font-semibold text-slate-700 mb-2">Last Login</p>
                <p className="text-2xl font-bold text-slate-800">
                  {progressData.lastLogin 
                    ? new Date(progressData.lastLogin).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : "Never"}
                </p>
                <p className="text-xs text-slate-500 mt-2">Keep the streak alive! 💪</p>
              </div>

              <Motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-3 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-lg text-center"
              >
                <p className="text-sm font-bold text-orange-800">
                  {progressData.streak >= 7 ? "🌟 Weekly Legend" : 
                   progressData.streak >= 3 ? "⭐ On Fire" : 
                   "💫 Keep Going"}
                </p>
              </Motion.div>
            </div>
          </Card>
        </div>

        {/* Daily Activities Section */}
        <Card title="📋 Daily Activity Check-in">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(dailyActivities).map(([key, value], index) => {
                const labels = {
                  dailyCheckIn: { emoji: "📌", label: "Daily Check-in" },
                  attendedClass: { emoji: "📚", label: "Attended Class" },
                  followedTimetable: { emoji: "⏰", label: "Followed Timetable" },
                  completedTasks: { emoji: "✅", label: "Completed Tasks" },
                  exercised: { emoji: "💪", label: "Exercised" },
                  meditatedOrYoga: { emoji: "🧘", label: "Meditated/Yoga" },
                  socializedHealthily: { emoji: "👥", label: "Socialized Healthily" },
                  studiedExtraHours: { emoji: "📖", label: "Studied Extra Hours" }
                };

                const info = labels[key] || { emoji: "⭐", label: key };

                return (
                  <Motion.label
                    key={key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                      value
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md"
                        : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="relative w-6 h-6">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setDailyActivities(prev => ({ ...prev, [key]: e.target.checked }))}
                        className="opacity-0 w-6 h-6 cursor-pointer"
                      />
                      <Motion.div
                        animate={value ? { scale: 1 } : { scale: 0.8 }}
                        className={`absolute inset-0 rounded-md flex items-center justify-center transition-colors ${
                          value
                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                            : "bg-slate-300"
                        }`}
                      >
                        {value && <span className="text-white text-sm font-bold">✓</span>}
                      </Motion.div>
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <span className="text-2xl">{info.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{info.label}</p>
                        <p className="text-xs text-slate-500">{value ? "Completed ✓" : "Pending"}</p>
                      </div>
                    </div>
                    {value && (
                      <Motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full"
                      >
                        +{Math.floor(Math.random() * 15) + 10} pts
                      </Motion.div>
                    )}
                  </Motion.label>
                );
              })}
            </div>

            {/* Activity Summary */}
            <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
              <p className="text-sm font-semibold text-slate-700 mb-3">📊 Activity Status</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Motion.p
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-2xl font-black text-green-600"
                  >
                    {Object.values(dailyActivities).filter(v => v).length}
                  </Motion.p>
                  <p className="text-xs text-slate-600">Completed</p>
                </div>
                <div className="text-center">
                  <Motion.p
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                    className="text-2xl font-black text-slate-600"
                  >
                    {Object.values(dailyActivities).length}
                  </Motion.p>
                  <p className="text-xs text-slate-600">Total</p>
                </div>
                <div className="text-center">
                  <Motion.p
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                    className="text-2xl font-black text-purple-600"
                  >
                    {Math.round((Object.values(dailyActivities).filter(v => v).length / Object.values(dailyActivities).length) * 100)}%
                  </Motion.p>
                  <p className="text-xs text-slate-600">Complete</p>
                </div>
              </div>
            </div>

            {/* Update Button */}
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpdateProgress}
              className="w-full bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              🎉 Update Progress & Earn Points
            </Motion.button>
            {/* Feedback Message */}
            {feedback && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-4 rounded-xl text-center font-semibold text-lg ${
                  feedback.includes("successfully")
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-300"
                    : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-300"
                }`}
              >
                {feedback.includes("successfully") ? "✅" : "⚠️"} {feedback}
              </Motion.div>
            )}
          </div>
        </Card>

        {/* Achievements & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="🎯 Activity Summary">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl border-2 border-blue-200 text-center"
                >
                  <p className="text-3xl">📚</p>
                  <p className="text-xs font-semibold text-blue-900 mt-2">Class</p>
                  <p className="text-sm font-bold text-blue-700">{dailyActivities.attendedClass ? "✓ Attended" : "Missed"}</p>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl border-2 border-purple-200 text-center"
                >
                  <p className="text-3xl">🧘</p>
                  <p className="text-xs font-semibold text-purple-900 mt-2">Meditation</p>
                  <p className="text-sm font-bold text-purple-700">{dailyActivities.meditatedOrYoga ? "✓ Done" : "Pending"}</p>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-gradient-to-br from-green-100 to-green-50 rounded-xl border-2 border-green-200 text-center"
                >
                  <p className="text-3xl">💪</p>
                  <p className="text-xs font-semibold text-green-900 mt-2">Exercise</p>
                  <p className="text-sm font-bold text-green-700">{dailyActivities.exercised ? "✓ Exercised" : "No"}</p>
                </Motion.div>

                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-4 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl border-2 border-orange-200 text-center"
                >
                  <p className="text-3xl">✅</p>
                  <p className="text-xs font-semibold text-orange-900 mt-2">Tasks</p>
                  <p className="text-sm font-bold text-orange-700">{dailyActivities.completedTasks ? "✓ Done" : "Pending"}</p>
                </Motion.div>
              </div>
            </div>
          </Card>

          {/* Motivational & Stats Card */}
          <Card title="💡 Progress Insights">
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <p className="text-sm text-amber-900 font-semibold mb-2">🎯 Today's Goal</p>
                <p className="text-3xl font-black text-amber-600">
                  {Math.round((Object.values(dailyActivities).filter(v => v).length / Object.values(dailyActivities).length) * 100)}%
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {Object.values(dailyActivities).filter(v => v).length}/{Object.values(dailyActivities).length} activities completed
                </p>
              </div>

              <Motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200"
              >
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  {Object.values(dailyActivities).filter(v => v).length === Object.values(dailyActivities).length 
                    ? "🌟 You're doing amazing!" 
                    : Object.values(dailyActivities).filter(v => v).length > 4 
                    ? "🚀 Almost there!" 
                    : "💪 Keep going!"}
                </p>
                <p className="text-xs text-slate-600">
                  {Object.values(dailyActivities).filter(v => v).length === 0
                    ? "Start your day right - complete your first activity!"
                    : Object.values(dailyActivities).filter(v => v).length === Object.values(dailyActivities).length
                    ? "You've completed all activities today! Amazing dedication!"
                    : "You're making great progress. Keep the momentum!"}
                </p>
              </Motion.div>

              <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-200">
                <p className="text-xs text-slate-600 font-semibold mb-2">📈 Stats</p>
                <div className="flex justify-between text-sm">
                  <span>Points Earned: <span className="font-bold text-purple-600">{points}</span></span>
                  <span>Tier: <span className="font-bold text-purple-600">{tier}</span></span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Final Motivational Section */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <p className="text-3xl font-black">🎊 Keep It Up!</p>
            <p className="text-lg text-blue-50 leading-relaxed">
              Stay consistent with your daily activities to build momentum, increase your streak, and climb the reward tiers. Every step counts toward your personal growth!
            </p>
            <div className="pt-4 flex items-center gap-4 flex-wrap">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">🔥 {progressData.streak} Day Streak</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">⭐ {points} Points</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">🏆 {tier} Tier</p>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
      </div>
    </Layout>
  );
}
