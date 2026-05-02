import { AlertTriangle, BarChart3, Layers3, ShieldCheck } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

export default function AttendanceSummary({ overall }) {
  return (
    <DashboardCard className="p-6" glow="from-amber-500/16 via-sky-500/8 to-violet-500/10">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-emerald-500" />
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--text-main)]">Realtime attendance summary</h2>
          <p className="soft-text mt-1 text-sm">Overall percentage, target risk, and safe bunk space refresh instantly from Firestore.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Overall</p>
          <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.percentage}%</p>
        </div>
        <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Subjects</p>
          <p className="mt-2 text-2xl font-black text-[color:var(--text-main)]">{overall.totalSubjects}</p>
        </div>
        <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Below 75%</p>
          <div className="mt-2 inline-flex items-center gap-2 text-2xl font-black text-[color:var(--text-main)]">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {overall.belowTarget}
          </div>
        </div>
        <div className="rounded-2xl bg-white/45 px-4 py-3 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Safe bunk</p>
          <div className="mt-2 inline-flex items-center gap-2 text-2xl font-black text-[color:var(--text-main)]">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            {overall.safeToSkip}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/40 px-4 py-3 backdrop-blur">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--text-main)]">
          <Layers3 className="h-4 w-4 text-sky-500" />
          {overall.attended}/{overall.total} total classes tracked
        </div>
      </div>
    </DashboardCard>
  );
}
