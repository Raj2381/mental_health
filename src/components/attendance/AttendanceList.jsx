import { motion as Motion } from "framer-motion";
import { AlertTriangle, BookOpen } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";
import AttendanceCard from "./AttendanceCard";

export default function AttendanceList({ subjects, onMarkAttendance, disabled = false }) {
  return (
    <>
      {subjects.some((subject) => Number(subject.percentage || 0) < 60) && (
        <Motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-rose-300/30 bg-gradient-to-br from-rose-500/16 to-orange-500/10 p-5"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <p className="text-base font-semibold text-[color:var(--text-main)]">
              Danger alert: {subjects.filter((subject) => Number(subject.percentage || 0) < 60).length} subject
              {subjects.filter((subject) => Number(subject.percentage || 0) < 60).length > 1 ? "s are" : " is"} below 60% attendance.
            </p>
          </div>
        </Motion.div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <AttendanceCard
            key={subject.id}
            subject={subject}
            disabled={disabled}
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
                <p className="soft-text mt-1 text-sm">Add your first subject and it will appear here instantly.</p>
              </div>
            </div>
          </DashboardCard>
        )}
      </div>
    </>
  );
}
