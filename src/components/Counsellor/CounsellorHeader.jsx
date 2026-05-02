import { motion as Motion } from "framer-motion";

export default function CounsellorHeader({ totalStudents = 0, highRiskCount = 0 }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Counsellor Workspace
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Student Risk Monitoring Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Read-only student wellness analytics and session prioritization.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:w-auto">
          <div className="rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
            <p className="text-xs text-slate-500">Students</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{totalStudents}</p>
          </div>
          <div className="rounded-xl bg-rose-50 px-4 py-3 border border-rose-200">
            <p className="text-xs text-rose-600">High Risk</p>
            <p className="mt-1 text-xl font-semibold text-rose-700">{highRiskCount}</p>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
