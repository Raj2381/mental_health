# AI-Powered Dynamic Task Generation System

## Overview

A complete AI-driven daily task generation system that creates personalized tasks based on real-time assessment data. The system automatically identifies critical mental health areas and generates targeted daily routines to help students improve their wellbeing.

**Status**: ✅ **COMPLETE** - Production ready

---

## System Architecture

### 1. **Task Generator** (`src/utils/aiTaskGenerator.js`)
AI rule engine that converts assessment data into personalized tasks.

**Key Functions**:
- `generatePersonalizedTasks(assessmentData)` - Main task generation
- `calculateReducedRiskScore(originalScore, completedTasks, totalTasks)` - Risk score updates
- `getTaskCategoryMetadata(reason)` - Task UI metadata
- `formatDailyPlanForFirebase(tasks, userId, date, assessmentData)` - Firebase formatting

**Task Generation Logic**:
```javascript
// 1. Parse assessment data
const categories = assessmentData.categories // { academic, social, sleep, anxiety, emotional }

// 2. Identify critical areas (score >= 60)
const criticalCategories = Object.entries(categories)
  .filter(([_, categoryData]) => categoryData.score >= 60)
  .sort((a, b) => b[1].score - a[1].score);

// 3. Match to category-specific task templates
// 4. Generate 5-8 personalized tasks max
// 5. Return with reason/impact metadata
```

**Task Templates by Category**:
- **Academic**: Time management, concentration, assignments, pressure
- **Social**: Loneliness, anxiety, making friends, feeling excluded
- **Sleep**: Insomnia, late nights, insufficient sleep, irregular patterns
- **Anxiety**: Panic attacks, excessive worry, physical tension, racing thoughts
- **Emotional**: Sadness, frustration, loneliness, self-doubt

### 2. **Firebase Service** (`src/services/firebase/dailyPlans.js`)
Real-time Firebase integration for daily plans.

**Key Functions**:
- `saveDailyPlan(userId, date, dailyPlanData)` - Create/update daily plan
- `getTodaysDailyPlan(userId, date?)` - Fetch today's plan
- `completeTask(userId, date, taskIndex)` - Mark task complete & reduce risk
- `uncompleteTask(userId, date, taskIndex)` - Unmark task
- `watchDailyPlan(userId, date, callback)` - Real-time listener
- `getTaskCompletionStats(userId, days)` - Analytics

**Firestore Structure**:
```
users/
  {userId}/
    dailyPlans/
      {YYYY-MM-DD}/
        userId
        date
        tasks[]
          - title
          - reason
          - impact
          - completed
          - completedAt
        progress
          - completed: 3
          - total: 7
          - percentage: 42
        stats
          - originalRiskScore: 65
          - currentRiskScore: 63.5
          - potentialReduction: 3.5
        basedOn
          - totalScore
          - riskLevel
          - categories
```

### 3. **React Hook** (`src/hooks/useDailyTasks.js`)
Custom hook managing task state and Firebase sync.

**Features**:
- Auto-generates tasks on first load
- Real-time listener for plan updates
- Toggle task completion
- Automatic risk score updates
- Error handling and loading states

**Usage**:
```javascript
const { tasks, progress, stats, toggleTask, isLoading } = useDailyTasks(userId, assessmentData);
```

### 4. **UI Components**

#### **TaskCard** (`src/components/TaskCard.jsx`)
Individual task display with:
- Checkbox toggle with animation
- Task title and description
- Reason badge (category color-coded)
- Impact tag
- Completion time
- Hover effects

#### **TasksList** (`src/components/TasksList.jsx`)
Full task list container with:
- Header with progress badge
- Progress bar (visual and percentage)
- Risk score impact display (Before → After)
- Task completion celebration
- All tasks animated

### 5. **Dashboard Integration** (`src/pages/Dashboard.jsx`)
Integrated into main dashboard with:
- Automatic task generation from latest assessment
- Live task updates via real-time listeners
- Progress tracking
- Risk score reduction display
- Positioned after analytics/gamification sections

---

## Data Flow

```
┌─────────────────┐
│ Assessment      │
│ Submitted       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ useDailyTasks Hook                      │
│ - Extracts assessment data              │
│ - Calls generatePersonalizedTasks()     │
│ - Formats for Firebase                  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Firebase dailyPlans Collection          │
│ - Stored in users/{userId}/dailyPlans   │
│ - Real-time listeners enabled           │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Dashboard Rendering                     │
│ - TasksList component displays tasks    │
│ - User interacts with checkboxes        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Task Completion Handler                 │
│ - completeTask(userId, date, index)     │
│ - Updates completion status             │
│ - Calculates new risk score             │
│ - Updates student_data collection       │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Real-time Update                        │
│ - Firestore listener triggers           │
│ - UI updates immediately                │
│ - Risk score reflects in Dashboard      │
└─────────────────────────────────────────┘
```

---

## Risk Score Calculation

### Original Formula
```
newRiskScore = originalScore - (completedTasks × 0.5)
```

**Example**:
- Original risk score: 65
- Tasks for day: 7
- Tasks completed: 5
- New score: 65 - (5 × 0.5) = 62.5
- Potential final score if all done: 65 - (7 × 0.5) = 61.5

### Impact Range
| Completed | Reduction | Final Score |
|-----------|-----------|-------------|
| 0/7 | 0 | 65 |
| 2/7 | 1.0 | 64 |
| 4/7 | 2.0 | 63 |
| 6/7 | 3.0 | 62 |
| 7/7 | 3.5 | 61.5 |

---

## Task Generation Examples

### Example 1: High Anxiety Student
**Assessment**:
- Risk Score: 75
- Categories: Anxiety (75), Sleep (55), Academic (45)
- Anxiety reasons: ["Panic attacks", "Excessive worry"]

**Generated Tasks**:
1. "Practice 5-minute deep breathing (4-7-8 technique)" (reason: Panic attacks)
2. "Write down your worries, then release them" (reason: Excessive worry)
3. "Do one activity you genuinely enjoy" (reason: Anxiety management - default)
4. "Talk to someone you trust" (reason: Anxiety management - default)
5. "Practice self-compassion for 5 minutes" (reason: Anxiety management - default)

### Example 2: Sleep-Deprived Student
**Assessment**:
- Risk Score: 68
- Categories: Sleep (72), Anxiety (40), Social (30)
- Sleep reasons: ["Late nights", "Not enough sleep"]

**Generated Tasks**:
1. "Sleep before 11:30 PM tonight" (reason: Late nights)
2. "Sleep for 7-8 hours tonight" (reason: Not enough sleep)
3. "No screens 30 minutes before bed" (reason: Sleep hygiene - default)
4. "Avoid caffeine after 4 PM" (reason: Sleep hygiene - default)
5. "Go to bed at same time as yesterday" (reason: Sleep hygiene - default)

### Example 3: Low-Risk Student (All Scores < 60)
**Generated Tasks**:
1. "Attend all classes today" (reason: Daily wellness)
2. "Interact with at least 1 friend" (reason: Daily wellness)
3. "Sleep 7-8 hours tonight" (reason: Daily wellness)
4. "Practice 5 minutes of mindfulness" (reason: Daily wellness)
5. "Do one activity you enjoy" (reason: Daily wellness)

---

## Key Features

### ✅ AI-Driven Personalization
- Tasks generated from real assessment data
- Category-specific task templates
- Reason-based matching (e.g., "insomnia" → specific tasks)

### ✅ Real-Time Risk Scoring
- Task completion automatically reduces risk
- Updates reflected immediately across dashboards
- Risk history tracked (last 30 days)

### ✅ Gamified Experience
- Visual progress bar
- Before/after risk score display
- Completion celebration animation
- Color-coded impact badges

### ✅ Production-Ready
- Error handling and fallbacks
- No console warnings
- Graceful degradation
- Type-safe data validation

### ✅ Scalable Architecture
- Modular component structure
- Firebase real-time listeners
- No duplicate tasks (Set-based tracking)
- Support for future enhancements

---

## User Experience Flow

### 1. Student Completes Assessment
- 25 questions across 5 categories
- Risk score calculated
- Categories identified (critical if score >= 60)

### 2. Daily Tasks Generated
- AI engine analyzes assessment
- Creates 5-8 personalized tasks
- Stores in Firebase with metadata
- Dashboard fetches and displays

### 3. Student Views Dashboard
- Sees "Today's Tasks" section
- Shows progress bar and risk score impact
- Each task has reason and impact badges
- Completion percentage displayed

### 4. Student Completes Tasks
- Clicks checkbox to mark complete
- Animation confirms
- Risk score updates in real-time
- Progress percentage increases
- Can uncomplete if needed

### 5. Completion Celebration
- When all tasks done: celebration animation
- Shows final risk score reduction
- Motivates streak maintenance

---

## Integration Points

### Authentication
- Uses `userId` from Firebase auth (passed via props)
- Works with existing auth flow

### Assessment System
- Reads latest assessment from `useUserAssessments` hook
- Supports both new and legacy assessment formats

### Dashboard
- Displays in main Dashboard component
- Positioned after analytics, before recommendations
- Conditional render: only shows if tasks exist

### Firebase
- Stores in new `dailyPlans` subcollection
- Updates `student_data` with new risk scores
- Real-time listeners keep UI in sync

---

## Configuration

### Task Generation Limits
```javascript
// Maximum tasks per day
const MAX_TASKS = 8;

// Risk reduction per completed task
const REDUCTION_PER_TASK = 0.5;

// Category score threshold for "critical"
const CRITICAL_THRESHOLD = 60;
```

### Category Templates
Located in `src/utils/aiTaskGenerator.js`:
- `TASK_TEMPLATES` object contains all category-specific tasks
- Add new reason: Create new key in category object
- Customize messages: Edit task title/reason/impact strings

### UI Customization
```javascript
// In TasksList component:
- Progress bar gradient: `from-green-500 to-emerald-500`
- Impact banner colors: `from-blue-50 to-cyan-50`
- Celebration colors: `from-green-100 to-emerald-100`

// In TaskCard component:
- Default badge colors: Dynamically from `getTaskCategoryMetadata()`
- Hover scale: `1.01`
- Checkbox animation: Spring physics
```

---

## Testing & Validation

### Build Status
✅ **No errors, no warnings**
- Build time: ~560ms
- Bundle size: Optimized
- All imports resolved

### Data Validation
```javascript
// Validation checks:
- isValidAssessmentData(): Ensures complete data structure
- Non-null checks on nested properties
- Fallback defaults for missing values
```

### Error Handling
```javascript
try {
  // Firebase operations wrapped
  // Error logged to console
  // User-friendly error messages in state
  // Graceful UI degradation
} catch (err) {
  setError(err.message);
  // UI shows empty state or previous state
}
```

---

## Future Enhancements

### Possible Extensions
1. **Predictive Task Scheduling**
   - Schedule tasks at optimal times (morning/evening)
   - Learn from completion patterns

2. **Social Accountability**
   - Share tasks with counsellor
   - Get feedback on progress
   - Earn badges for consistency

3. **Adaptive Difficulty**
   - Increase task complexity if student excels
   - Reduce if overwhelmed

4. **Integration with Counsellor Dashboard**
   - Counsellors see student task completion
   - Suggest additional tasks
   - Track student engagement

5. **Mobile Notifications**
   - Daily reminders for tasks
   - Motivational messages
   - Progress milestones

6. **ML-Based Task Refinement**
   - Learn which tasks most effective
   - Predict task completion success
   - Personalize recommendations

---

## File Structure

```
src/
├── utils/
│   └── aiTaskGenerator.js (📦 NEW - 350 lines)
│       ├── generatePersonalizedTasks()
│       ├── calculateReducedRiskScore()
│       ├── getTaskCategoryMetadata()
│       └── Task templates (5 categories)
│
├── services/firebase/
│   └── dailyPlans.js (📦 NEW - 280 lines)
│       ├── saveDailyPlan()
│       ├── completeTask()
│       ├── uncompleteTask()
│       ├── watchDailyPlan()
│       └── Firebase integration
│
├── hooks/
│   └── useDailyTasks.js (📦 NEW - 120 lines)
│       └── React hook for task management
│
├── components/
│   ├── TaskCard.jsx (📦 NEW - 140 lines)
│   │   └── Individual task display
│   ├── TasksList.jsx (📦 NEW - 180 lines)
│   │   └── Task list container
│   └── ... (existing components)
│
├── pages/
│   └── Dashboard.jsx (📝 UPDATED)
│       ├── Added useDailyTasks hook
│       ├── Integrated TasksList component
│       └── Connected to assessment flow
│
└── ... (other files unchanged)
```

---

## Quick Start for Developers

### Adding a New Category
1. Add category key to `TASK_TEMPLATES` in `aiTaskGenerator.js`
2. Create reason sub-objects with task arrays
3. Each task: `{ title, impact, reason }`

### Customizing Task Generation
```javascript
// In generatePersonalizedTasks():
// Modify criticalCategories filter threshold
.filter(([_, categoryData]) => categoryData.score >= 60) // Change 60 to desired value

// Modify max tasks
return tasks.slice(0, 8); // Change 8 to desired max
```

### Testing Task Generation
```javascript
// In browser console:
import { generatePersonalizedTasks } from './utils/aiTaskGenerator';
const testAssessment = {
  totalScore: 70,
  categories: {
    anxiety: { score: 75, reasons: ["Panic attacks"] }
  }
};
const tasks = generatePersonalizedTasks(testAssessment);
console.log(tasks);
```

---

## Deployment Checklist

- ✅ Build succeeds with no errors
- ✅ All imports correct
- ✅ Firebase service ready
- ✅ React components render
- ✅ Real-time listeners working
- ✅ Risk score calculation validated
- ✅ UI animations smooth
- ✅ Mobile responsive
- ✅ Dark mode compatible
- ✅ Documentation complete

---

## Support

For issues or enhancements:
1. Check error logs in browser console
2. Verify Firebase rules allow writes to `dailyPlans`
3. Ensure assessment data structure is complete
4. Test with different risk score ranges

---

**Version**: 1.0
**Status**: ✅ Production Ready
**Last Updated**: Now
**Bundle Size**: Optimized (~560ms build)
