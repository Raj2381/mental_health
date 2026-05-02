import { motion as Motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import DashboardCard from "./DashboardCard";

function TrendIcon({ direction }) {
  if (direction === "up") return <ArrowUpRight className="h-4 w-4" />;
  if (direction === "down") return <ArrowDownRight className="h-4 w-4" />;
  return <Minus className="h-4 w-4" />;
}

export default function ProgressCard({ title, value = 0, trend, accent = "from-sky-500/20 to-violet-500/10" }) {
  return (
    <DashboardCard className="p-5" glow={accent}>
      <p className="text-xs font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">{title}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-4xl font-black text-[color:var(--text-main)]">{value}</p>
        <div className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          trend?.direction === "up"
            ? "bg-emerald-500/12 text-emerald-500 dark:text-emerald-300"
            : trend?.direction === "down"
              ? "bg-rose-500/12 text-rose-500 dark:text-rose-300"
              : "bg-slate-500/12 text-slate-500 dark:text-slate-300"
        }`}>
          <TrendIcon direction={trend?.direction} />
          {trend?.label || "Stable"}
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/45">
        <Motion.div
          className="animated-gradient h-2 rounded-full bg-[linear-gradient(90deg,#22d3ee_0%,#3b82f6_45%,#8b5cf6_100%)]"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </DashboardCard>
  );
}
