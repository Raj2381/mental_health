import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { getCurrentUser } from "../services/auth";
import { db } from "../firebase";
import {
  calculateNewRisk,
  deriveRiskLevel,
  generateTasksFromAssessment,
} from "../utils/adaptiveSystem";
import { updateUserStreak } from "../services/firebase/users";

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function Progress() {
  const [userId, setUserId] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    assessment: null,
    progress: {
      date: getTodayKey(),
      completedTasks: [],
      totalTasks: 0,
      percent: 0,
    },
    weeklyStats: [],
  });
  const [savingKey, setSavingKey] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    const resolvedUserId = user?.id || user?._id || null;
    if (resolvedUserId) setUserId(resolvedUserId);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, "users", userId);
    const unsub = onSnapshot(userRef, async (snap) => {
      const today = getTodayKey();

      if (!snap.exists()) {
        setDashboardData({
          assessment: null,
          progress: { date: today, completedTasks: [], totalTasks: 0, percent: 0 },
          weeklyStats: [],
        });
        return;
      }

      const data = snap.data();
      console.log("Progress Firebase Data:", data);
      const assessment = data?.latestAssessment || null;
      const categories = assessment?.categories || {};
      const tasks = generateTasksFromAssessment(categories);

      let progress = data?.dailyProgress || {
        date: today,
        completedTasks: [],
        totalTasks: tasks.length,
        percent: 0,
      };

      if (progress.date !== today) {
        progress = {
          date: today,
          completedTasks: [],
          totalTasks: tasks.length,
          percent: 0,
        };

        await setDoc(
          userRef,
          {
            dailyProgress: progress,
          },
          { merge: true }
        );
      }

      setDashboardData({
        assessment,
        progress: {
          date: progress.date || today,
          completedTasks: Array.isArray(progress.completedTasks) ? progress.completedTasks : [],
          totalTasks: Number(progress.totalTasks || tasks.length),
          percent: Number(progress.percent || 0),
        },
        weeklyStats: Array.isArray(data?.weeklyStats) ? data.weeklyStats : [],
      });
    });

    return () => unsub();
  }, [userId]);

  const categories = dashboardData.assessment?.categories || {};
  const tasks = useMemo(() => generateTasksFromAssessment(categories), [categories]);

  const progress = dashboardData.progress;
  const completedTasks = Array.isArray(progress.completedTasks) ? progress.completedTasks : [];
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const updateProgress = async (nextCompletedTasks, total = totalTasks) => {
    if (!userId || !dashboardData.assessment) return;

    const today = getTodayKey();
    const streakState = await updateUserStreak(userId, today);
    const completedPercent = total > 0 ? Math.round((nextCompletedTasks.length / total) * 100) : 0;
    const oldScore = Number(dashboardData.assessment.score || 0);
    const newScore = calculateNewRisk(oldScore, completedPercent);
    const newRiskLevel = deriveRiskLevel(newScore);

    const nextWeeklyStats = Array.isArray(dashboardData.weeklyStats) ? [...dashboardData.weeklyStats] : [];
    const existingIndex = nextWeeklyStats.findIndex((item) => item?.date === today);
    const point = {
      date: today,
      riskScore: Number(newScore.toFixed(2)),
      completion: completedPercent,
      score: Number(newScore.toFixed(2)),
      percent: completedPercent,
    };

    if (existingIndex >= 0) nextWeeklyStats[existingIndex] = point;
    else nextWeeklyStats.push(point);

    const trimmedWeekly = nextWeeklyStats
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .slice(-14);

    await setDoc(
      doc(db, "users", userId),
      {
        dailyProgress: {
          date: today,
          completedTasks: nextCompletedTasks,
          totalTasks: total,
          percent: completedPercent,
        },
        latestAssessment: {
          ...dashboardData.assessment,
          score: Number(newScore.toFixed(2)),
          riskLevel: newRiskLevel,
        },
        weeklyStats: trimmedWeekly,
        streak: streakState.streak,
        lastActiveDate: streakState.lastActiveDate,
        riskScore: Number(newScore.toFixed(2)),
        completion: completedPercent,
        stress: {
          academic: Number(categories.academic || 0),
          sleep: Number(categories.sleep || 0),
          social: Number(categories.social || 0),
          emotional: Number(categories.emotional || 0),
        },
      },
      { merge: true }
    );
  };

  const handleToggle = async (taskKey) => {
    if (!userId || !dashboardData.assessment) return;

    setSavingKey(taskKey);
    try {
      const isDone = completedTasks.includes(taskKey);
      const nextCompletedTasks = isDone
        ? completedTasks.filter((item) => item !== taskKey)
        : [...completedTasks, taskKey];

      await updateProgress(nextCompletedTasks, totalTasks);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <section className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-blue-50 via-white to-purple-50/30 p-8 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-600/70 mb-2">Adaptive Daily Progress</p>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Your Personalized Routine
              </h2>
              <p className="text-base leading-6 text-slate-600 max-w-xl">
                Tasks adapt from your latest stress profile and update your risk score in real-time.
              </p>
            </Motion.div>
          </div>

          <div className="flex gap-4 flex-wrap lg:flex-nowrap">
            <div className="rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 px-6 py-4 min-w-[140px]">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-green-700/60 mb-1">Completed</p>
              <p className="text-3xl font-black text-green-600">{completedCount}</p>
              <p className="text-xs text-green-600/60 mt-1">tasks done</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-slate-500/10 to-slate-500/5 border border-slate-300/30 px-6 py-4 min-w-[140px]">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-700/60 mb-1">Total</p>
              <p className="text-3xl font-black text-slate-700">{totalTasks}</p>
              <p className="text-xs text-slate-600/60 mt-1">today</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 px-6 py-4 min-w-[140px]">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-purple-700/60 mb-1">Progress</p>
              <p className="text-3xl font-black text-purple-600">{progressPercent}%</p>
              <p className="text-xs text-purple-600/60 mt-1">completion</p>
            </div>
          </div>
        </div>

        <div className="mt-6 w-full">
          <div className="h-3 rounded-full bg-slate-200/50 overflow-hidden shadow-inner">
            <Motion.div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-slate-500">{progress.date || getTodayKey()}</p>
            <p className="text-sm font-semibold text-purple-600">{progressPercent}% complete</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/50 bg-white/95 backdrop-blur-sm p-8 shadow-lg">
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">📋 Today's Adaptive Checklist</h3>
            <p className="text-sm text-slate-500">Generated from your latest assessment profile</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Risk Score: {Number(dashboardData.assessment?.score || 0).toFixed(1)}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {tasks.map((task) => {
            const checked = completedTasks.includes(task.key);
            return (
              <button
                type="button"
                key={task.key}
                onClick={() => handleToggle(task.key)}
                disabled={savingKey === task.key}
                className={`group rounded-[1.5rem] border p-5 text-left transition ${
                  checked
                    ? "border-emerald-200 bg-emerald-50/80 shadow-[0_16px_35px_-25px_rgba(34,197,94,0.7)]"
                    : "border-slate-200 bg-slate-50 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white ${task.accent}`}>
                  {task.shortLabel}
                </div>
                <div className="mt-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{task.label}</p>
                    <p className="mt-2 text-sm text-slate-500">{checked ? "Completed for today" : "Tap to mark as complete"}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-bold ${checked ? "bg-emerald-500 text-white" : "bg-white text-slate-300"}`}>
                    {savingKey === task.key ? "…" : checked ? "✓" : "○"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
