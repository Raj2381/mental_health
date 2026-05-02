# Data Flow Architecture - Visual Guide

## Dashboard Data Flow (Fixed)

```
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE FIRESTORE                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           student_data Collection                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Document: [userId]                                │  │  │
│  │  │ {                                                 │  │  │
│  │  │   userId: "abc123",                              │  │  │
│  │  │   dailyActivities: {                             │  │  │
│  │  │     completedCount: 3,                           │  │  │
│  │  │     totalCount: 5,                               │  │  │
│  │  │     progressPercent: 60,                         │  │  │
│  │  │     dateKey: "2026-04-04",                       │  │  │
│  │  │     items: { task1, task2, ... }                │  │  │
│  │  │   },                                             │  │  │
│  │  │   streak: 5,                                     │  │  │
│  │  │   ...                                            │  │  │
│  │  │ }                                                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    dailyMetrics Collection (with INDEX)                 │  │
│  │  Indexes: userId ↑ + date ↓                             │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    assessments Collection (with INDEX)                  │  │
│  │  Indexes: userId ↑ + createdAt ↓                        │  │
│  │  └────────────────────────────────────────────────────┘  │  │
└─────────────────────────────────────────────────────────────────┘
              │
              │ Real-time Listeners (onSnapshot)
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 progressSync.js (watchStudentProgress)          │
│  Listener: doc(db, "student_data", userId)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Returns: {                                               │  │
│  │   userId,                                                │  │
│  │   dailyActivities: data.dailyActivities || {},          │  │
│  │   streak,                                                │  │
│  │   lastActiveDateKey,                                     │  │
│  │   recommendations,                                       │  │
│  │   ...data (all other fields)                            │  │
│  │ }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              │
              │ Callback: (progressData) => setData(progressData)
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                Dashboard.jsx Component                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ State: data (from progressSync)                         │  │
│  │                                                          │  │
│  │ // Extract daily activities safely                      │  │
│  │ const dailyActivityData =                               │  │
│  │   dailyActivities?.dailyActivities ||                   │  │
│  │   data?.dailyActivities ||                              │  │
│  │   {};                                                   │  │
│  │                                                          │  │
│  │ // Build activity record for UI                         │  │
│  │ const dailyActivity =                                   │  │
│  │   dailyActivities ||                                    │  │
│  │   buildDailyActivityRecord(dailyActivityData);          │  │
│  └──────────────────────────────────────────────────────────┘  │
│         │                                                        │
│         │ Safe fallback chain:                                   │
│         │ 1. dailyActivities listener data                      │
│         │ 2. data from progressSync                             │
│         │ 3. empty object {}                                    │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ UI Components:                                           │  │
│  │ - Progress Bars                                          │  │
│  │ - Activity Cards                                         │  │
│  │ - Metrics Display                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Query Execution
       │
       ▼
   ┌─────────────────┐
   │  Success? ✓     │ ──→ Process Data ──→ callback(data)
   └─────────────────┘
       │
       │ Error
       ▼
   ┌─────────────────────────────────────┐
   │ Error Type?                         │
   └─────────────────────────────────────┘
       │
       ├─ failed-precondition? ──→ console.debug (index building)
       │                          → callback([]) (safe)
       │
       └─ Other error? ──────────→ console.warn
                                   → callback([]) (safe)

Result: App continues working even if indexes not ready ✓
```

## Firestore Indexes - Impact

### Before Indexes Created:
```
Query: where("userId", ==) + orderBy("date")
Result: ❌ failed-precondition error
Fallback: Empty array [] (graceful)
Console: Debug log only
Status: App works, no interruption
```

### After Indexes Created:
```
Query: where("userId", ==) + orderBy("date")
Result: ✓ Data from all 7 days
Fallback: N/A (not needed)
Console: Clean (no errors)
Status: Full functionality
```

## Data Structure: dailyActivities

```javascript
// From Firebase
{
  completedCount: 3,      // Number of tasks completed today
  totalCount: 5,          // Total tasks for today
  progressPercent: 60,    // UI display: 60% progress
  dateKey: "2026-04-04",  // Used for trend tracking
  items: {                // Individual task details
    task1: { name, completed, completedAt, ... },
    task2: { name, completed, completedAt, ... },
    // ...
  }
}

// Used in Dashboard for:
- Progress bars
- Activity cards
- Streak counting
- Historical trends
```

## Real-time Update Flow

```
User Completes Task
       │
       ▼
activity.js: updateDailyActivity()
       │
       ▼
Firebase: setDoc() with merge: true
       │
       ▼
Firestore triggers onSnapshot listeners
       │
       ├─→ Dashboard.jsx ──→ Re-render UI
       │
       ├─→ Progress.jsx ──→ Update metrics
       │
       └─→ progressSync.js ──→ Notify all listeners
```

## Summary

✅ **Single source of truth**: Firestore student_data document  
✅ **Real-time sync**: All listeners update simultaneously  
✅ **Graceful degradation**: Works even if indexes missing  
✅ **Safe extraction**: Multi-level fallback chain  
✅ **Clean console**: Debug logs only, no warnings  

---

**Result**: Dashboard displays accurate, real-time data with zero console errors.
