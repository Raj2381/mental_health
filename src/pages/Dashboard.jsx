import { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { Sparkles, CheckCircle2, XCircle, Calendar, Clock } from "lucide-react";
import { getCurrentUser } from "../services/auth.js";
import { db } from "../firebase";
import { updateUserStreak } from "../services/firebase/users";
import { watchStudentAppointments, updateAppointmentStatus } from "../services/firebase/appointments";

import Header from "../components/dashboard/Header";
import StreakCard from "../components/dashboard/StreakCard";
import RiskScoreCard from "../components/dashboard/RiskScoreCard";
import CounsellorCard from "../components/dashboard/CounsellorCard";
import MentalHealthPieChart from "../components/dashboard/MentalHealthPieChart";
import Recommendations from "../components/dashboard/Recommendations";
import ProgressSection from "../components/ProgressSection";
import StudentResultSummary from "../components/student/StudentResultSummary";
import DashboardCard from "../components/dashboard/DashboardCard";
import WeeklyTrendChart from "../components/dashboard/WeeklyTrendChart";

import { getGreeting, getRiskMeta, resolvePrimaryStressType } from "../utils/dashboardPersonalization";
import { getMainIssue, getTrendAndMessage } from "../utils/adaptiveSystem";

const QUOTES = [
  "Take care of your mental health.",
  "Progress over perfection.",
  "Small steps every day matter.",
  "Consistency builds success.",
  "You are capable of amazing things.",
  "One day at a time.",
];

function getTodayQuote() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem("quote");

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed.quote;
    } catch {
      localStorage.removeItem("quote");
    }
  }

  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  localStorage.setItem("quote", JSON.stringify({ quote: randomQuote, date: today }));
  return randomQuote;
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

export default function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [quote, setQuote] = useState("");
  const [assignedCounsellor, setAssignedCounsellor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    assessment: null,
    progress: {
      date: getTodayKey(),
      completedTasks: [],
      totalTasks: 8,
      percent: 0,
    },
    weeklyStats: [],
    profile: {
      name: "Student",
      streak: 0,
    },
  });

  useEffect(() => {
    const user = getCurrentUser();
    const resolvedUserId = user?.id || user?._id || null;
    if (resolvedUserId) setUserId(resolvedUserId);
  }, []);

  useEffect(() => {
    setQuote(getTodayQuote());
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(doc(db, "users", userId), (snap) => {
      if (!snap.exists()) {
        console.log("Firebase Data:", null);
        return;
      }

      const data = snap.data() || {};
      console.log("🔥 FIREBASE DATA:", data);
      const assessment = data?.latestAssessment || null;
      const progress = data?.dailyProgress || {
        date: getTodayKey(),
        completedTasks: [],
        totalTasks: 8,
        percent: 0,
      };
      const score = Number(data?.riskScore || 0);
      const riskLevel = String(data?.riskLevel || "Low");

      setDashboardData({
        assessment,
        progress: {
          date: progress.date || getTodayKey(),
          completedTasks: Array.isArray(progress.completedTasks) ? progress.completedTasks : [],
          totalTasks: Number(progress.totalTasks || 8),
          percent: Number(progress.percent || 0),
        },
        weeklyStats: Array.isArray(data?.weeklyStats) ? data.weeklyStats : [],
        profile: {
          name: data?.name || data?.displayName || "Student",
          streak: Number(data?.streak || 0),
          lastActiveDate: data?.lastActiveDate || null,
          lastAssessment: data?.lastAssessment || null,
          riskScore: Number(data?.riskScore ?? data?.latestAssessment?.score ?? 0),
          riskLevel: String(data?.riskLevel ?? data?.latestAssessment?.riskLevel ?? "Low"),
          assignedCounsellorId: data?.assignedCounsellorId || "",
          photoURL: data?.photoURL || data?.profile?.profileImage || "",
        },
      });
    });

    return () => unsub();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        await updateUserStreak(userId, getTodayKey());
      } catch (error) {
        if (!cancelled) {
          console.error("[Dashboard] Failed to sync streak on load:", error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchStudentAppointments(userId, (appts) => {
      console.log("🔥 STUDENT APPOINTMENTS:", appts);
      setAppointments(appts || []);
    });

    return () => unsubscribe?.();
  }, [userId]);

  useEffect(() => {
    if (!dashboardData.profile?.assignedCounsellorId) {
      setAssignedCounsellor(null);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", dashboardData.profile.assignedCounsellorId),
      (snap) => {
        if (!snap.exists()) {
          setAssignedCounsellor(null);
          return;
        }

        const data = snap.data() || {};
        const profile = data?.profile || {};
        setAssignedCounsellor({
          id: snap.id,
          name: data?.name || profile?.name || "Counsellor",
          specialization: profile?.specialization || "",
          experience: profile?.experience || profile?.experienceYears || "",
          bio: profile?.bio || "",
          phone: profile?.phone || data?.phone || "",
          photoURL: data?.photoURL || profile?.photoURL || "",
        });
      }
    );

    return () => unsubscribe();
  }, [dashboardData.profile?.assignedCounsellorId]);

  const score = Number(dashboardData.assessment?.score ?? dashboardData.profile?.riskScore ?? 0);
  const riskLevel = dashboardData.assessment?.riskLevel || dashboardData.profile?.riskLevel || "Low";
  const stress = dashboardData.assessment?.categories || {};
  const progress = dashboardData.progress;
  const weeklyStats = dashboardData.weeklyStats;
  const hasAssessment = Boolean(dashboardData.assessment?.score != null || dashboardData.profile?.lastAssessment);
  const hasProgressData = Number(progress.totalTasks || 0) > 0;

  const riskMeta = getRiskMeta({ riskLevel, score });
  const stressType = resolvePrimaryStressType({ categories: stress, riskLevel, score });
  const mainIssue = getMainIssue(stress);
  const { trend, message } = useMemo(() => getTrendAndMessage(weeklyStats), [weeklyStats]);
  const greeting = getGreeting(dashboardData.profile.name || "Student");
  const lastSevenStats = useMemo(
    () => [...(Array.isArray(weeklyStats) ? weeklyStats : [])]
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))
      .slice(-7),
    [weeklyStats]
  );
  const previousRisk = Number(lastSevenStats[lastSevenStats.length - 2]?.riskScore ?? lastSevenStats[lastSevenStats.length - 2]?.score ?? score);
  const currentRisk = Number(lastSevenStats[lastSevenStats.length - 1]?.riskScore ?? lastSevenStats[lastSevenStats.length - 1]?.score ?? score);
  const riskDelta = Number((previousRisk - currentRisk).toFixed(1));
  const riskTrendText = riskDelta > 0 ? `Risk reduced by ${riskDelta}% 📉` : riskDelta < 0 ? `Risk increased by ${Math.abs(riskDelta)}% 📈` : "Risk unchanged today";

  useEffect(() => {
    console.log("Dashboard State:", dashboardData);
  }, [dashboardData]);

  if (!userId) {
    return <div className="p-10 text-center text-gray-500">Please log in to access your dashboard.</div>;
  }

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <Header
        greeting={greeting}
        quote={{ text: quote || "Progress over perfection.", author: "Wellness" }}
        stressType={stressType}
        streak={dashboardData.profile.streak || 1}
      />

      {/* Pending Session Requests */}
      {appointments.some((appt) => appt.status === "pending") && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 p-6 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-blue-900">📅 Pending Session Requests</h3>
            <p className="text-sm text-blue-700 mt-1">Review and confirm your upcoming counseling sessions</p>
          </div>

          <div className="space-y-3">
            {appointments.filter((appt) => appt.status === "pending").map((appt) => (
              <Motion.div
                key={appt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-white p-4 border border-blue-100 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{appt.counsellorName || "Counsellor"}</p>
                    <p className="text-sm text-slate-600 mt-1">{appt.message || "General support session"}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {appt.date || "Date TBD"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {appt.time || "Time TBD"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        try {
                          await updateAppointmentStatus(appt.id, "accepted");
                        } catch (error) {
                          console.error("Failed to accept appointment:", error);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Accept
                    </Motion.button>
                    <Motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        try {
                          await updateAppointmentStatus(appt.id, "rejected");
                        } catch (error) {
                          console.error("Failed to reject appointment:", error);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Motion.button>
                  </div>
                </div>
              </Motion.div>
            ))}
          </div>
        </Motion.div>
      )}

      {/* Upcoming Sessions */}
      {appointments.some((appt) => appt.status === "accepted") && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-6 shadow-sm"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-emerald-900">✅ Confirmed Sessions</h3>
            <p className="text-sm text-emerald-700 mt-1">Your upcoming counseling sessions</p>
          </div>

          <div className="space-y-3">
            {appointments.filter((appt) => appt.status === "accepted").map((appt) => (
              <Motion.div
                key={appt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-white p-4 border border-emerald-100 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{appt.counsellorName || "Counsellor"}</p>
                    <p className="text-sm text-slate-600 mt-1">{appt.message || "General support session"}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {appt.date || "Date TBD"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {appt.time || "Time TBD"}
                      </span>
                      <span className="inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                        {appt.mode || "Online"}
                      </span>
                    </div>
                  </div>
                </div>
              </Motion.div>
            ))}
          </div>
        </Motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1.95fr]">
        <StreakCard streak={dashboardData.profile.streak || 1} dayKey={progress.date || getTodayKey()} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <RiskScoreCard data={{ score, riskLevel, hasAssessment }} />

          <DashboardCard className="p-6" glow="from-orange-400/14 via-violet-500/8 to-sky-500/12">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Support status</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black tracking-tight text-[color:var(--text-main)]">{riskMeta.label}</p>
                <p className="soft-text mt-2 text-sm">Primary focus: {stressType}</p>
              </div>
              <div
                className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                  riskMeta.tone === "rose"
                    ? "bg-rose-400/12 text-rose-500"
                    : riskMeta.tone === "amber"
                      ? "bg-amber-400/12 text-amber-500"
                      : "bg-emerald-400/12 text-emerald-500"
                }`}
              >
                {trend}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600">Main Issue: {mainIssue}</span>
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600">{message}</span>
            </div>
          </DashboardCard>

          <CounsellorCard
            data={{
              name: dashboardData.profile.name || "Student",
              assignedCounsellor,
              recommendedCounsellorSpecialization:
                dashboardData.assessment?.recommendedCounsellorSpecialization || "",
              primaryConcern: dashboardData.assessment?.primaryConcern || "general",
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {hasAssessment ? (
          <>
            <MentalHealthPieChart assessment={dashboardData.assessment} />
            <ProgressSection value={progress.percent} hasData={hasProgressData} />
            <DashboardCard className="animated-gradient bg-[linear-gradient(135deg,#08111f_0%,#1d4ed8_40%,#0f766e_100%)] p-5 text-white" glow="from-sky-500/18 via-teal-500/10 to-violet-500/14">
              <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/55">Today&apos;s snapshot</p>
              <p className="mt-3 text-4xl font-black tracking-tight">{progress.completedTasks.length}/{progress.totalTasks || 8}</p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {progress.completedTasks.length}/{progress.totalTasks || 8} tasks completed today
              </p>
              <p className="text-xs text-white/70 mt-1">{riskTrendText}</p>
              <p className="text-xs text-white/70 mt-1">Current streak: {dashboardData.profile.streak || 1} day(s)</p>
              <div className="mt-4 overflow-hidden rounded-full bg-white/10 p-[2px]">
                <div className="animated-gradient h-2 rounded-full bg-[linear-gradient(90deg,#f8fafc_0%,#22d3ee_45%,#f59e0b_100%)]" style={{ width: `${progress.percent}%` }} />
              </div>
            </DashboardCard>
          </>
        ) : (
          <div className="lg:col-span-3 rounded-3xl border border-slate-200/50 bg-gradient-to-br from-blue-50 to-purple-50/30 p-6 text-center">
            <p className="text-lg font-semibold text-slate-700">📊 Complete your assessment to unlock insights</p>
            <p className="text-sm text-slate-600 mt-2">Complete your assessment to initialize personalized tasks and weekly analytics.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StudentResultSummary data={{ latestAssessment: dashboardData.assessment }} />
        <WeeklyTrendChart data={weeklyStats} />
      </div>

      <Recommendations data={{ riskLevel, categories: stress }} />

      <div className="flex items-center justify-center">
        <div className="rounded-full bg-white/35 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)] backdrop-blur">
          <span className="inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-violet-500" /> Adaptive loop active. Live improvements.</span>
        </div>
      </div>
    </Motion.div>
  );
}
