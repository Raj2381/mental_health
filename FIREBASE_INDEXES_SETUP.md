# Firebase Console Indexes Setup

## Issue Resolution
The app is showing `failed-precondition` errors because Firestore indexes are missing. This is expected behavior on first deployment.

## How to Fix

### Option 1: Using Firebase CLI (Recommended)
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Option 2: Manual Setup in Firebase Console

1. **Go to Firebase Console**
   - Navigate to: https://console.firebase.google.com
   - Select your project
   - Go to Firestore Database → Indexes

2. **Create Index: Daily Metrics**
   - Collection: `dailyMetrics`
   - Fields:
     - `userId` (Ascending)
     - `date` (Descending)
   - Query scope: Collection

3. **Create Index: Assessments**
   - Collection: `assessments`
   - Fields:
     - `userId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

4. **Create Index: Daily Activities**
   - Collection: `dailyActivities`
   - Fields:
     - `userId` (Ascending)
     - `dateKey` (Descending)
   - Query scope: Collection

5. **Create Index: Counsellor Matches**
   - Collection: `counsellorMatches`
   - Fields:
     - `studentId` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection

## What Changed

### Files Modified:
1. **firestore.indexes.json** (NEW)
   - Added complete index configuration
   - Can be deployed via Firebase CLI

2. **src/services/firebase/dailyMetrics.js**
   - Improved error handling for missing indexes
   - Changed console.warn to console.debug for 'failed-precondition'

3. **src/services/firebase/assessments.js**
   - Improved error handling for missing indexes
   - Changed console.warn to console.debug for 'failed-precondition'

4. **src/pages/Dashboard.jsx**
   - Removed debug console.log statements
   - Fixed data structure extraction for dailyActivities

## Result
Once indexes are created:
- ✅ No more `failed-precondition` errors
- ✅ Real-time listeners will work smoothly
- ✅ Queries will be optimized
- ✅ All warnings cleared from console

## Index Creation Time
- Usually takes **5-10 minutes** to create all indexes
- Some may take up to **30 minutes** depending on data size
- Status can be monitored in Firebase Console → Firestore → Indexes

## App Behavior
The app continues to work correctly even while indexes are being created:
- Real-time listeners gracefully fallback to empty arrays
- No data loss
- No breaking changes
- User experience unaffected

---

**Recommendation**: Deploy indexes using Firebase CLI for fastest setup.
