// Generate initial analytics data for new users
// Ensures graph is never empty on first visit

// Fallback data - used when no Firebase data exists
const FALLBACK_DATA = [
  { date: "04-01", activity: 60, attendance: 70, mental: 65 },
  { date: "04-02", activity: 75, attendance: 80, mental: 70 },
  { date: "04-03", activity: 85, attendance: 78, mental: 72 },
  { date: "04-04", activity: 70, attendance: 82, mental: 68 },
  { date: "04-05", activity: 90, attendance: 85, mental: 75 },
  { date: "04-06", activity: 65, attendance: 72, mental: 60 },
  { date: "04-07", activity: 80, attendance: 88, mental: 74 },
];

export const generateInitialAnalyticsData = (daysCount = 7) => {
  const data = [];
  const today = new Date();

  for (let i = daysCount - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);

    // Format date as MM-DD
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const label = `${month}-${day}`;

    // Generate realistic sample data (50-90 range for wellness metrics)
    const activityScore = Math.floor(Math.random() * 35) + 55;    // 55-90
    const attendanceScore = Math.floor(Math.random() * 30) + 65;  // 65-95
    const mentalScore = Math.floor(Math.random() * 35) + 50;      // 50-85

    data.push({
      label,
      date: date.toISOString().split("T")[0], // YYYY-MM-DD format for storage
      activity: activityScore,
      attendance: attendanceScore,
      mental: mentalScore,
      isGenerated: true, // Mark as auto-generated
    });
  }

  return data;
};

// Get fallback data (always returns data, never empty)
export const getFallbackData = () => {
  return FALLBACK_DATA.map((item) => ({
    label: item.date,
    ...item,
    isGenerated: true,
  }));
};

export const formatChartData = (metrics = [], generateIfEmpty = true) => {
  // If no data, use fallback data
  if (!metrics || metrics.length === 0) {
    return generateIfEmpty ? getFallbackData() : [];
  }

  // Format existing metrics for chart
  return metrics.map((metric, index) => ({
    label: metric.date ? metric.date.slice(5) : `D${index + 1}`, // MM-DD format
    date: metric.date,
    activity: Number(metric.activity || metric.activityScore || 0),
    attendance: Number(metric.attendance || metric.attendanceScore || 0),
    mental: Number(metric.mental || metric.mentalScore || 0),
    isGenerated: metric.isGenerated || false,
  }));
};

export const shouldShowSampleDataMessage = (data = []) => {
  // Show message if all data points are generated (not real)
  return data.length > 0 && data.every(d => d.isGenerated);
};
