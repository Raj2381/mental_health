import { memo, useEffect, useMemo, useRef, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { motion as Motion } from "framer-motion";
import DashboardCard from "./DashboardCard";
import { 
  generateInsight, 
  generateRecommendations, 
  getStressColor, 
  getStressLevel,
  calculateOverallStress 
} from "../../utils/stressIntelligence";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

const CustomTooltip = memo(function CustomTooltip({ active, payload, total }) {
  if (!(active && payload && payload.length)) return null;

  const entry = payload[0];
  const percentage = total > 0 ? Math.round((Number(entry.value || 0) / total) * 100) : 0;

  return (
    <div className="rounded-lg bg-black/80 px-3 py-2 text-white text-xs border border-white/20">
      <p className="font-semibold">{entry.name}</p>
      <p className="text-gray-300">Score: {entry.value}</p>
      <p className="text-gray-400">{percentage}% of total</p>
    </div>
  );
});

function MentalHealthPieChart({ assessment }) {
  const [chartReady, setChartReady] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const check = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // ✅ SINGLE SOURCE: Read only from data.latestAssessment.categories
  const categories = assessment?.categories ?? {};

  const chartData = useMemo(
    () => [
      { name: "Academic", value: Math.round(categories.academic ?? 0) },
      { name: "Sleep", value: Math.round(categories.sleep ?? 0) },
      { name: "Social", value: Math.round(categories.social ?? 0) },
      { name: "Emotional", value: Math.round(categories.emotional ?? 0) },
    ],
    [categories.academic, categories.sleep, categories.social, categories.emotional]
  );

  const highest = useMemo(() => [...chartData].sort((a, b) => b.value - a.value)[0] || null, [chartData]);
  const totalStress = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);
  const hasData = totalStress > 0;
  const canRenderChart = hasData && chartReady && size.width > 20 && size.height > 20;
  
  // Generate intelligence
  const insight = generateInsight(categories);
  const recommendations = generateRecommendations(categories);
  const overallStress = calculateOverallStress(categories);

  return (
    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <DashboardCard className="min-w-0 p-6" glow="from-rose-500/12 via-sky-500/8 to-teal-500/12">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-[color:var(--text-main)]">Mental Stress Causes</h3>
            <p className="soft-text mt-1 text-sm">
              {hasData ? "Real-time stress distribution & AI insights" : "Complete an assessment to see your stress breakdown."}
            </p>
          </div>
          {hasData && (
            <Motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`rounded-full px-3 py-1 text-xs font-semibold border flex items-center gap-2 ${getStressColor(overallStress)}`}
            >
              <span className="text-lg">
                {overallStress === 0 ? "✨" : overallStress < 25 ? "🟢" : overallStress < 50 ? "🟡" : overallStress < 75 ? "🟠" : "🔴"}
              </span>
              <span>{getStressLevel(overallStress)} Stress</span>
            </Motion.div>
          )}
        </div>

        {hasData ? (
          <>
            {/* ANIMATED PIE CHART */}
            <div ref={containerRef} className="w-full h-[250px] min-h-[250px] min-w-0 overflow-hidden">
              {canRenderChart ? <ResponsiveContainer width={size.width} height={size.height} minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                    label={false}
                  >
                    {chartData.map((_, i) => (
                      <Cell 
                        key={`cell-${i}`} 
                        fill={COLORS[i]}
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip total={totalStress} />} />
                </PieChart>
              </ResponsiveContainer> : (
                <div className="h-full w-full flex items-center justify-center text-xs text-[color:var(--text-muted)]">
                  Loading chart…
                </div>
              )}
            </div>

            {/* STRESS INDICATORS WITH ANIMATIONS */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              {chartData.map((item, index) => (
                <Motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  className="flex items-center space-x-2 rounded-2xl bg-white/35 px-3 py-2 cursor-pointer transition-all hover:bg-white/45"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: COLORS[index],
                      boxShadow: `0 0 8px ${COLORS[index]}40`
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[color:var(--text-muted)] truncate">{item.name}</p>
                    <p className="text-sm font-bold text-[color:var(--text-main)]">{item.value}</p>
                  </div>
                </Motion.div>
              ))}
            </div>

            {/* DYNAMIC INSIGHT */}
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border border-blue-500/20 p-4"
            >
              <p className="text-sm text-[color:var(--text-main)] leading-relaxed">
                <span className="font-semibold">💡 Insight: </span>{insight}
              </p>
            </Motion.div>

            {/* AI RECOMMENDATIONS */}
            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4"
            >
              <p className="text-xs font-semibold text-[color:var(--text-muted)] mb-3">🤖 AI Recommendations</p>
              <div className="space-y-2">
                {recommendations.map((rec, idx) => (
                  <Motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                    className="flex items-start gap-2 rounded-lg bg-white/20 p-2 hover:bg-white/30 transition-colors"
                  >
                    <span className="text-base flex-shrink-0">{rec.emoji}</span>
                    <p className="text-xs text-[color:var(--text-main)] leading-snug">{rec.text}</p>
                  </Motion.div>
                ))}
              </div>
            </Motion.div>

            {/* HIGHEST IMPACT BADGE */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between"
            >
              <p className="soft-text text-xs">Highest impact:</p>
              <Motion.span 
                className="text-sm font-bold text-amber-400"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                🎯 {highest?.name}
              </Motion.span>
            </Motion.div>
          </>
        ) : (
          <div className="h-56 w-full flex flex-col items-center justify-center space-y-3">
            <div className="text-4xl">📊</div>
            <p className="text-center text-gray-400 text-sm max-w-xs">
              Complete your wellness assessment to unlock personalized insights and AI recommendations
            </p>
          </div>
        )}
      </DashboardCard>
    </Motion.div>
  );
}

export default memo(MentalHealthPieChart);
