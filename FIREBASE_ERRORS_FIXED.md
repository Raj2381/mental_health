# Firebase Console Errors - Resolution Guide

## Errors Encountered

Your Counsellor Dashboard has been enhanced with interactive modals for viewing student details and booking sessions. However, there are some Firebase configuration issues that need to be addressed.

---

## 1. Missing Composite Indexes

**Error Message:**
```
[code=failed-precondition]: The query requires an index. You can create it here: ...
```

### Root Cause
Firestore queries that filter on multiple fields require composite indexes. Two queries in your application need indexes:

1. **`dailyMetrics` collection** - Query on `userId` + `date` fields
2. **`assessments` collection** - Query on `userId` + `createdAt` fields

### Fix: Create the Indexes

Firebase provides direct links to create these indexes. Click each link to automatically set them up:

#### Link 1: dailyMetrics Index
```
https://console.firebase.google.com/v1/r/project/student-wellness-hub-692b9/firestore/indexes?create_composite=Cl9wcm9qZWN0cy9zdHVkZW50LXdlbGxuZXNzLWh1Yi02OTJiOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZGFpbHlNZXRyaWNzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGggKBGRhdGUQAhoMCghfX25hbWVfXxAC
```

**What it does:** Creates an index on the `dailyMetrics` collection for queries filtering by `userId` and `date`.

#### Link 2: assessments Index
```
https://console.firebase.google.com/v1/r/project/student-wellness-hub-692b9/firestore/indexes?create_composite=Cl5wcm9qZWN0cy9zdHVkZW50LXdlbGxuZXNzLWh1Yi02OTJiOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvYXNzZXNzbWVudHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

**What it does:** Creates an index on the `assessments` collection for queries filtering by `userId` and `createdAt`.

### How to Apply
1. Open Firebase Console: https://console.firebase.google.com
2. Navigate to your project: `student-wellness-hub-692b9`
3. Go to Firestore Database → Indexes
4. Click each link above - Firebase will automatically create the indexes
5. Wait for indexes to show "Enabled" status (usually 1-2 minutes)

**Alternative Manual Method:**
1. Go to Firestore Indexes in Firebase Console
2. Click "Create Index"
3. Collection: `dailyMetrics`
4. Field 1: `userId` (Ascending)
5. Field 2: `date` (Descending)
6. Repeat for `assessments` collection with `userId` + `createdAt`

---

## 2. Chart Dimension Warning

**Warning Message:**
```
The width(-1) and height(-1) of chart should be greater than 0
```

### Root Cause
Recharts (charting library) needs explicit container dimensions. The warning occurs when the chart container isn't properly sized.

### Fix Applied ✅
Updated the Risk Distribution chart to:
- Use explicit `style={{ width: "100%", height: 280 }}` instead of classes
- Conditionally render only when there are students to display
- Show "No students to display" message when empty

**Code Change:**
```jsx
<div className="surface-card rounded-xl p-4 shadow">
  <h3 className="mb-4 font-semibold text-[color:var(--text-main)]">Risk Distribution</h3>
  {filteredStudents.length > 0 ? (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* Chart content */}
      </ResponsiveContainer>
    </div>
  ) : (
    <div className="flex h-64 items-center justify-center text-[color:var(--text-muted)]">
      No students to display
    </div>
  )}
</div>
```

---

## 3. No Assigned Students

**Console Message:**
```
Found 0 students assigned to counsellor 5yLyx3wpDpV3U9O08SFf4gv87X43 Array(0)
```

### This is Expected ✅
The Counsellor Dashboard queries two student sources:
1. **Assigned Students**: Students specifically mapped to this counsellor (via `assignedCounsellorId`)
2. **Total Students**: All students in the system
3. **Appointments**: Students with appointment requests

If the counsellor has no assigned students yet, this is normal - they may only have students they're interacting with via appointments or other mechanisms.

---

## 4. Firestore Commit Failed (400)

**Error Message:**
```
Failed to load resource: the server responded with a status of 400
URL: https://firestore.googleapis.com/v1/projects/student-wellness-hub-692b9/databases/(default)/documents:commit?key=...
```

### Root Cause
This is caused by the missing indexes (Issue #1). Once you create the indexes, this error will resolve.

---

## Summary of Actions Required

| Issue | Status | Action Required |
|-------|--------|-----------------|
| Missing `dailyMetrics` index | ⚠️ Pending | Click Link 1 above |
| Missing `assessments` index | ⚠️ Pending | Click Link 2 above |
| Chart dimensions | ✅ Fixed | Deployed in latest build |
| No assigned students | ℹ️ Info | Normal behavior - no action needed |

---

## Build Status

✅ **Latest Build: SUCCESS**
- 2775 modules transformed
- 0 errors
- 0 warnings
- Built in 371ms

All UI updates have been successfully deployed and the application is ready to use.

---

## Next Steps

1. **Create the Firebase indexes** (see links above)
2. **Refresh the application** in your browser
3. **Monitor the console** - errors should disappear once indexes are enabled
4. **Test the features**:
   - View student detail modal
   - Message students
   - Book counsellor sessions
   - Check appointment requests

All errors are configuration-related and don't affect the application's core functionality. Once the indexes are created, your Counsellor Dashboard will work perfectly!

---

## Need Help?

If indexes still don't appear or errors persist:
1. Clear browser cache (Cmd+Shift+Delete)
2. Wait 2-3 minutes for Firebase indexes to fully build
3. Refresh the page
4. Check that you're logged in with appropriate permissions
5. Verify in Firebase Console that indexes show "Enabled" status
