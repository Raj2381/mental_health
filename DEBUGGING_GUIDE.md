# 🔍 DEBUGGING GUIDE - COUNSELLOR DASHBOARD

## How to Test Real-Time Updates

### 1. Open Browser DevTools
- Press `F12` or `Cmd+Option+I` (Mac)
- Go to **Console** tab
- Keep it open while testing

### 2. Monitor Console Logs

You'll see real-time logs like:

```
[Dashboard] All students updated: 42
[Dashboard] Assigned students updated: 5
[watchAssignedStudents] Found 5 students assigned to counsellor ABC123
[watchAllStudentsFromUsers] Found 42 total students
[Dashboard] Accessible student IDs: [...]
[Dashboard] Appointments updated: 3
[Dashboard] Notifications updated: 7
[Dashboard] Assessments updated: 5
```

### 3. Test New Student Registration

1. Go to **Signup** page
2. Create a new student account
3. Watch console for:
   ```
   [autoAssignCounsellor] Student XXX assigned to counsellor YYY (Name)
   ```
4. Login as that student
5. Go to counsellor dashboard
6. Verify the new student appears in "Assigned Students" count

### 4. Verify Real-Time Data

#### Test 1: Check Total vs Assigned
```
Expected: "Total Students" > "Assigned Students"
Example: Total = 42, Assigned = 5
```

#### Test 2: Check Student Names
- Assigned students should show with their names
- Fallback: First 6 chars of ID if name missing

#### Test 3: Check Risk Scores
- High Risk: Score > 75
- Moderate: Score 50-75
- Low: Score < 50

#### Test 4: Monitor Data Flow
New students created → Auto-assigned → Appear in dashboard within 1-2 seconds

---

## Common Issues & Solutions

### Issue: "Total Students" shows 0
**Cause:** watchAllStudentsFromUsers not syncing
**Solution:** Check console for errors, verify Firebase rules allow reading users collection

### Issue: "Assigned Students" shows 0
**Cause:** autoAssignCounsellor failed or counsellor ID mismatch
**Solution:** 
1. Check student record has `assignedCounsellorId` field
2. Verify counsellor ID is correct
3. Check Firebase console for write errors

### Issue: Student names show as "Student ABC123"
**Cause:** allStudents not populated
**Solution:** Verify watchAllStudentsFromUsers is firing and studentNameMap is built

### Issue: Console shows too many logs
**Solution:** Temporarily disable logs by commenting out console.log in:
- `src/services/firebase/students.js`
- `src/pages/Counsellor/CounsellorDashboard.jsx`

---

## Firebase Data Verification

### Check User Collection Structure

Open Firebase Console → Firestore Database → `users` collection:

```
users/
├─ student_uid_1/
│  ├─ name: "John Doe"
│  ├─ email: "john@example.com"
│  ├─ role: "student"
│  ├─ assignedCounsellorId: "counsellor_uid_1"  ← KEY FIELD
│  ├─ assignedCounsellorName: "Dr. Smith"
│  └─ assignedAt: Timestamp
│
├─ counsellor_uid_1/
│  ├─ name: "Dr. Smith"
│  ├─ role: "counsellor"
│  └─ ...
│
└─ student_uid_2/
   ├─ assignedCounsellorId: "counsellor_uid_1"
   └─ ...
```

### Required Fields for Students
- `role` = "student"
- `assignedCounsellorId` = counsellor's UID
- `name` = student name (optional fallback)
- `email` = email address

---

## Performance Monitoring

### Real-Time Listener Count
Open DevTools → Storage → Firebase Realtime Database
Should show active listeners:
- watchAllStudentsFromUsers
- watchAssignedStudents
- watchCounsellorAppointments
- watchUserNotifications
- watchAssessmentsForUserIds

### Network Activity
Go to DevTools → Network → Filter by "firestore"
Should see:
- `listCollections` - Initial data fetch
- Continuous updates on Firestore changes

### Memory Usage
DevTools → Memory → Take heap snapshot
Check for:
- No memory leaks in useEffect cleanup
- All unsubs called on unmount

---

## Manual Testing Checklist

- [ ] New student signup auto-assigns counsellor
- [ ] Counsellor sees new student in dashboard within 2 seconds
- [ ] Total student count increases
- [ ] Assigned student count increases
- [ ] Student names display correctly
- [ ] Risk scores calculated correctly
- [ ] Appointment requests sync in real-time
- [ ] Notifications sync in real-time
- [ ] Filters work (search, risk level, category)
- [ ] Charts update with new data
- [ ] No console errors
- [ ] Build compiles without warnings

---

## Code Inspection Points

### students.js - Line 24
```javascript
where("assignedCounsellorId", "==", counsellorId)
```
✓ Correct field name for querying assigned students

### students.js - Line 37
```javascript
where("role", "==", "student")
```
✓ Filters only student role records

### CounsellorDashboard.jsx - Line 37
```javascript
watchAllStudentsFromUsers((students) => {
  console.log("[Dashboard] All students updated:", students.length);
  setAllStudents(students);
}),
```
✓ Watches all students for total count

### CounsellorDashboard.jsx - Line 43
```javascript
watchAssignedStudents(auth.currentUser.uid, (students) => {
  console.log("[Dashboard] Assigned students updated:", students.length);
  setAssignedStudents(students);
}),
```
✓ Watches assigned students

### CounsellorDashboard.jsx - Line 215
```javascript
<Card 
  title="Total Students" 
  value={overview.totalAll} 
  subtitle="All registered students" 
/>
```
✓ Displays total student count

### Signup.jsx - Line 170
```javascript
await autoAssignCounsellor(user.uid);
```
✓ Auto-assigns counsellor on signup

---

## Batch Test Script

Run this in console after logging in as counsellor:

```javascript
// Check watchers state
console.log("=== DASHBOARD STATE ===");
console.log("Check Network tab for active Firestore listeners");

// Simulate data changes
setTimeout(() => {
  console.log("Waiting for real-time updates...");
  console.log("New data should appear within 1-2 seconds");
}, 1000);
```

---

## Support

If issues persist:
1. Check Firebase Security Rules (should allow reads from users collection)
2. Verify student records have `assignedCounsellorId` field
3. Check browser console for errors (F12 → Console)
4. Verify Firestore database structure matches schema
5. Check network connectivity (DevTools → Network)
