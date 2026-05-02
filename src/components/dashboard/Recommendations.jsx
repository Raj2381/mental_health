import { motion as Motion } from "framer-motion";
import { Brain, MoonStar, Sparkles, Users, Zap } from "lucide-react";
import { generateDailyRecommendations } from "../../utils/dashboardPersonalization";
import DashboardCard from "./DashboardCard";

const ACCENT_STYLES = {
  rose: "from-rose-500/18 via-orange-400/10 to-transparent text-rose-500",
  sky: "from-sky-500/18 via-cyan-400/10 to-transparent text-sky-500",
  amber: "from-amber-500/18 via-orange-400/10 to-transparent text-amber-500",
  indigo: "from-indigo-500/18 via-violet-400/10 to-transparent text-indigo-500",
  emerald: "from-emerald-500/18 via-lime-400/10 to-transparent text-emerald-500",
  violet: "from-violet-500/18 via-fuchsia-400/10 to-transparent text-violet-500",
  orange: "from-orange-500/18 via-amber-400/10 to-transparent text-orange-500",
  teal: "from-teal-500/18 via-cyan-400/10 to-transparent text-teal-500",
};

const ICON_MAP = {
  social: Users,
  academic: Brain,
  sleep: MoonStar,
  movement: Zap,
  checkin: Sparkles,
  tasks: Zap,
  counsellor: Brain,
  maintain: Sparkles,
};

export default function Recommendations({ data }) {
  const items = Array.isArray(data?.recommendations) && data.recommendations.length > 0
    ? data.recommendations
    : generateDailyRecommendations(data, data?.dailyActivities);

  return (
    <DashboardCard className="p-6" glow="from-violet-500/16 via-sky-500/8 to-teal-500/12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-[color:var(--text-main)]">AI Recommendations</h3>
          <p className="soft-text mt-1 text-sm">Refreshed daily from your risk score, stress profile, and missed activities.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, i) => (
          <Motion.button
            key={item.id || i}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -6, scale: 1.03, boxShadow: "0 25px 70px -30px rgba(59,130,246,0.38)" }}
            whileTap={{ scale: 0.98 }}
            className={`rounded-[1.6rem] border border-white/35 bg-gradient-to-br p-5 text-left backdrop-blur-xl ${ACCENT_STYLES[item.accent] || ACCENT_STYLES.sky}`}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 shadow-sm">
              {(() => {
                const Icon = ICON_MAP[item.id] || Sparkles;
                return <Icon className="h-5 w-5" />;
              })()}
            </div>
            <h4 className="mt-4 text-base font-semibold text-[color:var(--text-main)]">{item.title || item}</h4>
            <p className="soft-text mt-2 text-sm leading-6">{item.description || item.desc || "Personalized from your current wellness trends."}</p>
          </Motion.button>
        ))}
      </div>
    </DashboardCard>
  );
}
