import { motion as Motion } from "framer-motion";
import { BookOpen, CheckCircle2, TrendingUp, XCircle } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

export default function AttendanceCard({ subject, onAttended, onMissed, disabled = false }) {
  const percentage = Number(subject.percentage || 0);
  const classesNeeded = Number(subject.classesNeeded || 0);
  const safeToSkip = Number(subject.safeToSkip || 0);
  const isInitialized = Boolean(subject.isInitialized);
  const color =
    percentage >= 75 ? "#22c55e" :
    percentage >= 60 ? "#f59e0b" :
    "#ef4444";

  const radius = 48;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <DashboardCard className="p-5" glow="from-sky-500/12 via-violet-500/8 to-teal-500/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Subject</p>
          <h3 className="mt-2 text-xl font-semibold text-[color:var(--text-main)]">{subject.subjectName}</h3>
          <p className="soft-text mt-1 text-sm">{subject.attendedClasses}/{subject.totalClasses} classes attended</p>
        </div>
        <div
          className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur"
          style={{
            backgroundColor: `${color}18`,
            color,
          }}
        >
          {percentage >= 75 ? "Good" : percentage >= 60 ? "Warning" : "Danger"}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="relative">
          <svg height={radius * 2} width={radius * 2}>
            <circle
              stroke="rgba(148,163,184,0.18)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <Motion.circle
              stroke={color}
              fill="transparent"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-black text-[color:var(--text-main)]">{percentage.toFixed(1)}</p>
            <p className="text-xs text-[color:var(--text-muted)]">%</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Classes needed</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--text-main)]">{classesNeeded}</p>
          </div>
          <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--text-muted)]">Safe to skip</p>
            <p className="mt-1 text-lg font-semibold text-[color:var(--text-main)]">{safeToSkip}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
        <BookOpen className="h-4 w-4" />
        <span>{percentage < 60 ? "Danger alert: improve urgently" : percentage < 75 ? "Stay consistent to protect your buffer" : "Healthy attendance momentum"}</span>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
        <TrendingUp className="h-4 w-4" />
        <span>{classesNeeded > 0 ? `You need to attend ${classesNeeded} classes to reach 75%.` : `You can safely skip ${safeToSkip} class${safeToSkip === 1 ? "" : "es"} right now.`}</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onAttended}
          disabled={disabled || !isInitialized || subject.updating}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/14 px-4 py-3 text-sm font-semibold text-emerald-600 backdrop-blur transition duration-200 hover:bg-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300"
        >
          <CheckCircle2 className="h-4 w-4" />
          Attended
        </Motion.button>
        <Motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onMissed}
          disabled={disabled || !isInitialized || subject.updating}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500/14 px-4 py-3 text-sm font-semibold text-rose-600 backdrop-blur transition duration-200 hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-rose-300"
        >
          <XCircle className="h-4 w-4" />
          Missed
        </Motion.button>
      </div>
      {!isInitialized ? (
        <p className="mt-3 text-sm font-medium text-amber-500">
          Initialize this subject once before using daily attendance actions.
        </p>
      ) : null}
    </DashboardCard>
  );
}
