import { motion as Motion } from "framer-motion";
import DashboardCard from "./DashboardCard";

export default function Header({ greeting, quote, stressType, streak }) {
  return (
    <Motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      <DashboardCard className="p-6 md:p-8" glow="from-sky-500/20 via-violet-500/12 to-orange-400/12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.32em] text-[color:var(--text-muted)]">Daily Wellness</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[color:var(--text-main)] md:text-5xl">{greeting}</h1>
            <p className="soft-text mt-3 max-w-2xl text-sm leading-7 md:text-base">
              Your dashboard is syncing live with today&apos;s routine, wellbeing signals, and support recommendations.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="animated-gradient rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#3b82f6_48%,#8b5cf6_100%)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                {stressType || "balance"} focus
              </span>
              <span className="rounded-full bg-orange-400/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
                {streak} day streak
              </span>
            </div>
          </div>

          <Motion.div
            key={quote?.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="animated-gradient rounded-[1.75rem] border border-white/40 bg-[linear-gradient(135deg,rgba(56,189,248,0.18)_0%,rgba(139,92,246,0.18)_40%,rgba(249,115,22,0.14)_100%)] p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-sky-600 dark:text-sky-300">Quote of the day</p>
            <Motion.p
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.15, ease: "easeOut" }}
              className="mt-4 overflow-hidden whitespace-nowrap text-lg font-semibold leading-8 text-[color:var(--text-main)]"
            >
              &ldquo;{quote?.text}&rdquo;
            </Motion.p>
            <p className="soft-text mt-4 text-sm">{quote?.author}</p>
          </Motion.div>
        </div>
      </DashboardCard>
    </Motion.section>
  );
}
