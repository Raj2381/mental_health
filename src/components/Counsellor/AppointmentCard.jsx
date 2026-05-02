import { motion as Motion } from "framer-motion";
import { CalendarClock, CheckCircle2, Hourglass, XCircle } from "lucide-react";

export default function AppointmentCard({ appointment, onStatusChange }) {
  const status = String(appointment.status || "pending").toLowerCase();
  const initiatedBy = String(appointment.initiatedBy || "counselor").toLowerCase();
  
  const tone =
    status === "accepted" ? "bg-emerald-500/14 text-emerald-600 dark:text-emerald-300" :
    status === "rejected" ? "bg-rose-500/14 text-rose-600 dark:text-rose-300" :
    status === "completed" ? "bg-sky-500/14 text-sky-600 dark:text-sky-300" :
    initiatedBy === "counselor" ? "bg-blue-500/14 text-blue-600 dark:text-blue-300" :
    "bg-amber-500/14 text-amber-600 dark:text-amber-300";

  const displayStatus = initiatedBy === "counselor" && status === "pending" ? "request sent" : status;

  return (
    <div className="surface-card rounded-[1.4rem] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[color:var(--text-main)]">{appointment.studentName || "Student"}</p>
          <p className="readable-muted mt-1 text-sm">{appointment.message || "General support request"}</p>
        </div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${tone}`}>
          {displayStatus}
        </span>
      </div>

      <div className="mt-3 inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
        <CalendarClock className="h-4 w-4" />
        {appointment.date || "Date TBD"} at {appointment.time || "Time TBD"}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {status === "pending" && initiatedBy !== "counselor" ? (
          <>
            <Motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onStatusChange(appointment.id, "accepted")}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Accept
            </Motion.button>
            <Motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onStatusChange(appointment.id, "rejected")}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject
            </Motion.button>
          </>
        ) : null}
        {status === "accepted" ? (
          <Motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onStatusChange(appointment.id, "completed")}
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
          >
            <Hourglass className="h-3.5 w-3.5" />
            Mark Complete
          </Motion.button>
        ) : null}
      </div>
    </div>
  );
}
