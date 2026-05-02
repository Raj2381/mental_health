import { motion as Motion } from "framer-motion";
import { Flame, CalendarDays } from "lucide-react";
import DashboardCard from "./DashboardCard";

export default function StreakCard({ streak, dayKey }) {
  const history = Array.from({ length: 7 }, (_, index) => {
    const value = Math.max(24, 34 + ((index * 17 + streak * 9) % 52));
    return { id: index, value };
  });

  return (
    <Motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <DashboardCard
        className="shimmer-sweep animated-gradient overflow-hidden bg-[linear-gradient(135deg,#f97316_0%,#fb7185_42%,#7c3aed_100%)] p-6 text-white"
        glow="from-orange-400/24 via-rose-500/16 to-violet-500/18"
      >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/70">Consistency</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">{streak} days</h2>
          <p className="mt-2 max-w-sm text-sm text-white/80">Your streak updates automatically when you log in or complete a daily activity.</p>
        </div>
        <Motion.div
          animate={{ y: [0, -4, 0], rotate: [0, -6, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-2xl bg-white/15 p-3 backdrop-blur"
        >
          <Flame className="h-7 w-7" />
        </Motion.div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
          <span className="text-sm text-white/80">Last active date</span>
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="h-4 w-4" />
            {dayKey || "Today"}
          </span>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">Weekly rhythm</p>
          <div className="mt-3 flex h-16 items-end gap-2">
            {history.map((item, index) => (
              <Motion.div
                key={item.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${item.value}%`, opacity: 1 }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="w-full rounded-full bg-white/70"
              />
            ))}
          </div>
        </div>
      </div>
      </DashboardCard>
    </Motion.div>
  );
}
