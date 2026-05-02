import { useEffect, useMemo, useRef, useState } from "react";
import DashboardCard from "./DashboardCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function formatDateLabel(value) {
  const raw = String(value || "");
  if (!raw) return "";
  if (raw.includes("-") && raw.length >= 10) return raw.slice(5);
  return raw;
}

export default function WeeklyTrendChart({ data = [] }) {
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

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(
    () =>
      Array.isArray(data)
        ? [...data]
            .sort((a, b) => String(a.date).localeCompare(String(b.date)))
            .slice(-7)
            .map((item) => ({
              date: formatDateLabel(item.date),
              riskScore: Number(item.riskScore ?? item.score ?? 0),
              completion: Number(item.completion ?? item.percent ?? 0),
            }))
        : [],
    [data]
  );

  const hasData = chartData.length > 0;
  const canRenderChart = hasData && chartReady && size.width > 20 && size.height > 20;

  return (
    <DashboardCard className="p-6 min-w-0" glow="from-violet-500/12 via-sky-500/8 to-emerald-500/10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--text-main)]">Weekly Improvement</h3>
        <span className="text-xs text-[color:var(--text-muted)]">Last 7 days · Risk ↓ is good</span>
      </div>

      <div ref={containerRef} className="mt-4 w-full h-[250px] min-h-[250px] min-w-0 overflow-hidden">
        {canRenderChart ? (
          <ResponsiveContainer width={size.width} height={size.height} minWidth={0} minHeight={0}>
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="riskScore" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} name="Risk Score" />
              <Line type="monotone" dataKey="completion" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} name="Completion %" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-50/50 px-4 text-center text-sm text-[color:var(--text-muted)]">
            {hasData ? "Loading chart…" : "Complete daily activities to unlock your 7-day trend graph."}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
