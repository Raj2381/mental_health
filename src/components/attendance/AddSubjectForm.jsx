import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

export default function AddSubjectForm({ onSubmit, saving, disabled = false }) {
  const [form, setForm] = useState({
    subjectName: "",
    attendedClasses: "",
    totalClasses: "",
  });
  const [validationError, setValidationError] = useState("");

  const isFormValid = () => {
    const cleanName = form.subjectName.trim();
    const totalClasses = Math.max(0, Number(form.totalClasses || 0));
    return cleanName && totalClasses > 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");
    
    const cleanName = form.subjectName.trim();
    if (!cleanName) {
      setValidationError("Please enter a subject name");
      return;
    }
    
    const attendedClasses = Math.max(0, Number(form.attendedClasses || 0));
    const totalClasses = Math.max(attendedClasses, Number(form.totalClasses || 0));
    
    if (totalClasses === 0) {
      setValidationError("Total classes must be greater than 0");
      return;
    }
    
    const created = await onSubmit?.({
      subjectName: cleanName,
      attendedClasses,
      totalClasses,
    });
    if (created !== false) {
      setForm({
        subjectName: "",
        attendedClasses: "",
        totalClasses: "",
      });
    }
  };

  return (
    <DashboardCard className="p-6" glow="from-sky-500/16 via-violet-500/8 to-teal-500/10">
      <div className="flex items-center gap-3">
        <PlusCircle className="h-6 w-6 text-sky-500" />
        <div>
          <h2 className="text-xl font-semibold text-[color:var(--text-main)]">Initialize subject attendance</h2>
          <p className="soft-text mt-1 text-sm">Enter your current attendance once. After that, updates stay incremental.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-3">
        <input
          value={form.subjectName}
          onChange={(event) => setForm((prev) => ({ ...prev, subjectName: event.target.value }))}
          disabled={disabled}
          placeholder="Subject name"
          type="text"
          className="rounded-2xl border-2 border-white/35 bg-white/45 px-4 py-3 text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] backdrop-blur outline-none transition focus:-translate-y-0.5 focus:border-sky-400 focus:shadow-lg focus:shadow-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <input
          type="number"
          min="0"
          step="1"
          value={form.attendedClasses}
          onChange={(event) => {
            const val = event.target.value;
            const num = Math.max(0, Number(val));
            setForm((prev) => ({ ...prev, attendedClasses: num > 0 ? num.toString() : val }));
          }}
          disabled={disabled}
          placeholder="Attended classes"
          className="rounded-2xl border-2 border-white/35 bg-white/45 px-4 py-3 text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] backdrop-blur outline-none transition focus:-translate-y-0.5 focus:border-sky-400 focus:shadow-lg focus:shadow-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <input
          type="number"
          min="0"
          step="1"
          value={form.totalClasses}
          onChange={(event) => {
            const val = event.target.value;
            const num = Math.max(0, Number(val));
            setForm((prev) => ({ ...prev, totalClasses: num > 0 ? num.toString() : val }));
          }}
          disabled={disabled}
          placeholder="Total classes"
          className="rounded-2xl border-2 border-white/35 bg-white/45 px-4 py-3 text-[color:var(--text-main)] placeholder-[color:var(--text-muted)] backdrop-blur outline-none transition focus:-translate-y-0.5 focus:border-sky-400 focus:shadow-lg focus:shadow-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="md:col-span-3 flex justify-end">
          <Motion.button
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving || disabled || !isFormValid()}
            className="animated-gradient rounded-full bg-[linear-gradient(135deg,#0ea5e9_0%,#2563eb_45%,#8b5cf6_100%)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Initial Attendance"}
          </Motion.button>
        </div>
      </form>
      {validationError && (
        <p className="mt-4 text-sm font-medium text-red-500">{validationError}</p>
      )}
    </DashboardCard>
  );
}
