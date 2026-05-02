import { motion as Motion } from "framer-motion";
import { hoverLift } from "../../utils/motion";

export default function DashboardCard({
  children,
  className = "",
  glow = "from-sky-500/16 via-violet-500/10 to-transparent",
}) {
  return (
    <Motion.div
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={hoverLift}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/45 bg-[color:var(--panel)]/78 shadow-[0_25px_80px_-35px_var(--shadow-strong)] backdrop-blur-xl ${className}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${glow} opacity-90`} />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-white/70" />
      <div className="relative">{children}</div>
    </Motion.div>
  );
}
