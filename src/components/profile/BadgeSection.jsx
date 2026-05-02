import { motion as Motion } from "framer-motion";
import { Award, Sparkles, Star } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

const iconMap = [Award, Star, Sparkles];

export default function BadgeSection({ badges = [], level = "Beginner", xp = 0 }) {
  const safeBadges = badges.length ? badges : ["Momentum builder", "Profile complete", "Wellness starter"];

  return (
    <DashboardCard className="p-6" glow="from-orange-400/18 via-violet-500/12 to-sky-500/10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
            Achievements
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Badges and level</h2>
        </div>
        <div className="rounded-[1.3rem] border border-white/40 bg-white/40 px-4 py-3 backdrop-blur dark:bg-white/5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Current level</p>
          <p className="mt-1 text-lg font-semibold text-[color:var(--text-main)]">{level}</p>
          <p className="text-sm text-[color:var(--text-muted)]">{xp} XP</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {safeBadges.map((badge, index) => {
          const Icon = iconMap[index % iconMap.length];
          return (
            <Motion.div
              key={badge}
              whileHover={{ y: -6, scale: 1.03, boxShadow: "0 24px 60px -36px rgba(249,115,22,0.55)" }}
              whileTap={{ scale: 0.98 }}
              className="rounded-[1.6rem] border border-white/35 bg-white/35 p-5 backdrop-blur-xl dark:bg-white/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(251,146,60,0.2),rgba(139,92,246,0.16))]">
                <Icon className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[color:var(--text-main)]">{badge}</h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">
                Keep stacking healthy habits to unlock stronger momentum and new profile milestones.
              </p>
            </Motion.div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
