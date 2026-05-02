import { motion as Motion } from "framer-motion";
import DashboardCard from "./dashboard/DashboardCard";

export default function ProgressSection({ value = 0, hasData = true }) {
  const displayValue = Math.max(0, Math.min(100, value ?? 0));
  const isEmpty = !hasData;
  
  return (
    <DashboardCard className="p-6" glow="from-sky-500/14 via-indigo-500/10 to-violet-500/14">
      <p className="text-sm font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Completion</p>
      {!isEmpty ? <div className="mt-5 overflow-hidden rounded-full bg-white/50 p-[2px]">
        <Motion.div
          className="animated-gradient h-3 rounded-full bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_45%,#7c3aed_100%)]"
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div> : null}
      <div className={`mt-4 flex ${isEmpty ? "items-center" : "items-end"} justify-between gap-3`}>
        <p className="text-4xl font-black tracking-tight text-[color:var(--text-main)]">{displayValue}%</p>
        <p className="soft-text text-sm font-medium">
          {isEmpty
            ? "Start your daily activities to track progress"
            : "of today&apos;s wellness plan complete"}
        </p>
      </div>
    </DashboardCard>
  );
}
