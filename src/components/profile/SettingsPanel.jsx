import { motion as Motion } from "framer-motion";
import { Bell, Lock, MoonStar, SunMedium } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

function ToggleRow({ icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-white/35 bg-white/35 px-4 py-4 backdrop-blur-xl dark:bg-white/5">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/50 p-3 dark:bg-white/5">{icon}</div>
        <div>
          <p className="text-sm font-semibold text-[color:var(--text-main)]">{label}</p>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">{description}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-8 w-14 rounded-full transition ${
          checked ? "bg-[linear-gradient(135deg,#22d3ee,#8b5cf6)]" : "bg-slate-300/70 dark:bg-slate-700"
        }`}
      >
        <Motion.span
          layout
          className="absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
          style={{ left: checked ? 32 : 4 }}
        />
      </button>
    </div>
  );
}

export default function SettingsPanel({
  darkMode,
  notificationPreferences,
  passwordForm,
  onToggleDarkMode,
  onTogglePreference,
  onPasswordChange,
  onPasswordSave,
  savingPassword,
}) {
  return (
    <DashboardCard className="p-6" glow="from-sky-500/16 via-violet-500/12 to-transparent">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">
            Account Settings
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Preferences and security</h2>
        </div>
        <div className="rounded-2xl border border-white/35 bg-white/35 p-3 backdrop-blur dark:bg-white/5">
          {darkMode ? <MoonStar className="h-5 w-5 text-violet-500" /> : <SunMedium className="h-5 w-5 text-amber-500" />}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <ToggleRow
          icon={darkMode ? <MoonStar className="h-4 w-4 text-[color:var(--text-main)]" /> : <SunMedium className="h-4 w-4 text-[color:var(--text-main)]" />}
          label="Dark mode"
          description="Switch the profile workspace to a calmer evening theme."
          checked={darkMode}
          onChange={onToggleDarkMode}
        />
        <ToggleRow
          icon={<Bell className="h-4 w-4 text-[color:var(--text-main)]" />}
          label="Reminders"
          description="Receive daily routine reminders and wellness nudges."
          checked={Boolean(notificationPreferences?.reminders)}
          onChange={() => onTogglePreference("reminders")}
        />
        <ToggleRow
          icon={<Bell className="h-4 w-4 text-[color:var(--text-main)]" />}
          label="Updates"
          description="Get notified about dashboard changes and counsellor actions."
          checked={Boolean(notificationPreferences?.updates)}
          onChange={() => onTogglePreference("updates")}
        />
      </div>

      <div className="mt-6 rounded-[1.6rem] border border-white/35 bg-white/35 p-5 backdrop-blur-xl dark:bg-white/5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/55 p-3 dark:bg-white/5">
            <Lock className="h-4 w-4 text-[color:var(--text-main)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--text-main)]">Change password</p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Keep your account protected with a stronger password.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <input
            type="password"
            name="nextPassword"
            value={passwordForm.nextPassword}
            onChange={onPasswordChange}
            placeholder="New password"
            className="w-full rounded-[1.25rem] border border-white/35 bg-white/50 px-4 py-3 text-sm text-[color:var(--text-main)] outline-none transition focus:-translate-y-0.5 focus:border-sky-300 dark:bg-white/5"
          />
          <input
            type="password"
            name="confirmPassword"
            value={passwordForm.confirmPassword}
            onChange={onPasswordChange}
            placeholder="Confirm password"
            className="w-full rounded-[1.25rem] border border-white/35 bg-white/50 px-4 py-3 text-sm text-[color:var(--text-main)] outline-none transition focus:-translate-y-0.5 focus:border-sky-300 dark:bg-white/5"
          />
        </div>

        <Motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onPasswordSave}
          disabled={savingPassword}
          className="mt-5 rounded-full border border-white/45 bg-white/65 px-5 py-3 text-sm font-semibold text-[color:var(--text-main)] shadow-[0_20px_50px_-34px_rgba(59,130,246,0.9)] backdrop-blur disabled:opacity-60 dark:bg-white/10"
        >
          {savingPassword ? "Updating..." : "Update password"}
        </Motion.button>
      </div>
    </DashboardCard>
  );
}
