# Quick Test: Activity Tracker & Booking Fix

## Root Cause Fixed
- **Auth timing issue**: Components were using `auth.currentUser` synchronously on first render (before login state initialized). Now using `onAuthStateChanged()` to wait for auth to be ready.
- **Progress display**: Real-time listeners now activate only after user is authenticated, ensuring Firebase data loads correctly.

## Test Steps

### 1. Start the App
```bash
cd /Users/rajgupta/my-react-app
npm run dev
```
App will start on port 5173 (or 5174 if busy).

### 2. Open Browser Console
Press `F12` → Click **Console** tab

### 3. Test Progress Page (Activity Tracker)

**Expected Behavior:**
1. Navigate to `/progress` page
2. Look at the **top card** showing `X/8` (e.g., `3/8`, not `0/8`)
3. Check console for these log messages:
   ```
   Progress page: Initializing for user [uid]
   Progress page: Sync complete {completedCount: X, ...}
   Progress page: Real-time update {completedCount: X, ...}
   ```

**What to Test:**
- [ ] Correct number shows (not always 0/8)
- [ ] Console logs appear within 1-2 seconds
- [ ] Click an activity card → it toggles to green (checkmark ✓)
- [ ] Number updates immediately (e.g., 3/8 → 4/8)
- [ ] Go back to Dashboard → progress number matches

---

### 4. Test Dashboard Progress Display

**Expected Behavior:**
1. Navigate to Dashboard
2. Look at **"Today's snapshot"** card → should show `X/8` (correct count)
3. Check console for:
   ```
   Dashboard progress synced: {completedCount: X, ...}
   Daily activities synced: {completedCount: X, ...}
   ```

**What to Test:**
- [ ] Correct count displays
- [ ] Count matches Progress page
- [ ] Both console logs appear

---

### 5. Test Booking Session

**Expected Behavior:**
1. On Dashboard, find **"Assigned Counsellor"** card
2. Click **"Book Session"** button
3. Modal opens with form
4. Fill form:
   - Date: Pick tomorrow or later
   - Time: Pick any time (e.g., 10:00)
   - Message: Optional, e.g., "Discuss stress management"
5. Click **"Confirm Booking"** button

**What to Test:**
- [ ] Modal opens (not blank)
- [ ] Date & time inputs work
- [ ] **"Confirm Booking"** button changes to "Booking..." while submitting
- [ ] Success toast shows "Session booked successfully"
- [ ] Modal closes
- [ ] Appointment appears in **"Appointments"** card on Dashboard (refresh if needed)

**Check Console:**
- No red errors
- Should see booking success message

---

### 6. Verify Appointments Appear

**Expected Behavior:**
1. Go to Dashboard
2. Scroll to **"Appointments"** section
3. See your booked session

**What to Test:**
- [ ] Appointment card shows:
  - Counsellor name
  - Date & time you booked
  - Message you entered
  - Status badge (should be "pending")

---

## If Something Doesn't Work

### Issue: Progress still shows 0/8
**Debug Steps:**
1. Check console for any red error messages
2. Verify log messages appear:
   - "Progress page: Initializing for user..." → Firebase is connecting
   - "watchDailyActivities emitting: {completedCount: X...}" → Data loaded
3. If no logs appear → auth isn't initializing
   - Try refreshing the page
   - Check you're logged in (check user dropdown)

### Issue: Modal won't open or "Book Session" button disabled
**Debug Steps:**
1. Check console for errors
2. Verify counsellor is assigned (card should show name, not "No counsellor assigned")
3. Try logging out and back in

### Issue: Booking doesn't submit
**Debug Steps:**
1. Check browser console (F12) for red errors
2. Verify all fields are filled (date, time required)
3. Try different date/time
4. Check Firebase connection (should see other log messages)

---

## Expected Console Logs (Full Sequence)

When you load the app and navigate to Progress page:

```
Progress page: Initializing for user abc123def456
Progress page: Sync complete {completedCount: 3, totalCount: 8, progressPercent: 37.5, ...}
watchDailyActivities emitting: {completedCount: 3, totalCount: 8, progressPercent: 37.5, items: {...}}
Progress page: Real-time update {completedCount: 3, totalCount: 8, progressPercent: 37.5, ...}
```

When you toggle an activity:
```
Progress page: Real-time update {completedCount: 4, totalCount: 8, progressPercent: 50, items: {...}}
```

When you book a session:
```
Appointment created successfully
```

---

## Summary of Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Progress shows 0/8 | Auth not ready on first render | Wait for `onAuthStateChanged()` before setting up listeners |
| Activity toggle doesn't sync | Same auth timing | userId state tracks auth, listeners depend on it |
| Booking modal doesn't submit | Silent error in createAppointment | Better error logging & toast messages |
| Dashboard doesn't update | Real-time listener dies silently | Fixed listener initialization with proper auth state |

---

## Next Steps After Testing

- If all tests pass ✅: Your app is ready to deploy!
- If any test fails: Share the console error messages from this checklist, and I'll patch further.

