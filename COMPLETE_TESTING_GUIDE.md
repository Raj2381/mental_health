# Complete Testing Guide - Student Wellness SaaS Fixes

## 🎯 Pre-Testing Checklist

- [ ] Backend server is running
- [ ] Firebase project is configured
- [ ] Test users exist (1 student, 1 counsellor)
- [ ] Open browser console to see logs
- [ ] Have two browsers/tabs ready for real-time testing

---

## 📊 TEST 1: Daily Progress Display Fix

### Objective
Verify that Dashboard shows correct progress count (not 0/8) and updates in real-time.

### Steps

#### 1.1 Initial Load Test
```
1. Login as student
2. Navigate to Dashboard
3. Look for "Today's snapshot" card showing large count
   Expected: X/8 (e.g., 3/8, 5/8) - NOT 0/8
   Check console: Should see "Daily activities synced: {completedCount: X, totalCount: 8}"
4. Check "Completion" card
   Expected: Shows percentage bar and percentage value
5. Check if numbers match across cards
```

**Expected Console Output:**
```
Dashboard dailyActivity: {completedCount: 5, totalCount: 8, progressPercent: 62, ...}
Daily activities synced: {completedCount: 5, totalCount: 8, ...}
watchDailyActivities emitting: {completedCount: 5, totalCount: 8, ...}
```

#### 1.2 Real-Time Update Test
```
1. On Dashboard, note the current progress count (e.g., 3/8)
2. Navigate to Progress page
3. Click toggle on ANY uncompleted activity
4. Watch: Count should update to 4/8 immediately
5. Toggle again - should become 3/8
6. Go back to Dashboard
7. Count should match what you see on Progress page

Repeat with 2-3 different activities
```

**Expected Console Output:**
```
Progress updated in real-time: {completedCount: 4, totalCount: 8, ...}
Dashboard dailyActivity: {completedCount: 4, totalCount: 8, ...}
```

#### 1.3 Refresh Persistence Test
```
1. On Dashboard with progress showing (e.g., 5/8)
2. Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Wait for Dashboard to load
4. Count should still show 5/8 (not reset to 0/8)
5. Console should show Firebase loading previous day's progress
```

#### 1.4 Daily Reset Test
```
1. Note today's date
2. Check progress shows correct count for TODAY only
3. Open browser dev tools → Application → IndexedDB/LocalStorage
4. Verify dateKey is today's date (format: 2026-03-31)
5. If testing overnight, verify progress resets at midnight
```

### ✅ Success Criteria
- [ ] Dashboard always shows X/8 format (never 0/8)
- [ ] Completion percentage matches count calculation
- [ ] Progress updates instantly when toggling activities
- [ ] Progress persists after refresh
- [ ] No errors in console related to progress

---

## 🎫 TEST 2: Appointment Booking Flow

### Objective
Verify complete booking flow from student request to counsellor acceptance.

### Steps

#### 2.1 Booking Button Visibility
```
1. Login as student
2. Navigate to Dashboard
3. Look for "Assigned Counsellor" card
4. Verify card shows:
   - Counsellor name ✓
   - Specialization ✓
   - Primary concern ✓
   - "Book Session" button (blue gradient) ✓
5. If no button visible → FAILURE
```

#### 2.2 Booking Modal Opening
```
1. Click "Book Session" button
2. Modal should slide in with:
   - "Schedule a counsellor session" title ✓
   - Counsellor dropdown ✓
   - Date picker ✓
   - Time picker ✓
   - Message/reason text area ✓
   - Submit button ✓
3. Fill in form:
   - Select counsellor (should be pre-filled)
   - Pick date: tomorrow or later
   - Pick time: any time (e.g., 14:00)
   - Type message: "Help with stress"
4. Click Submit
5. Should show success toast: "Session booked successfully"
6. Modal should close
```

**Console Check:**
```
Should see logs related to appointment creation
```

#### 2.3 Appointment Appears on Student Dashboard
```
1. After booking, check "Appointments" section
2. Should see new appointment card with:
   - Counsellor name ✓
   - Status badge: "pending" (amber/yellow) ✓
   - Date and time ✓
   - Message/reason ✓
3. Open Console
   Expected: "Appointment created successfully"
```

#### 2.4 Verify Appointment in Firestore
```
1. Open Firebase Console (firestore.google.com)
2. Navigate to appointments collection
3. Look for newest document
4. Verify fields:
   - studentId: matches logged-in student ✓
   - counsellorId: correct counsellor ✓
   - status: "pending" ✓
   - date: what you entered ✓
   - time: what you entered ✓
   - createdAt: current timestamp ✓
```

### ✅ Success Criteria
- [ ] Book Session button visible on assigned counsellor card
- [ ] Booking modal opens and accepts input
- [ ] Success toast appears after submit
- [ ] Appointment appears on Dashboard immediately
- [ ] Firebase shows appointment in collection
- [ ] Status is "pending"

---

## 👨‍⚕️ TEST 3: Counsellor Receives Requests (Real-Time)

### Objective
Verify counsellor dashboard updates in real-time when student books.

### Steps

#### 3.1 Setup for Real-Time Test
```
1. Open TWO browser windows/tabs:
   - Tab A: Student logged in, on Dashboard
   - Tab B: Counsellor logged in, on Counsellor Dashboard
2. In Tab B, look for "Appointment Requests" section
3. Note current count of appointments (e.g., 0)
```

#### 3.2 Real-Time Booking Delivery
```
In Tab A (Student):
1. Go to Dashboard
2. Click "Book Session"
3. Fill form and submit
4. See success toast

IMMEDIATELY Switch to Tab B (Counsellor):
5. WITHOUT refreshing, check "Appointment Requests" section
6. New appointment should appear INSTANTLY
7. Check console: Should see "Appointments updated: X"
8. Card should show:
   - Student name ✓
   - Status "pending" ✓
   - Date/time ✓
   - Accept button ✓
   - Reject button ✓
```

**Expected Console Logs in Tab B:**
```
[Dashboard] Appointments updated: 1
watchCounsellorAppointments: 1 new appointment(s)
```

#### 3.3 Performance Check
```
Measure time from:
  - Student clicks Submit (start)
  - Counsellor sees appointment (end)
  
Expected: < 2 seconds (real-time Firebase)
```

### ✅ Success Criteria
- [ ] Counsellor dashboard updates without refresh
- [ ] Appointment appears within 2 seconds
- [ ] All appointment details are visible
- [ ] Accept/Reject buttons are available

---

## ✅ TEST 4: Counsellor Accepts Appointment

### Objective
Verify appointment status updates and chat is enabled.

### Steps

#### 4.1 Accept Button Functionality
```
As Counsellor (Tab B):
1. In Appointment Requests section, find the new appointment
2. Click "Accept" button (green)
3. Button should disappear
4. Status should change from "pending" to "accepted" (green badge)
5. "Mark Complete" button should appear
6. Check console: Should see "Appointment X updated to accepted"
```

#### 4.2 Student Receives Status Update
```
Switch to Tab A (Student Dashboard):
1. WITHOUT refreshing, check Appointments section
2. Same appointment status should change to "accepted" (green)
3. Check console: "Daily activities synced: ..." logs
4. Verify color changed from amber to green
5. Check notifications: Should see push notification
   "Session accepted from [counsellor name]"
```

**Expected Console in Tab A:**
```
[Dashboard] Appointments updated: 1 (with new status)
Appointment status changed to accepted
```

#### 4.3 Chat Enabled Verification
```
As Student (Tab A):
1. Look at accepted appointment card
2. Should see a "Start Chat" button or similar
3. Click it
4. Should navigate to /messages
5. Chat should be available with counsellor
```

#### 4.4 Notification Delivery
```
1. Both student and counsellor should receive push notifications
2. Check in Notifications section of dashboard
3. Or check browser notification permissions
```

### ✅ Success Criteria
- [ ] Accept button updates status to "accepted"
- [ ] Status updates in real-time on student side
- [ ] Color changes from amber to green
- [ ] Chat becomes available
- [ ] Both parties receive notifications

---

## ❌ TEST 5: Counsellor Rejects Appointment

### Objective
Verify rejection flow works properly.

### Steps

#### 5.1 Reject Button Test
```
As Counsellor:
1. Create another test appointment (repeat TEST 2 & 3)
2. Instead of Accept, click "Reject" button (red/rose)
3. Button should disappear
4. Status should change to "rejected" (red badge)
```

#### 5.2 Student Receives Rejection
```
As Student:
1. Check Appointments section
2. Status should show "rejected" (red)
3. Should see rejection notification
4. Chat should NOT be available
```

### ✅ Success Criteria
- [ ] Reject button works without errors
- [ ] Status updates to "rejected"
- [ ] Student receives notification
- [ ] Chat is disabled

---

## 🏁 TEST 6: Counsellor Marks Complete

### Objective
Verify completion flow.

### Steps

#### 6.1 Complete Button Test
```
As Counsellor:
1. Find an "accepted" appointment
2. Click "Mark Complete" button (sky/blue)
3. Button should disappear
4. Status should change to "completed" (blue badge)
```

#### 6.2 Student Receives Completion
```
As Student:
1. Check Appointments section
2. Status should show "completed" (blue)
3. Should see completion notification
```

### ✅ Success Criteria
- [ ] Complete button works
- [ ] Status updates to "completed"
- [ ] Both parties notified

---

## 🧪 TEST 7: Error Handling

### Objective
Verify system handles errors gracefully.

### Steps

#### 7.1 Network Error Test
```
1. On student dashboard, open Dev Tools
2. Network tab → Throttle to "Offline"
3. Try to book appointment
4. Should show error: "Failed to book session"
5. Re-enable network
```

#### 7.2 Missing Required Fields
```
1. Click "Book Session"
2. Try to submit WITHOUT entering date
3. Should show error: "Choose a date and time"
4. Fill date but not time
5. Should show same error
6. All fields filled - should work
```

#### 7.3 Invalid Status Update
```
As Counsellor:
1. Open browser console
2. Try to manually call: updateAppointmentStatus('invalid-id', 'test')
3. Should see error: "updateAppointmentStatus: id and status are required"
```

### ✅ Success Criteria
- [ ] Network errors handled gracefully
- [ ] Form validation works
- [ ] Invalid operations show errors
- [ ] No silent failures

---

## 📈 TEST 8: Multiple Appointments

### Objective
Verify system handles multiple concurrent appointments.

### Steps

#### 8.1 Create Multiple Bookings
```
As Student:
1. Book appointment with Counsellor A
2. Book appointment with Counsellor B
3. Book appointment with Counsellor C
4. All should appear in Appointments section
5. Verify all show as "pending"
```

#### 8.2 Accept Different Statuses
```
As Counsellor A:
1. Accept first appointment
2. Status should change to "accepted"

As Counsellor B:
1. Reject second appointment
2. Status should change to "rejected"

As Counsellor C:
1. Leave third as pending

As Student:
1. Check Appointments section
2. Should show:
   - Appointment A: "accepted" (green)
   - Appointment B: "rejected" (red)
   - Appointment C: "pending" (amber)
```

### ✅ Success Criteria
- [ ] Multiple appointments display correctly
- [ ] Different statuses don't interfere
- [ ] Each counsellor only sees their appointments
- [ ] No data mixing

---

## 🔍 Debugging Guide

### If Progress Shows 0/8
```
1. Open Console
2. Check for errors in Firebase connection
3. Verify student_data collection has documents
4. Check if daily activities are being saved to Firebase
5. Check: db → Collections → student_data → [userId]
6. Verify dailyActivities field exists and has values
```

### If Appointment Doesn't Appear on Counsellor Dashboard
```
1. Check console for "watchCounsellorAppointments" logs
2. Verify counsellorId is being passed correctly
3. Check Firebase: appointments → filter by counsellorId
4. Try hard refresh (Ctrl+Shift+R)
5. Check if onSnapshot listener is active
   - Open Dev Tools → Network → Filter: firestore
   - Look for update messages
```

### If Real-Time Updates Don't Work
```
1. Check Firebase Realtime Database rules
2. Verify Firestore listeners are set up:
   - Dashboard.jsx line ~62-74
   - CounsellorDashboard.jsx line ~35-50
3. Check console for any onSnapshot errors
4. Try different browsers (some extensions block real-time)
5. Check internet connection (WebSocket required)
```

### If Chat Doesn't Open After Accept
```
1. Verify chatId field is being set in appointments
2. Check if ensureChat function succeeded
3. Verify chats collection was created
4. Check if /messages route exists
5. Try navigating to /messages manually with chatId
```

---

## 📋 Final Checklist

### Progress Display
- [ ] Dashboard shows X/8 format
- [ ] Updates on activity toggle
- [ ] Persists after refresh
- [ ] Percentage bar matches count

### Booking
- [ ] Book Session button visible
- [ ] Modal opens and accepts input
- [ ] Success toast appears
- [ ] Appointment appears on dashboard

### Real-Time Sync
- [ ] Counsellor receives booking instantly
- [ ] Student receives status updates instantly
- [ ] Colors update based on status
- [ ] No manual refresh needed

### Status Changes
- [ ] Accept works and enables chat
- [ ] Reject works and shows status
- [ ] Complete works and notifies
- [ ] Notifications appear on both sides

### Edge Cases
- [ ] Multiple appointments handled
- [ ] Network errors handled
- [ ] Form validation works
- [ ] Invalid data rejected

### Console Health
- [ ] No JavaScript errors
- [ ] Expected logs appear
- [ ] No Firebase auth errors
- [ ] No Firestore permission denied

---

## 🚀 Sign-Off

When all tests pass, the system is ready for:
- [ ] Production deployment
- [ ] User acceptance testing
- [ ] Load testing with multiple users
- [ ] Mobile app testing

