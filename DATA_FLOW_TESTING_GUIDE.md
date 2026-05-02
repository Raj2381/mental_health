# Data Flow - Quick Testing Guide

## 5-Minute Test to Verify Everything Works

### Test Flow:
1. **Submit Assessment** (2 min)
2. **Check Firestore** (2 min)
3. **Check Dashboard** (1 min)

---

## Step 1: Submit Assessment (2 min)

```
1. Open browser DevTools (F12) → Console tab
2. Login to app
3. Navigate to /assessment
4. Answer all 25 questions
5. Click Submit
6. Watch Console for logs:

Expected logs in order:
  🔄 [Wellness] Processing assessment answers...
  ✅ [Wellness] Scores calculated: { academicStress: 65, ... }
  💾 [Wellness] Saving to Firestore...
  ✅ [Wellness] Scores saved to user document
  🎯 [Wellness] Generating personalized tasks...
  ✅ [Wellness] Tasks generated & saved: 4 tasks
  ✅ [Wellness] Complete pipeline finished!
  
7. Redirects to /dashboard/student
```

---

## Step 2: Check Firestore (2 min)

### Location 1: User Document Scores

```
Firebase Console → Firestore → users/{yourUserId}
Expected fields to see:
  ✅ riskScore: 72 (or any 0-100 number)
  ✅ riskLevel: "Low" or "Medium" or "High"
  ✅ riskColor: "emerald" or "yellow" or "red"
  ✅ categoryScores: {
       academic: 65,
       social: 70,
       sleep: 80,
       anxiety: 60,
       emotional: 75
     }
  ✅ lastAssessmentUpdated: timestamp

If ANY of these are missing → Pipeline not saving correctly
```

### Location 2: Daily Tasks

```
Firebase Console → Firestore → users/{yourUserId} → dailyTasks → {today's date}
Expected structure:
  ✅ tasks: [
       {
         title: "Break assignments into 25-min sprints",
         impact: "Reduce overwhelm",
         reason: "Too many assignments"
       },
       { ... }, { ... }, { ... }  ← 4 tasks total
     ]
  ✅ lowestCategory: "academic" (or other category with lowest score)
  ✅ riskLevel: "Low" (matches user's riskLevel)
  ✅ completed: [] (empty until user checks off tasks)
  ✅ generatedAt: timestamp

If tasks array is empty or missing → Task generation not working
```

---

## Step 3: Check Dashboard (1 min)

### Risk Score Card (Top Left)
```
Should display:
  ✅ Score number: 72 (real number, not 0)
  ✅ Risk level: "Low" / "Medium" / "High" (colored badge)
  ✅ Color: Emerald/Yellow/Red (matching riskColor)
  
NOT okay:
  ❌ Score: 0
  ❌ "No data" message
  ❌ All cards showing default values
```

### Mental Health Pie Chart
```
Should display:
  ✅ 5 colored segments (one per category)
  ✅ Labels: Academic, Social, Sleep, Anxiety, Emotional
  ✅ Percentages adding to 100%
  ✅ Data from categoryScores in Firestore
  
NOT okay:
  ❌ Empty chart
  ❌ No segments
  ❌ All values zero
```

### Tasks List
```
Should display:
  ✅ 4 tasks in the list
  ✅ Real task titles: "Break assignments...", etc
  ✅ Impact badges: "Reduce overwhelm", etc
  ✅ Checkboxes to mark complete
  
NOT okay:
  ❌ "No tasks" message
  ❌ Empty task list
  ❌ Generic placeholder tasks
```

### Streak Card
```
Should display:
  ✅ Real streak number from profile
  ✅ Consecutive days maintained
  
NOT okay:
  ❌ Always 0
  ❌ "N/A" message
```

---

## What to Check in Browser Console

### Success Indicators:
```
Look for these log patterns:

✅ Processing assessment answers...
✅ Scores calculated: { academicStress: ... }
✅ Saving to Firestore...
✅ Scores saved to user document
✅ Generating personalized tasks...
✅ Tasks generated & saved: 4 tasks
✅ Complete pipeline finished!

✅ Dashboard Profile Loaded: { name, email, ... }
✅ Wellness Data Loaded: { riskScore, riskLevel, ... }
```

### Error Patterns to Watch For:
```
❌ Could not resolve import
❌ TypeError: processCompleteAssessmentPipeline is not a function
❌ Firestore save error
❌ Task generation failed
❌ Any red error messages with stack trace

If you see errors:
1. Check browser console for error details
2. Check Firebase Console for Firestore errors
3. Verify Firestore rules allow write to users/{uid}
```

---

## Data Flow Verification Checklist

After submitting assessment, verify each step:

### Step 1: Calculation ✅
- [ ] Console shows score calculation
- [ ] Score is 0-100 (not negative or >100)
- [ ] Category scores sum to reasonable total

### Step 2: Firestore Storage ✅
- [ ] users/{uid} document has riskScore field
- [ ] riskScore matches console log value
- [ ] categoryScores object exists with 5 fields
- [ ] lastAssessmentUpdated timestamp is recent

### Step 3: Task Generation ✅
- [ ] users/{uid}/dailyTasks/{today} document exists
- [ ] tasks array has 4 items
- [ ] lowestCategory matches lowest score
- [ ] riskLevel field exists

### Step 4: Dashboard Display ✅
- [ ] Risk Score Card shows real number
- [ ] Pie chart has 5 colored segments
- [ ] Task list shows 4 tasks
- [ ] Streak card shows real number

### Step 5: Real-time Sync ✅
- [ ] Open dashboard in second tab
- [ ] Submit new assessment in first tab
- [ ] Second tab updates automatically
- [ ] No page refresh needed

---

## Troubleshooting

### Problem: Dashboard shows all zeros
```
Solution:
1. Check Firebase Console for users/{uid} document
2. Verify riskScore field exists and has value > 0
3. Check console for errors in watchWellnessData
4. Verify userId matches assessment userId
```

### Problem: No tasks showing
```
Solution:
1. Check Firebase Console for users/{uid}/dailyTasks/{today}
2. Verify tasks array is not empty
3. Check console for "Task generation error"
4. Verify lowestCategory was identified correctly
```

### Problem: Assessment doesn't submit
```
Solution:
1. Check browser console for JavaScript errors
2. Verify all 25 questions answered
3. Check Firebase rules allow write to assessments collection
4. Verify user is authenticated
```

### Problem: Real-time updates not working
```
Solution:
1. Check that onSnapshot listeners are set up
2. Verify unsubscribe functions are called on cleanup
3. Check for "Real-time watch error" in console
4. Try refreshing dashboard to verify data loads
```

---

## Performance Checklist

### File Sizes (Should be reasonable):
- wellnessDataFlow.js: < 50 KB
- Assessment.jsx: < 80 KB
- Dashboard.jsx: < 150 KB

### Load Time (Should be fast):
- Assessment submission: < 2 seconds
- Dashboard load: < 1 second
- Pie chart render: < 500 ms

### Database Reads (Should be minimal):
- Each user session: 1 read to users/{uid}
- Real-time listeners: continuous small reads
- No full-collection scans

---

## Quick Commands for Testing

### In Browser Console:
```javascript
// Check if user is logged in
getCurrentUser()

// Manually fetch wellness data
const wellnessData = await fetchWellnessData('userId')
console.log(wellnessData)

// Check latest assessment
const assessments = await getAssessments('userId')
console.log(assessments[0])

// Check today's tasks
const tasks = await fetchTodaysTasks('userId')
console.log(tasks)
```

---

## Success Criteria

After following all steps above, if you see:

✅ Assessment submits without errors
✅ Console shows complete processing pipeline
✅ Firestore stores riskScore and categoryScores
✅ Tasks are generated and stored
✅ Dashboard displays real data (not zeros)
✅ Pie chart renders with real values
✅ Task list shows 4 personalized tasks
✅ Real-time updates work across tabs

**→ Data flow is working correctly!** 🎉

---

## Next Debug Steps (If Issues Persist)

1. Check Firebase Firestore Rules:
   - Allow read/write to `users/{uid}` for authenticated users
   - Allow read/write to `users/{uid}/dailyTasks/{date}`

2. Check Firebase Cloud Function Logs:
   - Verify no server-side errors during save

3. Check Assessment Form Validation:
   - Verify all 25 questions have answers before submit

4. Check Category Scoring:
   - Print categoryScores to console
   - Verify each is 0-100 (not negative/over 100)

5. Check Firestore Indexes:
   - Some queries might need composite indexes
   - Check Firebase Console for index creation prompts

---

**Test Date:** ______
**Test Status:** ✅ Pass / ❌ Fail
**Issues Found:** ___________________
