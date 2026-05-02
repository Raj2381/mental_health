import { motion as Motion } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import DashboardCard from "./DashboardCard";
import { Sparkles } from "lucide-react";
import { shouldShowSampleDataMessage } from "../../utils/analyticsDataGenerator";

export default function AnalyticsChart({ title, data = [], lines = [] }) {
  const isShowingSample = shouldShowSampleDataMessage(data);
  
  // Ensure we always have data to display (never show empty state)
  const chartData = data && data.length > 0 ? data : [];

  return (
    <Motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <DashboardCard className="p-6" glow="from-sky-500/12 via-violet-500/8 to-teal-500/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[color:var(--text-main)]">{title}</h3>
            <p className="soft-text mt-1 text-sm">Weekly and monthly wellness movement.</p>
          </div>
          {isShowingSample && (
            <div className="flex items-center gap-2 ml-auto">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-xs text-blue-300/80 font-medium">Sample data</span>
            </div>
          )}
        </div>
        {isShowingSample && (
          <Motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
          >
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-300/90">
              Showing sample progress — your real data will update soon! ✨
            </p>
          </Motion.div>
        )}
        <div className="mt-6 h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height={288}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.16)" />
              <XAxis 
                dataKey="label" 
                stroke="currentColor" 
                tick={{ fill: "currentColor", fontSize: 12 }} 
                interval={Math.max(0, Math.floor(chartData.length / 6))}
              />
              <YAxis 
                stroke="currentColor" 
                tick={{ fill: "currentColor", fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.28)",
                  background: "rgba(15,23,42,0.92)",
                  color: "#fff",
                }}
                formatter={(value) => `${Math.round(value)}%`}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              {lines.map((line) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: line.color }}
                  activeDot={{ r: 6, fill: line.color }}
                  isAnimationActive={true}
                  name={line.name || line.dataKey}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>
    </Motion.div>
  );
}
