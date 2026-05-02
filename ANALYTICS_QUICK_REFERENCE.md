# 📊 Weekly Wellness Analytics - Quick Reference

## Current Implementation

### Graph Behavior
- ✅ **ALWAYS shows data** - never blank
- ✅ Uses fallback data if Firebase empty
- ✅ Updates with real data when available
- ✅ Shows "Sample data" badge during fallback

### Fallback Data (7 days)
```
04-01: Activity 60%, Attendance 70%, Mental 65%
04-02: Activity 75%, Attendance 80%, Mental 70%
04-03: Activity 85%, Attendance 78%, Mental 72%
04-04: Activity 70%, Attendance 82%, Mental 68%
04-05: Activity 90%, Attendance 85%, Mental 75%
04-06: Activity 65%, Attendance 72%, Mental 60%
04-07: Activity 80%, Attendance 88%, Mental 74%
```

## Component Structure

### AnalyticsChart.jsx
```jsx
- Always renders chart
- No empty state UI
- Supports real-time Firebase updates
- Shows "Sample data" badge when needed
```

### analyticsDataGenerator.js
```javascript
- FALLBACK_DATA: 7 days of default metrics
- generateInitialAnalyticsData(): Creates random sample
- getFallbackData(): Returns fallback data with isGenerated=true
- formatChartData(): Formats both real and fallback data
- shouldShowSampleDataMessage(): Checks if all data is fallback
```

## Firebase Integration

### Real Data Format
```javascript
{
  date: "2026-04-01",      // ISO format
  activity: 75,             // Real user activity score
  attendance: 82,           // Real attendance
  mental: 70,               // Real mental wellness
  isGenerated: false        // Marks as real data
}
```

### Usage in Dashboard
```jsx
const analyticsData = metricsForChart.length > 0 
  ? formatChartData(metricsForChart, false)
  : generateInitialAnalyticsData(7);
```

## Key Functions

### getFallbackData()
Returns 7 days of sample data with `isGenerated: true`

### formatChartData(metrics, generateIfEmpty)
- If empty & generateIfEmpty=true → returns fallback
- If empty & generateIfEmpty=false → returns []
- If has data → formats for Recharts

### shouldShowSampleDataMessage(data)
Returns true if ALL data points have `isGenerated: true`

## Chart Props

```jsx
<AnalyticsChart
  title="Weekly Wellness Analytics"
  data={analyticsData}  // Always has 7+ days
  lines={[
    { dataKey: "activity", color: "#38bdf8" },
    { dataKey: "attendance", color: "#f59e0b" },
    { dataKey: "mental", color: "#8b5cf6" },
  ]}
/>
```

## Features

✅ Fallback data prevents empty UI
✅ Real data seamlessly replaces fallback
✅ User knows when viewing sample data
✅ Works offline or with slow Firebase
✅ No breaking changes to existing code
✅ Zero configuration needed

## Build Status

✓ 2799 modules transformed
✓ 596ms build time
✓ 0 errors
✓ 0 warnings
✓ Production ready

