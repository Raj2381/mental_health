import { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { TrendingDown, Award, Target } from 'lucide-react';
import { auth } from '../../firebase';
import { watchScoreHistory } from '../../services/firebase/adaptiveDailyProgress';

const colors = {
  academicStress: '#f97316',
  socialConnection: '#3b82f6',
  sleepQuality: '#8b5cf6',
  anxietyStress: '#ef4444',
  emotionalWellbeing: '#ec4899',
};

const labels = {
  academicStress: 'Academic Stress',
  socialConnection: 'Social Connection',
  sleepQuality: 'Sleep Quality',
  anxietyStress: 'Anxiety',
  emotionalWellbeing: 'Emotional Wellness',
};

export default function ScoreTrendChart({ days = 30 }) {
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get user auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUserId(user?.uid || null);
      if (!user?.uid) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Watch score history
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const unsubscribe = watchScoreHistory(userId, (data) => {
      setHistory(data);
      setLoading(false);
    }, days);

    return () => unsubscribe();
  }, [userId, days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading trends...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No score history yet. Complete tasks to see your progress!</p>
      </div>
    );
  }

  // Calculate improvements
  const firstSnapshot = history[0];
  const lastSnapshot = history[history.length - 1];
  const improvements = {};
  const isImproving = {};

  Object.keys(labels).forEach((key) => {
    const firstScore = firstSnapshot.scores?.[key] || 50;
    const lastScore = lastSnapshot.scores?.[key] || 50;
    improvements[key] = firstScore - lastScore; // Lower is better
    isImproving[key] = improvements[key] > 0;
  });

  // Calculate chart dimensions
  const maxScore = Math.max(
    ...history.map((s) => Object.values(s.scores || {}).reduce((a, b) => Math.max(a, b), 0))
  );
  const minScore = Math.min(
    ...history.map((s) => Object.values(s.scores || {}).reduce((a, b) => Math.min(a, b), 100))
  );

  const yAxisMax = Math.ceil((maxScore + 10) / 10) * 10;
  const yAxisMin = Math.floor((minScore - 10) / 10) * 10;
  const yAxisRange = yAxisMax - yAxisMin;

  const chartHeight = 300;
  const chartWidth = Math.max(600, history.length * 30);
  const pointSpacing = chartWidth / (history.length - 1 || 1);

  // Generate points for each category
  const getChartPoints = (key) => {
    return history
      .map((snapshot, index) => {
        const score = snapshot.scores?.[key] || 50;
        const yPercent = (score - yAxisMin) / yAxisRange;
        const y = chartHeight - yPercent * chartHeight + 40;
        const x = index * pointSpacing + 40;
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white"
      >
        <h2 className="text-2xl font-bold flex items-center space-x-2 mb-2">
          <TrendingDown className="w-6 h-6" />
          <span>Your Score Progress</span>
        </h2>
        <p className="text-slate-300 text-sm">
          Lower scores are better. Your daily tasks are helping reduce stress levels.
        </p>
      </Motion.div>

      {/* Improvements Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.keys(labels).map((key) => (
          <Motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border-2 ${
              isImproving[key]
                ? 'bg-green-50 border-green-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <p className="text-xs font-medium text-slate-600 mb-1">{labels[key]}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-bold" style={{ color: colors[key] }}>
                  {improvements[key] > 0 ? '-' : '+'}
                  {Math.abs(improvements[key]).toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {isImproving[key] ? '✓ Better' : 'Keep going'}
                </p>
              </div>
              {isImproving[key] && (
                <Award className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
            </div>
          </Motion.div>
        ))}
      </div>

      {/* Line Chart */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-slate-200 p-4 overflow-x-auto shadow-sm"
      >
        <svg width={chartWidth + 80} height={chartHeight + 80} viewBox={`0 0 ${chartWidth + 80} ${chartHeight + 80}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = 40 + ratio * chartHeight;
            const score = yAxisMax - ratio * yAxisRange;
            return (
              <g key={`grid-${ratio}`}>
                <line
                  x1={40}
                  y1={y}
                  x2={chartWidth + 40}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="4,4"
                />
                <text x={10} y={y + 5} fontSize="12" fill="#999" textAnchor="end">
                  {Math.round(score)}
                </text>
              </g>
            );
          })}

          {/* Y-axis */}
          <line x1={40} y1={40} x2={40} y2={chartHeight + 40} stroke="#374151" strokeWidth={2} />
          <line x1={40} y1={chartHeight + 40} x2={chartWidth + 40} y2={chartHeight + 40} stroke="#374151" strokeWidth={2} />

          {/* Category lines */}
          {Object.keys(labels).map((key) => (
            <g key={`line-${key}`}>
              <polyline
                points={getChartPoints(key)}
                fill="none"
                stroke={colors[key]}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {history.map((snapshot, index) => {
                const score = snapshot.scores?.[key] || 50;
                const yPercent = (score - yAxisMin) / yAxisRange;
                const y = chartHeight - yPercent * chartHeight + 40;
                const x = index * pointSpacing + 40;
                return (
                  <circle
                    key={`dot-${key}-${index}`}
                    cx={x}
                    cy={y}
                    r={3}
                    fill={colors[key]}
                    opacity={index === history.length - 1 ? 1 : 0.6}
                  />
                );
              })}
            </g>
          ))}

          {/* Date labels */}
          {history
            .filter((_, i) => i % Math.ceil(history.length / 5) === 0 || i === history.length - 1)
            .map((snapshot, i, arr) => {
              const realIndex = history.indexOf(snapshot);
              const x = realIndex * pointSpacing + 40;
              const date = new Date(snapshot.timestamp);
              const label = `${date.getMonth() + 1}/${date.getDate()}`;
              return (
                <text key={`date-${i}`} x={x} y={chartHeight + 60} fontSize="12" fill="#666" textAnchor="middle">
                  {label}
                </text>
              );
            })}
        </svg>
      </Motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center">
        {Object.keys(labels).map((key) => (
          <div key={key} className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[key] }} />
            <span className="text-sm text-slate-600">{labels[key]}</span>
          </div>
        ))}
      </div>

      {/* Insights */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <h4 className="font-semibold text-blue-900 mb-2">📊 Insights</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>
            • Your lowest score: <strong>{labels[Object.keys(labels).reduce((a, b) => (lastSnapshot.scores?.[a] || 50) < (lastSnapshot.scores?.[b] || 50) ? a : b)]}</strong>
          </li>
          <li>
            • Best improvement: <strong>{labels[Object.keys(labels).reduce((a, b) => improvements[a] > improvements[b] ? a : b)]}</strong> (↓ {improvements[Object.keys(labels).reduce((a, b) => improvements[a] > improvements[b] ? a : b)].toFixed(1)} points)
          </li>
          <li>
            • {Object.values(isImproving).filter(Boolean).length} / {Object.keys(labels).length} categories improving
          </li>
        </ul>
      </Motion.div>
    </div>
  );
}
