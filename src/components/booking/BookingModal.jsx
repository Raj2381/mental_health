import { motion as Motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock3, X } from "lucide-react";

export default function BookingModal({
  open,
  counsellors = [],
  form,
  booking,
  onClose,
  onChange,
  onSubmit,
}) {
  return (
    <AnimatePresence>
      {open ? (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
        >
          <Motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="glass-panel w-full max-w-xl rounded-[2rem] p-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.26em] text-[color:var(--text-muted)]">Book Session</p>
                <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-main)]">Schedule a counsellor session</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="interactive-surface rounded-2xl p-3 text-[color:var(--text-main)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <label className="block space-y-2">
                <span className="readable-label text-sm font-medium">Counsellor</span>
                <select
                  name="counsellorId"
                  value={form.counsellorId}
                  onChange={onChange}
                  className="field-control"
                >
                  <option value="">Select counsellor</option>
                  {counsellors.map((counsellor) => (
                    <option key={counsellor.id} value={counsellor.id}>
                      {counsellor.name} {counsellor.specialization ? `• ${counsellor.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="inline-flex items-center gap-2 readable-label text-sm font-medium">
                    <CalendarDays className="h-4 w-4 text-sky-500" />
                    Date
                  </span>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={onChange}
                    className="field-control"
                  />
                </label>
                <label className="block space-y-2">
                  <span className="inline-flex items-center gap-2 readable-label text-sm font-medium">
                    <Clock3 className="h-4 w-4 text-violet-500" />
                    Time
                  </span>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={onChange}
                    className="field-control"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="readable-label text-sm font-medium">Session reason</span>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={onChange}
                  className="field-control"
                  placeholder="Briefly describe what you want help with..."
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="interactive-surface rounded-full px-5 py-3 text-sm font-semibold text-[color:var(--text-main)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
                >
                  Cancel
                </button>
                <Motion.button
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={booking}
                  className="animated-gradient rounded-full bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#8b5cf6_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[0_24px_44px_-26px_rgba(37,99,235,0.8)] disabled:opacity-60"
                >
                  {booking ? "Booking..." : "Confirm Booking"}
                </Motion.button>
              </div>
            </form>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
}
