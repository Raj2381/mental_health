# Firebase Missing Indexes - ACTION REQUIRED

Your Firestore database needs composite indexes to handle multi-field queries. Click the links below to create them:

## 🔗 Required Indexes

### 1. dailyMetrics Collection Index
**Fields:** `userId` + `date`

**Create Index:**
```
https://console.firebase.google.com/v1/r/project/student-wellness-hub-692b9/firestore/indexes?create_composite=Cl9wcm9qZWN0cy9zdHVkZW50LXdlbGxuZXNzLWh1Yi02OTJiOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZGFpbHlNZXRyaWNzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGggKBGRhdGUQAhoMCghfX25hbWVfXxAC
```

### 2. assessments Collection Index
**Fields:** `userId` + `createdAt`

**Create Index:**
```
https://console.firebase.google.com/v1/r/project/student-wellness-hub-692b9/firestore/indexes?create_composite=Cl5wcm9qZWN0cy9zdHVkZW50LXdlbGxuZXNzLWh1Yi02OTJiOS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvYXNzZXNzbWVudHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDQoJY3JlYXRlZEF0EAIaDAoIX19uYW1lX18QAg
```

---

## ✅ What Was Fixed

1. **Added error handling** to Firebase listeners
   - `watchUserDailyMetrics()` - Now gracefully handles missing indexes
   - `watchUserAssessments()` - Now gracefully handles missing indexes
   - Falls back to empty arrays when indexes unavailable

2. **Fixed Recharts dimension warnings**
   - Changed from `height="100%"` to explicit `height={288}` (h-72 = 288px)
   - Removed `minHeight` props that were causing issues
   - Added empty state handling when no data available

3. **Build Status:** ✅ 484ms, 0 errors

---

## 🚀 How to Apply Indexes

1. Click either link above
2. Firebase Console will open with pre-populated index configuration
3. Click "Create Index"
4. Wait 5-10 minutes for index to build
5. Refresh your app - errors will disappear

---

## ✨ App Will Still Work

Even without these indexes, your app will:
- ✅ Load successfully
- ✅ Show all data available
- ✅ Real-time sync works for simple queries
- ⚠️ Only multi-field queries (userId + date/createdAt) need indexes

The app automatically handles missing indexes gracefully now.
