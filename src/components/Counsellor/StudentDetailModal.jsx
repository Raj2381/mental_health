import { motion as Motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Calendar, Mail } from "lucide-react";

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

export default function StudentDetailModal({ student, open, onClose, onMessage, onBookSession }) {
  if (!open || !student) return null;

  const category = student.stressBreakdown || {};
  const activity = student.dailyActivities || {};
  const recommendations = Array.isArray(student.recommendations)
    ? student.recommendations
    : [];

  const riskLevelColor = {
    high: "text-red-600 bg-red-50",
    moderate: "text-yellow-600 bg-yellow-50",
    low: "text-green-600 bg-green-50",
  };

  const riskLevel = (student.assessmentLevel || "low").toLowerCase();
  const colorClass = riskLevelColor[riskLevel] || riskLevelColor.low;

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/60 p-4 flex items-center justify-center"
      >
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
              <p className="text-sm text-slate-500">{student.email}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">Risk Overview</h4>
              <StatRow label="Risk Score" value={student.assessmentScore ?? "N/A"} />
              <div className={`rounded-lg px-3 py-2 ${colorClass}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Risk Level</span>
                  <span className="text-sm font-semibold uppercase">{riskLevel}</span>
                </div>
              </div>
              <StatRow 
                label="Primary Concern" 
                value={student.primaryConcern 
                  ? student.primaryConcern.replace(/([A-Z])/g, " $1").trim() 
                  : "General"
                } 
              />
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">Stress Breakdown</h4>
              <StatRow label="Academic" value={category.academic ?? category.academicStress ?? 0} />
              <StatRow label="Emotional" value={category.emotional ?? category.emotionalWellbeing ?? 0} />
              <StatRow label="Social" value={category.social ?? category.socialConnection ?? 0} />
              <StatRow label="Sleep" value={category.sleep ?? category.sleepQuality ?? 0} />
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">Daily Activity</h4>
              {Object.keys(activity).length === 0 ? (
                <p className="text-sm text-slate-500">No daily activity data available.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(activity).slice(0, 4).map(([key, value]) => (
                    <StatRow
                      key={key}
                      label={key}
                      value={value === true ? "✓ Done" : value === false ? "○ Pending" : String(value)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">Recommendations</h4>
              {recommendations.length === 0 ? (
                <p className="text-sm text-slate-500">No recommendations available.</p>
              ) : (
                <ul className="space-y-2">
                  {recommendations.slice(0, 4).map((item, idx) => (
                    <li key={idx} className="text-sm text-slate-700 rounded-lg bg-slate-50 px-3 py-2">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-slate-200 px-6 py-4 flex gap-3 justify-end sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Close
            </button>
            <button
              onClick={() => onMessage && onMessage(student)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-blue-100 hover:bg-blue-200 transition"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
            <button
              onClick={() => onBookSession && onBookSession(student)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition"
            >
              <Calendar className="w-4 h-4" />
              Book Session
            </button>
          </div>
        </div>
      </Motion.div>
    </AnimatePresence>
  );
}
