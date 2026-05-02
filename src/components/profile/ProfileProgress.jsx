import { motion as Motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

function labelize(field) {
  return String(field)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

export default function ProfileProgress({ completion, missingFields = [], isReady }) {
  return (
    <DashboardCard className="p-6" glow="from-emerald-500/14 via-sky-500/10 to-violet-500/12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
            Profile Progress
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">{completion}% complete</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
            {isReady
              ? "Your profile is complete enough to unlock interactive features."
              : "Complete the missing fields below to unlock chat, attendance updates, and richer predictions."}
          </p>
        </div>
        <div className={`rounded-[1.4rem] px-4 py-3 text-sm font-semibold ${
          isReady
            ? "bg-emerald-500/14 text-emerald-600 dark:text-emerald-300"
            : "bg-amber-500/14 text-amber-600 dark:text-amber-300"
        }`}>
          {isReady ? "Features unlocked" : "Action needed"}
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/35 dark:bg-white/10">
        <Motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(6, completion)}%` }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="animated-gradient h-full rounded-full bg-[linear-gradient(90deg,#22c55e_0%,#0ea5e9_48%,#8b5cf6_100%)]"
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {missingFields.length ? (
          missingFields.map((field) => (
            <div
              key={field}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/35 px-4 py-3 text-sm text-[color:var(--text-main)] backdrop-blur-xl dark:bg-white/5"
            >
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Missing {labelize(field)}
            </div>
          ))
        ) : (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/35 px-4 py-3 text-sm text-[color:var(--text-main)] backdrop-blur-xl dark:bg-white/5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            All required profile fields are complete
          </div>
        )}
        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/35 px-4 py-3 text-sm text-[color:var(--text-main)] backdrop-blur-xl dark:bg-white/5">
          <Lock className="h-4 w-4 text-sky-500" />
          Minimum 60% profile completion is required for gated features
        </div>
      </div>
    </DashboardCard>
  );
}
