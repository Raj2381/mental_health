import { motion as Motion } from "framer-motion";
import { Activity, AlertTriangle, Brain, CalendarDays, Gauge, GraduationCap, School, Sparkles, Target, TrendingDown } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";
import ProfileProgress from "./ProfileProgress";
import ProfileForm from "./ProfileForm";
import PerformanceCard from "./PerformanceCard";
import ProfileStats from "./ProfileStats";
import BadgeSection from "./BadgeSection";
import SettingsPanel from "./SettingsPanel";

export default function StudentProfile({
  profile,
  profileProgress,
  errors,
  onChange,
  onSave,
  saving,
  performanceScores,
  attendancePercent,
  attendanceSummary,
  riskSubjects,
  activityPercent,
  weeklyProgress,
  badges,
  xp,
  level,
  personalizedInsight,
  darkMode,
  notificationPreferences,
  passwordForm,
  onToggleDarkMode,
  onTogglePreference,
  onPasswordChange,
  onPasswordSave,
  savingPassword,
}) {
  const studentFieldGroups = [
    [
      { name: "name", label: "Name", placeholder: "Add your full name" },
      { name: "email", label: "Email", type: "email", placeholder: "Add your email" },
      { name: "phone", label: "Phone", placeholder: "Add your phone number" },
      { name: "college", label: "College", placeholder: "Your college name" },
      { name: "course", label: "Course", placeholder: "Your course or program" },
      { name: "year", label: "Year", placeholder: "Current academic year" },
      {
        name: "mentalHealthSummary",
        label: "Wellness summary",
        multiline: true,
        placeholder: "Optional personal wellness summary",
      },
    ],
  ];

  const wellnessItems = [
    {
      label: "Activity",
      value: `${Number(performanceScores?.[0]?.value || 0)}%`,
      icon: <Activity className="h-5 w-5 text-cyan-500" />,
      iconWrapClass: "bg-cyan-500/12",
      help: "Daily checklist completion and routine follow-through.",
    },
    {
      label: "Consistency",
      value: `${Number(performanceScores?.[1]?.value || 0)}%`,
      icon: <Gauge className="h-5 w-5 text-amber-500" />,
      iconWrapClass: "bg-amber-500/12",
      help: "How stable your progress has been over the last week.",
    },
    {
      label: "Mental",
      value: `${Number(performanceScores?.[2]?.value || 0)}%`,
      icon: <Brain className="h-5 w-5 text-violet-500" />,
      iconWrapClass: "bg-violet-500/12",
      help: "A blended score from assessment, activity, and rhythm.",
    },
    {
      label: "XP Level",
      value: level,
      icon: <Sparkles className="h-5 w-5 text-emerald-500" />,
      iconWrapClass: "bg-emerald-500/12",
      help: `${xp} XP earned from attendance, streak, and activity.`,
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <ProfileStats title="Wellness Overview" items={wellnessItems} />
        <PerformanceCard scores={performanceScores} />

        <DashboardCard className="p-6" glow="from-sky-500/16 via-teal-500/12 to-violet-500/12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                Attendance Snapshot
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Academic health</h2>
            </div>
            <div className="rounded-2xl bg-emerald-500/12 p-3">
              <GraduationCap className="h-5 w-5 text-emerald-500" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Overall attendance</p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{Math.round(attendancePercent)}%</p>
              <p className="readable-muted mt-2 text-sm">{attendanceSummary.attendedClasses} of {attendanceSummary.totalClasses} classes attended</p>
            </div>
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Risk subjects</p>
              <p className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{riskSubjects}</p>
              <p className="readable-muted mt-2 text-sm">Subjects currently below the 75% target.</p>
            </div>
            <div className="surface-card rounded-[1.6rem] p-5">
              <p className="readable-label text-sm font-medium">Priority insight</p>
              <p className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-[color:var(--text-main)]">
                <TrendingDown className="h-4 w-4 text-amber-500" />
                {attendancePercent < 75 ? "Attendance dropping" : "Attendance stable"}
              </p>
              <p className="readable-muted mt-2 text-sm">Act early if low-attendance subjects keep increasing.</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard className="p-6" glow="from-sky-500/16 via-teal-500/12 to-violet-500/12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                Goals & Progress
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Daily completion and weekly trend</h2>
            </div>
            <div className="rounded-2xl bg-teal-500/12 p-3">
              <Target className="h-5 w-5 text-teal-500" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.84fr_1.16fr]">
            <div className="space-y-4">
              <div className="surface-card rounded-[1.6rem] p-5">
                <p className="readable-label text-sm font-medium">Daily completion</p>
                <p className="mt-3 text-3xl font-semibold text-[color:var(--text-main)]">{Math.round(activityPercent)}%</p>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/40 dark:bg-white/10">
                  <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(8, activityPercent)}%` }}
                    transition={{ duration: 0.75, ease: "easeOut" }}
                    className="animated-gradient h-full rounded-full bg-[linear-gradient(90deg,#2dd4bf_0%,#0ea5e9_55%,#8b5cf6_100%)]"
                  />
                </div>
              </div>

              <div className="surface-card rounded-[1.6rem] p-5">
                <p className="readable-label text-sm font-medium">Student insight</p>
                <p className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-[color:var(--text-main)]">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  {attendancePercent < 75 ? "Your attendance is dropping" : "Your routine is holding steady"}
                </p>
                <p className="readable-muted mt-2 text-sm leading-6">{personalizedInsight}</p>
              </div>
            </div>

            <div className="surface-card rounded-[1.8rem] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="readable-label text-sm font-medium">Weekly trend</p>
                  <p className="mt-1 text-lg font-semibold text-[color:var(--text-main)]">7-day progress arc</p>
                </div>
                <div className="rounded-2xl bg-sky-500/12 p-3">
                  <CalendarDays className="h-5 w-5 text-sky-500" />
                </div>
              </div>

              <div className="mt-6 flex h-48 items-end gap-3">
                {weeklyProgress.length ? (
                  weeklyProgress.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex flex-1 flex-col items-center gap-3">
                      <div className="flex h-36 w-full items-end justify-center gap-1.5">
                        {[
                          { value: item.activity, color: "from-cyan-400 to-sky-400" },
                          { value: item.consistency, color: "from-violet-400 to-fuchsia-400" },
                          { value: item.mental, color: "from-orange-300 to-amber-400" },
                        ].map((bar, innerIndex) => (
                          <Motion.div
                            key={`${item.label}-${innerIndex}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: `${Math.max(10, bar.value)}%`, opacity: 1 }}
                            transition={{ delay: 0.15 + index * 0.06 + innerIndex * 0.04, duration: 0.55 }}
                            className={`w-full max-w-[18px] rounded-full bg-gradient-to-t ${bar.color}`}
                          />
                        ))}
                      </div>
                      <span className="readable-muted text-xs font-medium">{String(item.label).slice(5)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] border border-dashed border-white/35 text-sm text-[color:var(--text-muted)]">
                    More daily metrics will appear here as you use the dashboard.
                  </div>
                )}
              </div>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="space-y-6">
        <BadgeSection badges={badges} level={level} xp={xp} />

        <DashboardCard className="p-6" glow="from-violet-500/14 via-orange-400/12 to-transparent">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
                Student Guidance
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">What needs attention</h2>
            </div>
            <div className="rounded-2xl bg-violet-500/12 p-3">
              <School className="h-5 w-5 text-violet-500" />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="surface-card rounded-[1.5rem] p-5">
              <p className="readable-label text-sm font-medium">Current focus</p>
              <p className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">
                {attendancePercent < 75 ? "Stabilize attendance and routine" : "Keep momentum high"}
              </p>
              <p className="readable-muted mt-2 text-sm leading-6">{personalizedInsight}</p>
            </div>
          </div>
        </DashboardCard>

        <SettingsPanel
          darkMode={darkMode}
          notificationPreferences={notificationPreferences}
          passwordForm={passwordForm}
          onToggleDarkMode={onToggleDarkMode}
          onTogglePreference={onTogglePreference}
          onPasswordChange={onPasswordChange}
          onPasswordSave={onPasswordSave}
          savingPassword={savingPassword}
        />
      </div>
    </div>
  );
}
