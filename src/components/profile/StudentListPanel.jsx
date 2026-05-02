import { motion as Motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageSquare, ShieldAlert, UserRound } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

function riskTone(level) {
  const value = String(level || "").toLowerCase();
  if (value.includes("high")) return "bg-rose-500/14 text-rose-600 dark:text-rose-300";
  if (value.includes("moderate")) return "bg-amber-500/14 text-amber-600 dark:text-amber-300";
  return "bg-emerald-500/14 text-emerald-600 dark:text-emerald-300";
}

export default function StudentListPanel({ students = [], latestAssessmentMap = {} }) {
  return (
    <DashboardCard className="p-6" glow="from-rose-500/12 via-violet-500/10 to-sky-500/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
            Assigned Students
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Risk overview</h2>
        </div>
        <div className="rounded-2xl bg-rose-500/12 p-3">
          <ShieldAlert className="h-5 w-5 text-rose-500" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {students.length ? students.map((student, index) => {
          const assessment = latestAssessmentMap[student.id];
          const riskLevel = assessment?.riskLevel || student.assessmentLevel || "low";
          return (
            <Motion.div
              key={student.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              className="surface-card rounded-[1.4rem] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--text-main)]">{student.name || "Student"}</p>
                  <p className="readable-muted mt-1 text-sm">{assessment?.primaryConcern || "General wellbeing support"}</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${riskTone(riskLevel)}`}>
                  {riskLevel}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/dashboard/counsellor"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/60 px-3 py-2 text-xs font-semibold text-[color:var(--text-main)] transition hover:-translate-y-0.5 hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 dark:bg-white/10"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  View Profile
                </Link>
                <Link
                  to="/messages"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Start Chat
                </Link>
              </div>
            </Motion.div>
          );
        }) : (
          <div className="rounded-[1.4rem] border border-dashed border-white/35 p-5 text-sm text-[color:var(--text-muted)]">
            No assigned students yet.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
