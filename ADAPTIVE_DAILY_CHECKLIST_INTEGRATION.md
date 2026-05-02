# Adaptive Daily Checklist System - Integration Guide

## Overview

The Adaptive Daily Checklist System is a complete solution for generating personalized daily tasks based on assessment risk scores. It includes:

- **Backend Logic** (3 utility files, 1000+ lines)
- **UI Components** (4 React components, 800+ lines)
- **Real-time Sync** (Firestore listeners)
- **Counsellor Dashboard** (multi-student view)

## Architecture

```
Assessment Scores (academicStress, socialConnection, etc.)
           ↓
identifyProblemAreas() → Top 2-3 risk categories
           ↓
generatePersonalizedTasks() → Select tasks per category
           ↓
buildAdaptiveChecklist() → Base habits + Personalized tasks
           ↓
AdaptiveChecklist Component → Student sees tasks
           ↓
updateTaskCompletion() → Mark complete/incomplete
           ↓
calculateScoreReductions() → Reduce category scores (max 10/day)
           ↓
updateStreakData() → Track streaks (3/7/14/30-day bonuses)
           ↓
createScoreSnapshot() → Record historical data
           ↓
Firestore Update → Real-time sync to all views
           ↓
watchDailyProgress() → Auto-refresh all listeners
```

## File Structure

### Backend Files (Already Created ✅)

1. **src/utils/adaptiveTaskGenerator.js** (350+ lines)
   - `TASK_TEMPLATES`: 25 templates (5 categories × 5 tasks)
   - `BASE_HABITS`: 8 existing daily activities
   - `identifyProblemAreas()`: Detect top 2-3 risk categories
   - `generatePersonalizedTasks()`: Create 3-5 personalized tasks
   - `buildAdaptiveChecklist()`: Combine base + personalized
   - `calculateDailyProgress()`: Calculate completion %
   - `getDailyFeedback()`: Contextual feedback by completion
   - `identifyTaskCategory()`: Map task ID to category

2. **src/utils/adaptiveScoreReducer.js** (320+ lines)
   - `calculateScoreReductions()`: Core score reduction algorithm
   - `calculateStreakBonus()`: Streak multiplier (10%-30%)
   - `updateStreakData()`: Track streaks & milestones
   - `getStreakMilestone()`: Get milestone info (3/7/14/30-day)
   - `createScoreSnapshot()`: Record daily snapshots
   - `analyzeScoreProgress()`: Compare snapshots for trends

3. **src/services/firebase/adaptiveDailyProgress.js** (340+ lines)
   - `initializeDailyChecklist()`: Setup checklist on app load
   - `updateTaskCompletion()`: Mark task done/undone + update scores
   - `watchDailyProgress()`: Real-time listener for student
   - `getScoreHistory()`: Fetch 30-day history
   - `watchScoreHistory()`: Real-time listener for trends
   - `getCounsellorStudentProgress()`: Single fetch for counsellor
   - `watchCounsellorStudentProgress()`: Multi-student real-time

### UI Components (Already Created ✅)

1. **src/components/checklist/AdaptiveChecklist.jsx** (250+ lines)
   - Displays today's checklist
   - Shows base habits + personalized tasks
   - Real-time progress bar (0-100%)
   - Task completion with animations
   - Contextual feedback messages
   - Problem areas indicator
   - Streak counter

2. **src/components/dashboard/ScoreTrendChart.jsx** (300+ lines)
   - 30-day score history chart
   - Line graph for all 5 categories
   - Category improvement metrics
   - Insights panel (best improvement, lowest score)
   - Real-time updates via listeners

3. **src/components/dashboard/StreakTracker.jsx** (250+ lines)
   - Current streak display
   - Best streak history
   - Achievement milestones (3/7/14/30-day)
   - Next milestone countdown
   - Motivation messages
   - Visual badges and animations

4. **src/components/dashboard/CounsellorDashboardProgress.jsx** (320+ lines)
   - Multi-student progress matrix
   - Filter by status (All, At Risk, On Fire)
   - Completion % per student
   - Streak data visualization
   - Weak categories identification
   - Real-time sync for all students

## Integration Steps

### Step 1: Update Progress.jsx

Replace or update your Progress page to use the new adaptive checklist:

```jsx
import { useState } from 'react';
import AdaptiveChecklist from '../components/checklist/AdaptiveChecklist';
import ScoreTrendChart from '../components/dashboard/ScoreTrendChart';

export default function Progress() {
  return (
    <div className="space-y-8 p-6">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <AdaptiveChecklist />
        </div>
        <div>
          {/* Sidebar with other widgets */}
        </div>
      </div>
      
      <ScoreTrendChart days={30} />
    </div>
  );
}
```

### Step 2: Update Dashboard.jsx

Add streak tracker and progress summary to main dashboard:

```jsx
import StreakTracker from '../components/dashboard/StreakTracker';
import { watchDailyProgress } from '../services/firebase/adaptiveDailyProgress';

export default function Dashboard() {
  const [progress, setProgress] = useState(null);
  
  // Listen to daily progress
  useEffect(() => {
    const unsubscribe = watchDailyProgress(userId, setProgress);
    return () => unsubscribe();
  }, [userId]);
  
  return (
    <div className="space-y-6">
      <StreakTracker />
      
      {/* Other dashboard components */}
    </div>
  );
}
```

### Step 3: Update Counsellor Dashboard

Add multi-student progress view:

```jsx
import CounsellorDashboardProgress from '../components/dashboard/CounsellorDashboardProgress';

export default function CounsellorDashboard() {
  return (
    <div className="space-y-6">
      <CounsellorDashboardProgress />
      {/* Other counsellor components */}
    </div>
  );
}
```

### Step 4: Update Student Pages (Optional)

For quick access to checklist on any page:

```jsx
import AdaptiveChecklist from '../components/checklist/AdaptiveChecklist';

// Include as a sidebar or modal:
<AdaptiveChecklist />
```

## Firebase Schema

The system adds these fields to the `student_data` collection:

```javascript
{
  // Existing fields...
  
  // NEW: Daily progress tracking
  dailyProgress: {
    "2024-04-03": {
      date: "2024-04-03",
      categoryScores: {
        academicStress: 65,
        socialConnection: 58,
        sleepQuality: 42,
        anxietyStress: 72,
        emotionalWellbeing: 55
      },
      problemAreas: [
        { category: "anxiety", score: 72, severity: "high" },
        { category: "academic", score: 65, severity: "medium" }
      ],
      checklist: {
        base: [
          { id: "base_1", text: "...", completed: true, ... },
          ...
        ],
        personalized: [
          { id: "anxiety_2", text: "...", completed: false, ... },
          ...
        ]
      },
      allTasks: [...], // Combined list
      completionPercent: 65,
      base: { completed: 5, total: 8 },
      personalized: { completed: 1, total: 4 },
      scoreReductions: {
        academicStress: 2,
        anxietyStress: 3
      },
      lastUpdated: timestamp,
      createdAt: timestamp
    }
  },
  
  // UPDATED: Category scores (reduced by daily tasks)
  categoryScores: {
    academicStress: 65,
    socialConnection: 58,
    sleepQuality: 42,
    anxietyStress: 72,
    emotionalWellbeing: 55
  },
  
  // NEW: Streak tracking
  streakData: {
    currentStreak: 5,
    lastActiveDate: "2024-04-03",
    maxStreak: 7,
    streakBrokenCount: 2,
    totalActiveDays: 12,
    lastMilestoneReached: "3-day" // or "7-day", "14-day", "30-day"
  },
  
  // NEW: Score history for trends
  scoreHistory: {
    "2024-04-03": {
      date: "2024-04-03",
      scores: { academicStress: 65, ... },
      average: 58,
      timestamp: 1712099200000
    },
    "2024-04-02": { ... },
    ...
  }
}
```

## Data Flow

### On App Load
1. User logs in
2. `initializeDailyChecklist(userId, categoryScores)` called
3. System detects problem areas from assessment scores
4. Generates 3-5 personalized tasks
5. Creates today's entry in `dailyProgress`
6. Component renders with 0% completion

### On Task Completion
1. User clicks task checkbox
2. `updateTaskCompletion(userId, taskId, completed)` called
3. System:
   - Toggles task completed flag
   - Recalculates completion %
   - Gets all completed personalized tasks
   - Calculates score reductions (2-5 per category, max 10/day)
   - Applies streak bonus (10%-30%)
   - Updates streak data (60%+ = day completed)
   - Creates score snapshot
   - Updates Firebase with all changes
4. Firestore listeners auto-emit new data
5. All components re-render with updated values

### Real-time Sync
1. `watchDailyProgress()` listener on each component
2. Any change in `dailyProgress` or `categoryScores` emits to component
3. Component updates UI immediately
4. No manual refresh needed

## Features Implemented

✅ **Feature 1: Problem Detection**
- Identifies top 2-3 highest risk categories
- Sorts by severity (high/medium/low)
- Used to select personalized tasks

✅ **Feature 2: Dynamic Task Generation**
- 25 templates (5 categories × 5 tasks)
- Category mapping: social, anxiety, academic, sleep, emotional
- 1-2 tasks per problem area based on severity
- Shuffled for variety

✅ **Feature 3: Progress Tracking**
- Real-time completion % (0-100%)
- Base tasks counter (completed/total)
- Personalized tasks counter (completed/total)
- Visual progress bar with animations

✅ **Feature 4: Score Reduction System**
- 2-5 points per category per task completed
- Streak bonus: 3-day=10%, 7-day=20%, 14-day=30%
- Max reduction per day: 10 points per category
- Enforced in `calculateScoreReductions()`

✅ **Feature 5: Live Score Update**
- `updateTaskCompletion()` updates Firebase immediately
- Scores reflected in all views (student, counsellor, admin)
- Real-time listeners ensure no stale data

✅ **Feature 6: Visual Progress**
- ScoreTrendChart: 30-day line chart per category
- StreakTracker: Current/best streak with milestones
- AdaptiveChecklist: Progress bar and task animations
- Visual badges for achievements

✅ **Feature 7: Real-Time Sync**
- `watchDailyProgress()`: Student daily progress
- `watchScoreHistory()`: 30-day score trends
- `watchCounsellorStudentProgress()`: Multi-student view
- Auto-unsubscribe on component unmount

✅ **Feature 8: Counsellor Insight**
- CounsellorDashboardProgress shows all students
- Completion %, streak, weak categories per student
- Filter by status (All, At Risk, On Fire)
- Real-time multi-student sync

✅ **Feature 9: Smart Feedback**
- 100%: "Perfect! You completed everything today! 🎉"
- 80%+: "Great progress! Keep it up 🚀"
- 60%+: "Good start! Try to complete more tasks 💪"
- 40%+: "You need to stay consistent ⚠️"
- 0%+: "Start your day strong 💪"

## Key Functions Reference

### Task Generation
```javascript
// Detect problem areas
const problems = identifyProblemAreas(categoryScores);
// Returns: [{ category, score, severity }, ...]

// Generate tasks for today
const tasks = generatePersonalizedTasks(categoryScores, 4);
// Returns: [{ id, text, duration, category, impact }, ...]

// Build complete checklist
const checklist = buildAdaptiveChecklist(categoryScores, existingProgress);
// Returns: { base: [...], personalized: [...] }

// Get feedback message
const feedback = getDailyFeedback(completionPercent);
// Returns: { type, message }
```

### Score Management
```javascript
// Calculate reductions and updated scores
const result = calculateScoreReductions(completedTasks, categoryScores, streakData);
// Returns: { updatedScores, reductions, totalReduction, totalDailyReduction }

// Get streak bonus multiplier
const bonus = calculateStreakBonus(currentStreak);
// Returns: 0.0 to 0.3 (10%-30%)

// Update streak tracking
const newStreak = updateStreakData(streakData, completionPercent, today);
// Returns: { currentStreak, lastActiveDate, maxStreak, ... }

// Get milestone info
const milestone = getStreakMilestone(currentStreak);
// Returns: { title, icon, points } or null
```

### Firebase Operations
```javascript
// Initialize checklist (call on app load)
await initializeDailyChecklist(userId, categoryScores);

// Update task completion
const result = await updateTaskCompletion(userId, taskId, completed);
// Returns: { taskId, completed, completionPercent, scoreReductions, ... }

// Listen to daily progress (auto-updates)
const unsubscribe = watchDailyProgress(userId, (data) => {
  // data: { date, completionPercent, allTasks, checklist, streakData, categoryScores }
});

// Get score history (one-time fetch)
const history = await getScoreHistory(userId, 30);
// Returns: [{ dateKey, scores, average, timestamp }, ...]

// Listen to score trends (auto-updates)
const unsubscribe = watchScoreHistory(userId, (history) => {
  // history: [{ dateKey, scores, average, timestamp }, ...]
}, 30);

// Counsellor: Get single student progress
const progress = await getCounsellorStudentProgress(studentId);

// Counsellor: Listen to multiple students
const unsubscribers = watchCounsellorStudentProgress(studentIds, (data) => {
  // data: { studentId, todayProgress, streakData, completionPercent }
});
```

## Customization

### Add New Tasks
Edit `src/utils/adaptiveTaskGenerator.js`:

```javascript
const TASK_TEMPLATES = {
  // ... existing categories ...
  
  // Add new category
  customCategory: {
    custom_1: {
      id: 'custom_1',
      text: 'Your task description',
      duration: '15 min',
      impact: 3
    },
    // ... more tasks ...
  }
};
```

### Adjust Score Reduction
Edit `src/utils/adaptiveScoreReducer.js`, `calculateScoreReductions()`:

```javascript
// Change base reduction (currently 2-5)
const baseReduction = task.impact * 0.8; // Was: task.impact

// Change max daily limit (currently 10)
totalDailyReduction: Math.min(totalReduction, 15) // Was: 10

// Change streak bonus thresholds
if (currentStreak >= 5) multiplier = 0.15; // Add more tiers
```

### Adjust Feedback Messages
Edit `src/utils/adaptiveTaskGenerator.js`, `getDailyFeedback()`:

```javascript
if (percent === 100) {
  return {
    type: 'success',
    message: 'Your custom celebration message here! 🎉'
  };
}
```

## Testing Checklist

- [ ] AdaptiveChecklist renders without errors
- [ ] Tasks display with categories and durations
- [ ] Clicking tasks toggles checkbox state
- [ ] Completion % updates in real-time
- [ ] Problem areas show in alert
- [ ] ScoreTrendChart displays 30-day history
- [ ] StreakTracker shows current/max streaks
- [ ] Milestones unlock at 3/7/14/30 days
- [ ] CounsellorDashboardProgress shows all students
- [ ] Filters work (All, At Risk, On Fire)
- [ ] Firebase updates reflect in all views
- [ ] Real-time listeners auto-unsubscribe on unmount

## Troubleshooting

### Tasks not showing
- Check Firebase has `student_data[userId]` document
- Verify `categoryScores` object exists
- Call `initializeDailyChecklist()` on app load

### Scores not updating
- Check `updateTaskCompletion()` called after task toggle
- Verify `dailyProgress[todayKey]` exists in Firebase
- Check listener subscription (unsubscribe only on unmount)

### Counsellor dashboard empty
- Check user has `assignedCounsellor` field set to counsellor ID
- Verify `watchCounsellorStudentProgress()` query works
- Check student list fetches correctly

### Streak not incrementing
- Completion threshold is 60% (not 50%)
- Streak only updates on new day (check timestamp)
- Max daily reduction limits score drops

## Performance Notes

- Real-time listeners efficiently update only changed data
- Components unsubscribe on unmount (no memory leaks)
- Score history limited to 30 days by default
- Firestore reads optimized with single listener per component
- Animations use Framer Motion (GPU-accelerated)

## Next Steps

1. **Integration** (30 min)
   - [ ] Update Progress.jsx with AdaptiveChecklist
   - [ ] Update Dashboard.jsx with StreakTracker
   - [ ] Update CounsellorDashboard.jsx
   - [ ] Test real-time sync

2. **Customization** (15 min)
   - [ ] Add custom task templates if needed
   - [ ] Adjust feedback messages
   - [ ] Tweak score reduction values

3. **Testing** (30 min)
   - [ ] Manual test all features
   - [ ] Check Firebase schema
   - [ ] Verify real-time listeners
   - [ ] Test counsellor multi-student view

4. **Deployment** (ongoing)
   - [ ] Push to staging
   - [ ] User acceptance testing
   - [ ] Monitor Firestore usage
   - [ ] Gather feedback

---

**System Status**: ✅ All 7 files created and syntax-verified (0 errors)
**Ready for integration** into existing Progress.jsx and Dashboard pages.
