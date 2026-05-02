import { motion as Motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Siren, Sparkles } from "lucide-react";

const TONE_MAP = {
  emerald: {
    icon: ShieldCheck,
    card: "from-emerald-500/16 to-teal-500/10 border-emerald-300/30",
    text: "text-emerald-600 dark:text-emerald-300",
  },
  amber: {
    icon: Sparkles,
    card: "from-amber-500/18 to-orange-500/10 border-amber-300/30",
    text: "text-amber-600 dark:text-amber-300",
  },
  rose: {
    icon: Siren,
    card: "from-rose-500/18 to-fuchsia-500/10 border-rose-300/30",
    text: "text-rose-600 dark:text-rose-300",
  },
};

export default function PredictionBanner({ prediction }) {
  const tone = TONE_MAP[prediction?.tone] || TONE_MAP.amber;
  const Icon = tone.icon;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[2rem] border bg-gradient-to-br p-6 shadow-[0_25px_80px_-40px_var(--shadow-strong)] ${tone.card}`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className={`rounded-2xl bg-white/70 p-3 ${tone.text}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Prediction System</p>
            <h3 className="mt-2 text-2xl font-bold text-[color:var(--text-main)]">{prediction?.title || "Needs Attention"}</h3>
            <p className="soft-text mt-2 max-w-2xl text-sm leading-7">{prediction?.message}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-main)]">
                Reason: {prediction?.reason || "Signals are stable"}
              </div>
              <div className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-main)]">
                Trend: {prediction?.trend || "Stable"}
              </div>
              <div className="rounded-full bg-white/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-main)]">
                Confidence: {prediction?.confidence || "Low"}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[1.5rem] bg-white/55 px-5 py-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Suggested actions</p>
          <div className="mt-3 space-y-2">
            {(prediction?.actions || []).map((action) => (
              <p key={action} className="inline-flex items-center gap-2 text-sm text-[color:var(--text-main)]">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                {action}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
