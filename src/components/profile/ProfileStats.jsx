import { motion as Motion } from "framer-motion";
import DashboardCard from "../dashboard/DashboardCard";

export default function ProfileStats({ title, items = [], glow = "from-sky-500/16 via-violet-500/10 to-transparent" }) {
  return (
    <DashboardCard className="p-6" glow={glow}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
            {title}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">At a glance</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <Motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.35 }}
            className="surface-card rounded-[1.6rem] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="readable-label text-sm font-medium">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-[color:var(--text-main)]">{item.value}</p>
              </div>
              {item.icon ? (
                <div className={`rounded-2xl p-3 ${item.iconWrapClass || "bg-white/60 dark:bg-white/10"}`}>
                  {item.icon}
                </div>
              ) : null}
            </div>
            {item.help ? <p className="readable-muted mt-3 text-sm leading-6">{item.help}</p> : null}
          </Motion.div>
        ))}
      </div>
    </DashboardCard>
  );
}
