# Quick Start Testing Guide

## 🚀 Start the App (Prerequisite)

```bash
# Terminal 1: Backend
cd backend
npm start
# Should see: Server running on port 3001 ✅

# Terminal 2: Frontend
npm run dev
# Should see: http://localhost:5173 or 5174 ✅
```

---

## 🧪 Test 1: Login (Most Critical)

### Steps:
1. Open http://localhost:5173 → Click "Sign in"
2. Open DevTools Console (F12)
3. Use test account:
   - Email: `test@example.com`
   - Password: `Test@123`

### Expected Console Logs:
```
🔐 Attempting login with email: test@example.com
🔐 [AUTH SERVICE] Posting to /auth/login
✅ [AUTH SERVICE] Login response: {token: "eyJ...", user: {_id: "...", name: "Test User", ...}}
💾 [AUTH SERVICE] Stored token and user
✅ Login successful. User: {_id: "...", name: "Test User", email: "test@example.com", role: "student"}
📋 User role: student
→ Redirecting to student dashboard
```

### Check localStorage:
```javascript
// In DevTools Console, type:
localStorage.getItem("auth_token")  // Should return JWT token
localStorage.getItem("user")         // Should return user JSON
```

### Expected Behavior:
- ✅ Logs show step-by-step flow
- ✅ Redirects to `/dashboard/student` after ~1 second
- ✅ localStorage contains both auth_token and user
- ✅ No errors in console

---

## 🧪 Test 2: Dashboard Load (Second Critical)

### Steps:
1. After logging in, you should be on Dashboard
2. Wait 2-3 seconds for data to load
3. Check console for profile load

### Expected Console Logs:
```
✅ Dashboard Profile Loaded: {_id: "...", name: "Test User", streak: 5, riskScore: 0, ...}
```

### Expected Behavior:
- ✅ Profile data displays (name, email, etc.)
- ✅ Streak card shows
- ✅ Risk score shows
- ✅ No "Loading your dashboard..." spinner after 3 seconds
- ✅ All cards render properly

### If Stuck on Loading:
1. Check backend is running on 3001
2. Check console for errors
3. Check Network tab for failed requests
4. Verify auth_token is in localStorage

---

## 🧪 Test 3: Assessment Submission

### Steps:
1. Click "Assessment" or navigate to `/assessment`
2. Answer all 25 questions
3. Click "Submit Assessment"
4. Check console

### Expected Console Logs:
```
❌ Error submitting assessment: [error details]
// Or on success:
✅ Assessment submitted successfully
```

### Expected Behavior:
- ✅ If all questions answered, shows confirmation
- ✅ If submit succeeds, redirects to dashboard
- ✅ If submit fails, shows error message on page
- ✅ If 500 error, console shows actual error from backend

---

## 🧪 Test 4: Profile Page

### Steps:
1. Click "Profile" or navigate to `/profile`
2. Wait for profile to load
3. Check Network tab

### Network Tab Check:
- ✅ Should see only 1 API call to `/user/current/profile`
- ✅ Request should have `Authorization: Bearer ${token}` header
- ✅ No duplicate requests

### Expected Behavior:
- ✅ Profile data loads within 1 second
- ✅ Can edit and save details
- ✅ Success message shows after save
- ✅ Data persists on page refresh

---

## ⚠️ Common Issues & Fixes

### Issue: "Please log in to access your dashboard"
**Cause:** userId not being retrieved  
**Fix:**
```javascript
// Check in console:
getCurrentUser()  // Should return user object, not null
localStorage.getItem("user")  // Should have value
```

### Issue: "Loading your dashboard..." won't stop spinning
**Cause:** Profile fetch failed or data state not set  
**Fix:**
1. Check Network tab → `/api/user/current/profile` status (should be 200)
2. Check console for errors
3. Verify auth_token exists
4. Restart and try again

### Issue: Assessment shows 500 error
**Cause:** Backend validation error or wrong payload  
**Fix:**
1. Check console for error details
2. Verify all 25 questions answered
3. Check backend logs
4. Check payload format matches schema

### Issue: Profile shows "Loading..." forever
**Cause:** API call failed  
**Fix:**
1. Check `/api/user/current/profile` request in Network tab
2. Verify auth_token is valid
3. Check backend for errors

### Issue: No console logs appearing
**Cause:** DevTools not open or console cleared  
**Fix:**
1. Press F12 to open DevTools
2. Click "Console" tab
3. Refresh page with Ctrl+R
4. Login again

---

## 📊 Success Indicators

All of these should be ✅ for production ready:

```
✅ Login succeeds with valid credentials
✅ Token stored in localStorage
✅ Dashboard loads within 3 seconds
✅ Profile data displays
✅ Assessment can be submitted
✅ No Firebase imports active
✅ No errors in console (except debug logs)
✅ Authorization headers present in requests
✅ Safe loading UI shown while waiting
✅ Error messages display on failures
```

---

## 🔍 Debug Commands

### Check Auth Status
```javascript
localStorage.getItem("auth_token")
localStorage.getItem("user")
JSON.parse(localStorage.getItem("user"))  // Pretty print user
```

### Check API Calls
```
// In Network tab:
// Look for these patterns:
// ✅ POST /auth/login (200) → returns token + user
// ✅ GET /user/current/profile (200) → returns profile
// ✅ POST /assessment (200) → returns assessment
```

### Check Headers
```
// In Network tab, click request → Headers tab:
// Authorization: Bearer eyJ... ✅
// Content-Type: application/json ✅
```

---

## 📞 Support

If issues persist:
1. Check backend logs: `npm start` output
2. Check frontend console: F12 → Console tab
3. Check Network tab: F12 → Network tab
4. Check browser DevTools → Application → localStorage
5. Verify backend on port 3001: `curl http://localhost:3001/api/health`

---

**Last Updated:** April 4, 2026  
**Status:** ✅ All systems ready  
**Deployment:** 🚀 Ready
