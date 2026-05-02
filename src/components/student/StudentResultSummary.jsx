function formatConcern(value) {
  return String(value || "general").replace(/([A-Z])/g, " $1").trim();
}

function formatDate(value) {
  if (!value) return "Just now";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function StudentResultSummary({ data }) {
  const assessment = data?.latestAssessment;
  const categories = data?.latestAssessment?.categories || data?.latestAssessment?.categoryScores || {};
  const score = data?.latestAssessment?.score ?? data?.latestAssessment?.totalScore ?? 0;
  const riskLevel = data?.latestAssessment?.riskLevel ?? "Low";

  if (!assessment) {
    return (
      <DashboardCard className="p-6" glow="from-violet-500/16 via-sky-500/8 to-orange-400/10">
        <h3 className="text-xl font-semibold text-[color:var(--text-main)]">Assessment Summary</h3>
        <p className="soft-text mt-4 text-sm">Complete your assessment to view your results.</p>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className="p-6" glow="from-violet-500/16 via-sky-500/8 to-orange-400/10">
      <h3 className="text-xl font-semibold text-[color:var(--text-main)]">Assessment Summary</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] bg-white/40 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Latest result</p>
          <div className="mt-3 space-y-2 text-sm text-[color:var(--text-main)]">
            <p>Risk Level: <span className="font-medium capitalize">{riskLevel}</span></p>
            <p>Risk Score: <span className="font-medium">{Math.round(score)}</span></p>
            <p>Status: <span className="font-medium">Active</span></p>
          </div>
        </div>

        <div className="animated-gradient rounded-[1.5rem] bg-[linear-gradient(135deg,#08111f_0%,#1d4ed8_45%,#7c3aed_100%)] p-4 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">Stress breakdown</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-white/60">Academic</span><p className="text-xl font-bold">{Math.round(categories.academic || 0)}</p></div>
            <div><span className="text-white/60">Social</span><p className="text-xl font-bold">{Math.round(categories.social || 0)}</p></div>
            <div><span className="text-white/60">Emotional</span><p className="text-xl font-bold">{Math.round(categories.emotional || 0)}</p></div>
            <div><span className="text-white/60">Sleep</span><p className="text-xl font-bold">{Math.round(categories.sleep || 0)}</p></div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
import { motion as Motion } from "framer-motion";
import DashboardCard from "../dashboard/DashboardCard";
