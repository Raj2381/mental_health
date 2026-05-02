# Firebase Migration - Quick Test Guide

## ✅ COMPLETED MIGRATIONS

### 1. Dashboard.jsx - StudentDetailsCard
**Issue:** Was using Firebase `updateDoc(doc(db, "student_data", userId), {})`
**Fix:** Now uses REST API `PUT /api/user/:userId`
**Status:** ✅ FIXED

### 2. Profile.jsx - 5 Firebase Removals
**Issues Removed:**
- Firebase `onSnapshot` listener for student_data
- Firebase `updatePassword()` for password change
- Firebase `saveUserProfile()` function
- Firebase `auth.currentUser.uid` references
- Firebase `auth.currentUser.displayName` reference

**Fixes Applied:**
- Single API fetch: `GET /api/user/:userId`
- Password change: `PUT /api/auth/change-password`
- Profile update: `PUT /api/user/:userId`
- Uses `getCurrentUser()._id` instead
- Uses `profile.name` instead

**Status:** ✅ FIXED

---

## 🧪 TESTING REQUIRED

### Step 1: Verify Backend API Endpoints Exist

Run these curl commands to verify endpoints work:

```bash
# Get a valid token first
TOKEN="your_auth_token_here"

# Test 1: GET user profile
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/user/YOUR_USER_ID

# Test 2: PUT user profile update
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}' \
  http://localhost:3001/api/user/YOUR_USER_ID

# Test 3: PUT change password
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"newpass123"}' \
  http://localhost:3001/api/auth/change-password
```

**Expected Results:**
- ✅ Test 1: Returns user object with _id, name, email, role, etc.
- ✅ Test 2: Returns updated user object
- ✅ Test 3: Returns success message

---

### Step 2: Test Dashboard Component

**Action:** Log in as a student, go to Dashboard

**Test Cases:**

1. **View StudentDetailsCard**
   - [ ] Card appears on page
   - [ ] Form fields are populated (rollNumber, department, semester)
   - [ ] No console errors

2. **Edit StudentDetailsCard**
   - [ ] Change rollNumber
   - [ ] Change department
   - [ ] Change semester
   - [ ] Click "Save details"
   - [ ] Verify "Academic details saved successfully" message appears
   - [ ] Refresh page
   - [ ] Verify changes persisted

**Expected:** 
- ✅ Form saves without errors
- ✅ Data visible after page refresh
- ✅ No Firebase errors in console

---

### Step 3: Test Profile Component

**Action:** Navigate to Profile page

**Test Cases:**

1. **Profile loads**
   - [ ] Page loads without errors
   - [ ] User data displayed (name, email, phone, etc.)
   - [ ] No console errors about Firebase
   - [ ] No "Loading..." spinner stuck

2. **Edit profile (Student)**
   - [ ] Change name
   - [ ] Change email
   - [ ] Change phone
   - [ ] Scroll to "Save profile" button
   - [ ] Click "Save profile"
   - [ ] Verify "Profile updated" toast message
   - [ ] Refresh page
   - [ ] Verify changes persisted

3. **Edit profile (Counsellor)**
   - [ ] Change specialization
   - [ ] Change experience
   - [ ] Change bio
   - [ ] Click "Save profile"
   - [ ] Verify changes persisted

**Expected:**
- ✅ Profile saves without errors
- ✅ Data visible after page refresh
- ✅ Success toast appears
- ✅ No Firebase errors in console

---

### Step 4: Test Password Change

**Action:** In Profile page, scroll to "Security" section

**Test Cases:**

1. **Password change validation**
   - [ ] Leave password field empty, click "Update password"
   - [ ] Verify error: "Password must be at least 6 characters"
   
2. **Mismatched passwords**
   - [ ] Enter "password123" in "New password"
   - [ ] Enter "password456" in "Confirm password"
   - [ ] Click "Update password"
   - [ ] Verify error: "Passwords do not match"

3. **Successful password change**
   - [ ] Enter "newpass123" in "New password"
   - [ ] Enter "newpass123" in "Confirm password"
   - [ ] Click "Update password"
   - [ ] Verify "Password updated" toast message
   - [ ] Try logging out and logging back in with new password
   - [ ] Verify new password works

**Expected:**
- ✅ All validations work
- ✅ Password changes successfully
- ✅ Can log in with new password
- ✅ No Firebase errors in console

---

### Step 5: Verify No Firebase References

**In Browser Console:**

```javascript
// Check for Firebase errors or references
// Should NOT see any of these patterns:
// - "firebase"
// - "updateDoc"
// - "auth.currentUser"
// - "Firestore"
// - "onSnapshot"

// Safe to see:
// - "GET /api/user/..."
// - "PUT /api/user/..."
// - Authorization headers
```

**On Terminal:**

```bash
# Verify Dashboard has no Firebase imports
grep -E "firebase|firestore|updateDoc|doc\(db" src/pages/Dashboard.jsx
# Expected: NO MATCHES

# Verify Profile has no Firebase imports
grep -E "firebase|firestore|updatePassword|auth\.currentUser" src/pages/Profile.jsx
# Expected: NO MATCHES
```

---

## 🔴 Common Issues & Fixes

### Issue 1: "401 Unauthorized" when saving

**Cause:** Token not in localStorage or expired
**Fix:** 
- Log out completely
- Log back in
- Try saving again

### Issue 2: "Cannot read property '_id' of null"

**Cause:** `getCurrentUser()` returning null
**Fix:**
- Ensure you're logged in
- Check `localStorage.getItem("auth_token")` exists
- Check browser console for auth errors

### Issue 3: Page shows "Loading..." indefinitely

**Cause:** API endpoint not responding
**Fix:**
- Check if backend is running: `ps aux | grep node`
- Start backend: `npm start` (in backend folder)
- Check backend logs for errors
- Verify CORS is enabled on backend

### Issue 4: "Failed to save. Please try again."

**Cause:** Backend endpoint not responding correctly
**Fix:**
- Check backend logs: `npm start`
- Verify endpoint exists: `curl http://localhost:3001/api/user/test`
- Check request body format matches backend expectations
- Check Content-Type header is "application/json"

### Issue 5: Form fields not populating initially

**Cause:** Initial fetch not completing before render
**Fix:** This is normal - fields populate after fetch completes
- Should see loading spinner
- Fields populate within 1-2 seconds
- If stuck > 5 seconds, check backend logs

---

## ✅ Final Checklist

- [ ] Dashboard StudentDetailsCard form works
- [ ] Profile page loads without errors
- [ ] Profile save works for all fields
- [ ] Password change works correctly
- [ ] All changes persist after refresh
- [ ] No Firebase imports in console
- [ ] No Firebase errors in console
- [ ] All toast messages display correctly
- [ ] Error messages show properly if API fails
- [ ] Can login/logout without issues

---

## 📝 Data You Need for Testing

You'll need these environment variables set (in `.env.local`):
- `VITE_API_URL=http://localhost:3001/api` ✅ Should be set

Backend must be running:
```bash
cd backend
npm start
# Should see: "Server running on port 3001"
```

Valid user account to log in with:
- Email: (use your test account)
- Password: (use your test account password)

---

## 📊 Migration Summary

| Component | Firebase Code | Backend API | Status |
|-----------|---------------|-------------|--------|
| Dashboard StudentDetailsCard | updateDoc() | PUT /api/user/:id | ✅ DONE |
| Profile load | onSnapshot() | GET /api/user/:id | ✅ DONE |
| Profile save | saveUserProfile() | PUT /api/user/:id | ✅ DONE |
| Password change | updatePassword() | PUT /api/auth/change-password | ✅ DONE |
| Auth reference | auth.currentUser | getCurrentUser() | ✅ DONE |

---

## 🎯 Next Steps After Testing

1. If all tests pass:
   - Deploy to production
   - Monitor for any errors
   - Remove Firebase from package.json if no longer needed

2. If tests fail:
   - Check backend endpoint responses
   - Check browser console for error details
   - Review error logs on backend
   - Ensure auth token is valid

---

Created: Migration Completion
Status: Ready for Testing ✅
