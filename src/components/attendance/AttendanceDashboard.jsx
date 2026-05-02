import { motion as Motion } from "framer-motion";
import { AlertTriangle, BarChart3, BookOpen } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";
import AttendanceCard from "./AttendanceCard";
import AnalyticsChart from "../dashboard/AnalyticsChart";

export default function AttendanceDashboard({
  subjects,
  overall,
  trendData,
  onMarkAttendance,
}) {
  return (
    <>
      {overall.lowSubjects > 0 && (
        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-rose-300/30 bg-gradient-to-br from-rose-500/16 to-orange-500/10 p-5"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <p className="text-base font-semibold text-[color:var(--text-main)]">
              Danger alert: {overall.lowSubjects} subject{overall.lowSubjects > 1 ? "s are" : " is"} below 60% attendance.
            </p>
          </div>
        </Motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <DashboardCard className="p-6" glow="from-amber-500/16 via-sky-500/8 to-violet-500/10">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-emerald-500" />
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--text-main)]">Realtime attendance summary</h2>
              <p className="soft-text mt-1 text-sm">Percentages, risks, and recovery targets update instantly from Firestore.</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Overall</p>
              <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.percentage}%</p>
            </div>
            <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Subjects</p>
              <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{subjects.length}</p>
            </div>
            <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Need recovery</p>
              <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.classesNeeded}</p>
            </div>
            <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Safe skips</p>
              <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.safeToSkip}</p>
            </div>
          </div>
        </DashboardCard>

        <AnalyticsChart
          title="Attendance Trend"
          data={trendData}
          lines={[{ dataKey: "attendance", color: "#22c55e" }]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <AttendanceCard
            key={subject.id}
            subject={subject}
            onAttended={() => onMarkAttendance(subject.id, "attended")}
            onMissed={() => onMarkAttendance(subject.id, "missed")}
          />
        ))}
        {subjects.length === 0 && (
          <DashboardCard className="p-6" glow="from-slate-500/10 via-sky-500/6 to-transparent">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-[color:var(--text-muted)]" />
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--text-main)]">No subjects yet</h3>
                <p className="soft-text mt-1 text-sm">Add your first subject to start tracking attendance automatically.</p>
              </div>
            </div>
          </DashboardCard>
        )}
      </div>
    </>
  );
}
