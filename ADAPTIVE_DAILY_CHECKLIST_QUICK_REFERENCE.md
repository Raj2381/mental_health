# Adaptive Daily Checklist - Quick Usage Guide

## Import Statements

```javascript
// Backend utilities
import { 
  identifyProblemAreas,
  generatePersonalizedTasks,
  buildAdaptiveChecklist,
  calculateDailyProgress,
  getDailyFeedback,
  TASK_TEMPLATES,
  BASE_HABITS
} from '@/utils/adaptiveTaskGenerator';

import {
  calculateScoreReductions,
  calculateStreakBonus,
  updateStreakData,
  getStreakMilestone,
  createScoreSnapshot,
  analyzeScoreProgress
} from '@/utils/adaptiveScoreReducer';

import {
  initializeDailyChecklist,
  updateTaskCompletion,
  watchDailyProgress,
  getScoreHistory,
  watchScoreHistory,
  getCounsellorStudentProgress,
  watchCounsellorStudentProgress
} from '@/services/firebase/adaptiveDailyProgress';

// Components
import AdaptiveChecklist from '@/components/checklist/AdaptiveChecklist';
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart';
import StreakTracker from '@/components/dashboard/StreakTracker';
import CounsellorDashboardProgress from '@/components/dashboard/CounsellorDashboardProgress';
```

---

## Component Usage

### 1. AdaptiveChecklist (Student Daily Tasks)

```jsx
import AdaptiveChecklist from '@/components/checklist/AdaptiveChecklist';

export default function ProgressPage() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <AdaptiveChecklist />
      </div>
      <aside>{/* other widgets */}</aside>
    </div>
  );
}
```

**Features:**
- Displays today's base habits (8 tasks)
- Shows AI-recommended tasks (3-5 tasks)
- Real-time progress bar
- Problem areas alert
- Contextual feedback
- Auto-updates on task completion

**Props:** None (uses auth context internally)

---

### 2. ScoreTrendChart (30-Day Score History)

```jsx
import ScoreTrendChart from '@/components/dashboard/ScoreTrendChart';

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Your Progress</h1>
      <ScoreTrendChart days={30} />
    </div>
  );
}
```

**Features:**
- Line chart for 5 categories over 30 days
- Improvement metrics cards
- Insights panel
- Real-time updates

**Props:**
- `days`: Number of days to display (default: 30)

---

### 3. StreakTracker (Achievements & Milestones)

```jsx
import StreakTracker from '@/components/dashboard/StreakTracker';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <StreakTracker />
      {/* other dashboard widgets */}
    </div>
  );
}
```

**Features:**
- Current streak display
- Best streak history
- Achievement milestones (3/7/14/30-day)
- Next milestone countdown
- Motivation messages

**Props:** None (uses auth context internally)

---

### 4. CounsellorDashboardProgress (Multi-Student View)

```jsx
import CounsellorDashboardProgress from '@/components/dashboard/CounsellorDashboardProgress';

export default function CounsellorDashboard() {
  return (
    <div>
      <h1>Student Progress</h1>
      <CounsellorDashboardProgress />
    </div>
  );
}
```

**Features:**
- View all assigned students
- Filter by status (All, At Risk, On Fire)
- Completion % per student
- Streak data visualization
- Weak categories identification
- Real-time updates for all students

**Props:** None (uses auth context internally)

---

## Utility Function Usage

### Generate Personalized Tasks

```javascript
// Get problem areas from scores
const categoryScores = {
  academicStress: 75,      // High - problem area
  socialConnection: 65,    // Medium - problem area
  sleepQuality: 40,        // Low - okay
  anxietyStress: 70,       // High - problem area
  emotionalWellbeing: 55   // Medium
};

// Identify top 2-3 problems
const problems = identifyProblemAreas(categoryScores);
console.log(problems);
// Output:
// [
//   { category: 'academic', score: 75, severity: 'high' },
//   { category: 'anxiety', score: 70, severity: 'high' },
//   { category: 'social', score: 65, severity: 'medium' }
// ]

// Generate 4 personalized tasks
const tasks = generatePersonalizedTasks(categoryScores, 4);
console.log(tasks);
// Output:
// [
//   { id: 'academic_2', text: 'Complete 2 homework assignments', ... },
//   { id: 'anxiety_1', text: 'Do breathing exercise', ... },
//   { id: 'social_3', text: 'Join a club or group activity', ... },
//   { id: 'academic_4', text: 'Attend all classes today', ... }
// ]

// Build full checklist
const checklist = buildAdaptiveChecklist(categoryScores, existingProgress);
console.log(checklist);
// Output:
// {
//   base: [
//     { id: 'base_1', text: 'Daily check-in', completed: false, ... },
//     { id: 'base_2', text: 'Attended class', completed: true, ... },
//     ...
//   ],
//   personalized: [
//     { id: 'anxiety_1', text: 'Do breathing exercise', completed: false, ... },
//     ...
//   ]
// }
```

### Calculate Score Reductions

```javascript
// User completed 3 personalized tasks
const completedTasks = [
  { id: 'academic_2', category: 'academic', impact: 3 },
  { id: 'anxiety_1', category: 'anxiety', impact: 2 },
  { id: 'social_3', category: 'social', impact: 2 }
];

const categoryScores = {
  academicStress: 75,
  anxietyStress: 70,
  socialConnection: 65,
  sleepQuality: 40,
  emotionalWellbeing: 55
};

const streakData = {
  currentStreak: 3  // 3-day streak = 10% bonus
};

// Calculate reductions
const result = calculateScoreReductions(completedTasks, categoryScores, streakData);
console.log(result);
// Output:
// {
//   updatedScores: {
//     academicStress: 71.65,   // 75 - (3 × 1.1 × 0.5)
//     anxietyStress: 68.9,     // 70 - (2 × 1.1 × 0.5)
//     socialConnection: 63.45, // 65 - (2 × 1.1 × 0.5)
//     sleepQuality: 40,
//     emotionalWellbeing: 55
//   },
//   reductions: {
//     academicStress: 3.35,
//     anxietyStress: 2.2,
//     socialConnection: 1.55
//   },
//   totalReduction: 7.1,
//   totalDailyReduction: 7.1  // Under max of 10
// }

// Get streak bonus
const bonus = calculateStreakBonus(3); // 3-day streak
console.log(bonus); // 0.1 (10% bonus)

// Get milestone info
const milestone = getStreakMilestone(3);
console.log(milestone);
// Output:
// {
//   title: '3-Day Streak!',
//   icon: '🔥',
//   color: 'from-orange-400 to-red-400',
//   points: 3
// }
```

### Track Streaks

```javascript
const streakData = {
  currentStreak: 2,
  lastActiveDate: '2024-04-02',
  maxStreak: 5,
  streakBrokenCount: 1,
  totalActiveDays: 8
};

const completionPercent = 65; // Student completed 65% of tasks
const today = '2024-04-03';

// Update streak
const newStreak = updateStreakData(streakData, completionPercent, today);
console.log(newStreak);
// Output (completion >= 60%):
// {
//   currentStreak: 3,
//   lastActiveDate: '2024-04-03',
//   maxStreak: 5,
//   streakBrokenCount: 1,
//   totalActiveDays: 9
// }

// If completion < 60%, streak resets:
// {
//   currentStreak: 0,
//   lastActiveDate: null,
//   maxStreak: 5,
//   streakBrokenCount: 2,
//   totalActiveDays: 8
// }
```

### Get Daily Feedback

```javascript
const feedback1 = getDailyFeedback(100);
console.log(feedback1);
// { type: 'success', message: 'Perfect! You completed everything today! 🎉' }

const feedback2 = getDailyFeedback(85);
console.log(feedback2);
// { type: 'success', message: 'Great progress! Keep it up 🚀' }

const feedback3 = getDailyFeedback(50);
console.log(feedback3);
// { type: 'info', message: 'Good start! Try to complete more tasks 💪' }

const feedback4 = getDailyFeedback(25);
console.log(feedback4);
// { type: 'warning', message: 'You need to stay consistent ⚠️' }

const feedback5 = getDailyFeedback(0);
console.log(feedback5);
// { type: 'default', message: 'Start your day strong 💪' }
```

---

## Firebase Function Usage

### Initialize Checklist (Call on App Load)

```javascript
import { useEffect } from 'react';
import { auth } from '@/firebase';
import { initializeDailyChecklist } from '@/services/firebase/adaptiveDailyProgress';

export default function App() {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Initialize checklist with current scores
        const categoryScores = {
          academicStress: 75,
          socialConnection: 65,
          sleepQuality: 40,
          anxietyStress: 70,
          emotionalWellbeing: 55
        };

        await initializeDailyChecklist(user.uid, categoryScores);
      }
    });

    return () => unsubscribe();
  }, []);

  return <div>App</div>;
}
```

---

### Update Task Completion

```javascript
import { updateTaskCompletion } from '@/services/firebase/adaptiveDailyProgress';

async function handleTaskToggle(taskId, currentStatus) {
  try {
    const result = await updateTaskCompletion(
      userId,
      taskId,
      !currentStatus // Toggle status
    );

    console.log('Task updated:', result);
    // Output:
    // {
    //   taskId: 'social_1',
    //   completed: true,
    //   completionPercent: 65,
    //   scoreReductions: { socialConnection: 2.5 },
    //   streakData: { currentStreak: 3, ... },
    //   updatedCategoryScores: { socialConnection: 63 }
    // }
  } catch (error) {
    console.error('Failed to update task:', error);
  }
}
```

---

### Listen to Daily Progress (Real-Time)

```javascript
import { useEffect, useState } from 'react';
import { watchDailyProgress } from '@/services/firebase/adaptiveDailyProgress';

export default function ProgressTracker() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    // Set up real-time listener
    const unsubscribe = watchDailyProgress(userId, (data) => {
      setProgress(data);
      console.log('Progress updated:', data);
      // data includes:
      // - date
      // - completionPercent
      // - allTasks
      // - checklist (base + personalized)
      // - streakData
      // - categoryScores
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, [userId]);

  if (!progress) return <div>Loading...</div>;

  return (
    <div>
      <p>Completion: {progress.completionPercent}%</p>
      <p>Streak: {progress.streakData.currentStreak} days</p>
    </div>
  );
}
```

---

### Get Score History (One-Time Fetch)

```javascript
import { getScoreHistory } from '@/services/firebase/adaptiveDailyProgress';

async function loadScoreHistory() {
  const history = await getScoreHistory(userId, 30);
  console.log('Score history:', history);
  // Output:
  // [
  //   {
  //     dateKey: '2024-04-03',
  //     scores: { academicStress: 71, socialConnection: 63, ... },
  //     average: 62,
  //     timestamp: 1712099200000
  //   },
  //   ...
  // ]
}
```

---

### Watch Score History (Real-Time Trends)

```javascript
import { useEffect, useState } from 'react';
import { watchScoreHistory } from '@/services/firebase/adaptiveDailyProgress';

export default function TrendChart() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Listen to 30-day score trends
    const unsubscribe = watchScoreHistory(userId, (data) => {
      setHistory(data);
      console.log('Score history updated:', data);
    }, 30);

    return () => unsubscribe();
  }, [userId]);

  return (
    <div>
      {/* Render chart with history data */}
    </div>
  );
}
```

---

### Counsellor: Get Single Student Progress

```javascript
import { getCounsellorStudentProgress } from '@/services/firebase/adaptiveDailyProgress';

async function loadStudentProgress(studentId) {
  const progress = await getCounsellorStudentProgress(studentId);
  console.log('Student progress:', progress);
  // Output:
  // {
  //   todayProgress: { completionPercent: 65, ... },
  //   streakData: { currentStreak: 3, ... },
  //   completionPercent: 65
  // }
}
```

---

### Counsellor: Watch Multiple Students (Real-Time)

```javascript
import { useEffect, useState } from 'react';
import { watchCounsellorStudentProgress } from '@/services/firebase/adaptiveDailyProgress';

export default function CounsellorDashboard() {
  const [studentProgress, setStudentProgress] = useState({});

  useEffect(() => {
    const studentIds = ['student1', 'student2', 'student3'];

    // Listen to all students at once
    const unsubscribers = watchCounsellorStudentProgress(
      studentIds,
      (data) => {
        setStudentProgress((prev) => ({
          ...prev,
          [data.studentId]: data
        }));
        console.log('Student progress updated:', data);
        // data:
        // {
        //   studentId: 'student1',
        //   todayProgress: { ... },
        //   streakData: { ... },
        //   completionPercent: 65
        // }
      }
    );

    // Clean up all listeners on unmount
    return () => {
      unsubscribers.forEach((u) => u());
    };
  }, []);

  return (
    <div>
      {Object.entries(studentProgress).map(([studentId, data]) => (
        <div key={studentId}>
          <p>{studentId}: {data.completionPercent}%</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Initialize on App Load

```javascript
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      // Get current category scores from state/database
      const scores = await fetchCurrentScores(user.uid);
      
      // Initialize checklist for today
      await initializeDailyChecklist(user.uid, scores);
    }
  });
  return () => unsubscribe();
}, []);
```

### Pattern 2: Handle Task Toggle

```javascript
async function toggleTask(taskId, currentStatus) {
  setLoading(true);
  try {
    await updateTaskCompletion(userId, taskId, !currentStatus);
    // No need to manually update state - listener will emit new data
  } catch (error) {
    toast.error('Failed to update task');
  } finally {
    setLoading(false);
  }
}
```

### Pattern 3: Real-Time Dashboard

```javascript
export default function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Listen to daily progress
    const unsub1 = watchDailyProgress(userId, setProgress);
    
    // Listen to score history
    const unsub2 = watchScoreHistory(userId, setHistory, 30);

    return () => {
      unsub1();
      unsub2();
    };
  }, [userId]);

  return (
    <>
      <AdaptiveChecklist />
      <StreakTracker />
      <ScoreTrendChart />
    </>
  );
}
```

---

## Troubleshooting

### Components not updating
- Check listeners are subscribed in useEffect
- Verify unsubscribe functions are called on unmount
- Check Firebase document exists in database

### Tasks not completing
- Verify userId is set correctly
- Check taskId matches database
- Ensure Firebase has write permissions

### Scores not reducing
- Check task completed count > 0
- Verify max 10-point limit not reached
- Check streak bonus is being applied

---

## Performance Tips

1. **Use single listener per component** (not multiple listeners)
2. **Unsubscribe on unmount** (prevents memory leaks)
3. **Batch Firebase updates** (updateTaskCompletion handles this)
4. **Limit score history** (default 30 days, adjust as needed)
5. **Memoize callbacks** (useCallback for listeners)

---

**See ADAPTIVE_DAILY_CHECKLIST_INTEGRATION.md for complete integration guide.**
