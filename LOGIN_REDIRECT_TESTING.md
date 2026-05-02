# 🧪 LOGIN REDIRECT - TESTING GUIDE

## Test 1: Check localStorage After Login ✅

### Before Login
```javascript
// Console input (Ctrl + Shift + J)
console.log("Before login:");
console.log("auth_token:", localStorage.getItem("auth_token"));
console.log("user:", localStorage.getItem("user"));

// Expected:
// auth_token: null
// user: null
```

### After Login (with test@example.com)
```javascript
console.log("After login:");
console.log("auth_token:", localStorage.getItem("auth_token"));
console.log("user:", localStorage.getItem("user"));

// Expected:
// auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ..."
// user: "{"_id":"...","email":"test@example.com","role":"student","name":"Test User"}"
```

---

## Test 2: Watch Console Logs During Login

### Expected Console Output (In Order)

**Step 1: Click Login Button**
```
🔐 Attempting login with email: test@example.com
```

**Step 2: API Call to Backend**
```
🔐 [AUTH SERVICE] Posting login request...
```

**Step 3: Backend Response**
```
✅ [AUTH SERVICE] Login response { success: true, token: "...", user: {...} }
```

**Step 4: Show User**
```
✅ Login successful. User: { _id: '507f1f77bcf86cd799439011', email: 'test@example.com', role: 'student' }
✅ Token stored: ✓
✅ User stored: ✓
```

**Step 5: Determine Route**
```
📋 User role: student
→ About to navigate...
Redirecting now...
```

**Step 6: RoleRoute Checks Auth**
```
🔐 [RoleRoute] Checking auth: token= true user= true
✅ [RoleRoute] User authenticated. Role: student
```

**Step 7: Dashboard Loads**
```
✅ Dashboard fully loaded
// (or any dashboard-specific logs)
```

---

## Test 3: Verify Navigation Happens

### Method 1: Check URL
1. **Before:** `http://localhost:5173/login`
2. **During:** Page transitions
3. **After:** `http://localhost:5173/dashboard/student`

### Method 2: Check Page Content
- **Before:** Login form visible
- **After:** Dashboard with user greeting "Hello, Test User" or similar

### Method 3: Check History
```javascript
// Console input
window.history.length // Should increase after login
```

---

## Test 4: Check for NO Errors

### Open DevTools (F12) → Console

❌ You should **NOT** see:
```
❌ Login failed
❌ [RoleRoute] No auth token or user found
❌ [RoleRoute] User not authenticated
❌ Uncaught ReferenceError
❌ Cannot read property 'role' of undefined
❌ undefined is not an object
```

---

## Test 5: Verify localStorage Structure

```javascript
// Copy and paste in console after login
const user = JSON.parse(localStorage.getItem("user"));
console.log({
  has_token: !!localStorage.getItem("auth_token"),
  has_user: !!localStorage.getItem("user"),
  user_id: user?._id,
  user_email: user?.email,
  user_role: user?.role,
  token_prefix: localStorage.getItem("auth_token")?.substring(0, 20) + "..."
});

// Expected output:
// {
//   has_token: true,
//   has_user: true,
//   user_id: "507f1f77bcf86cd799439011",
//   user_email: "test@example.com",
//   user_role: "student",
//   token_prefix: "eyJhbGciOiJIUzI1NiIs..."
// }
```

---

## Test 6: Test Each User Role

### Student Role
**Credentials:** test@example.com / Test@123

**Expected:**
- ✅ Redirects to `/dashboard/student`
- ✅ role in localStorage: "student"
- ✅ Dashboard shows student UI

### Counsellor Role (if available)
**Expected Redirect:** `/dashboard/counsellor`

### Admin Role (if available)
**Expected Redirect:** `/dashboard/admin`

---

## Test 7: Test Without Clearing localStorage

### Step 1: Login successfully
- ✅ Redirects to dashboard
- ✅ localStorage populated

### Step 2: Refresh page (F5 or Ctrl+R)
- ✅ RoleRoute checks localStorage
- ✅ User still authenticated
- ✅ Dashboard loads without re-login

### Step 3: Expected Console Logs on Refresh
```
🔐 [RoleRoute] Checking auth: token= true user= true
✅ [RoleRoute] User authenticated. Role: student
```

---

## Test 8: Test After Logout (if available)

### Step 1: Click Logout
- ✅ localStorage cleared
- ✅ localStorage.getItem("auth_token") → null
- ✅ localStorage.getItem("user") → null

### Step 2: Try to access /dashboard/student directly
- ✅ RoleRoute checks auth
- ✅ No token found
- ✅ Redirects to /login

### Step 3: Expected Console Logs
```
🔐 [RoleRoute] Checking auth: token= false user= false
❌ [RoleRoute] No auth token or user found - redirecting to login
🔐 [RoleRoute] User not authenticated, redirecting to /login from /dashboard/student
```

---

## Test 9: Manual Authentication Check

```javascript
// Copy into console
function checkAuth() {
  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("user");
  
  console.log("═══════════════════════════════════════");
  console.log("🔐 AUTHENTICATION STATUS");
  console.log("═══════════════════════════════════════");
  console.log("Token present:", !!token);
  console.log("User present:", !!userStr);
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log("✅ User authenticated!");
      console.log("  - ID:", user._id);
      console.log("  - Email:", user.email);
      console.log("  - Role:", user.role);
      console.log("  - Token length:", token.length);
    } catch (e) {
      console.error("❌ Error parsing user:", e);
    }
  } else {
    console.log("❌ Not authenticated");
  }
  console.log("═══════════════════════════════════════");
}

// Run it
checkAuth();
```

---

## Test 10: Simulate RoleRoute Check

```javascript
// Copy into console to simulate what RoleRoute does
function simulateRoleRoute() {
  console.log("\n🧪 SIMULATING RoleRoute CHECK\n");
  
  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("user");
  
  console.log("1. Check token:", token ? "✅ Found" : "❌ Missing");
  console.log("2. Check user:", userStr ? "✅ Found" : "❌ Missing");
  
  if (!token || !userStr) {
    console.log("❌ RESULT: Would redirect to /login");
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    const role = String(user?.role || "student").toLowerCase();
    const allowed = ["student"];
    
    console.log("3. User role:", role);
    console.log("4. Allowed roles:", allowed);
    console.log("5. Role match:", allowed.includes(role) ? "✅ YES" : "❌ NO");
    
    if (allowed.includes(role)) {
      console.log("✅ RESULT: Would render Dashboard component");
    } else {
      console.log("❌ RESULT: Would redirect to role dashboard");
    }
  } catch (e) {
    console.error("❌ RESULT: Parse error, would redirect to /login", e);
  }
}

// Run it
simulateRoleRoute();
```

---

## Quick Reference: Console Outputs

### ✅ SUCCESS - After Login
```
🔐 Attempting login with email: test@example.com
✅ Login successful. User: { _id: '...', email: 'test@example.com', role: 'student' }
✅ Token stored: ✓
✅ User stored: ✓
Redirecting now...
🔐 [RoleRoute] Checking auth: token= true user= true
✅ [RoleRoute] User authenticated. Role: student
```

### ⚠️ WARNING - Token Not Stored
```
✅ Login successful. User: { _id: '...', email: 'test@example.com', role: 'student' }
✅ Token stored: ✗  ← PROBLEM!
✅ User stored: ✗  ← PROBLEM!
```

### ❌ ERROR - No localStorage
```
🔐 [RoleRoute] Checking auth: token= false user= false
❌ [RoleRoute] No auth token or user found - redirecting to login
```

### ❌ ERROR - Role Mismatch
```
⚠️ [RoleRoute] Role not allowed. User role: student Allowed: ["counsellor"]
```

---

## Troubleshooting

### Issue: Still on login page after clicking "Sign In"
**Check:**
1. Open DevTools Console (F12)
2. Look for: "🔐 Attempting login with email"
3. If not there → Click button didn't work
4. If there but no "✅ Login successful" → Backend not responding

### Issue: "Redirecting now..." appears but no navigation
**Check:**
1. Is URL still `/login`? → navigate() didn't work
2. Check browser tab title for changes
3. Open Network tab (F12) → check for 200 response

### Issue: localStorage shows token but still redirected to login
**Check:**
1. Run `simulateRoleRoute()` helper from Test 10
2. Check user.role value
3. Verify role is in allowed list for route

---

## Success Criteria

✅ All tests should pass:

- [x] localStorage populated after login
- [x] Console shows all expected logs in order
- [x] URL changes from /login to /dashboard/student
- [x] No console errors
- [x] Dashboard loads with user data
- [x] Refresh page keeps user authenticated
- [x] Each role redirects to correct dashboard
- [x] Logout clears localStorage properly

---

## Testing Checklist

```
[ ] Test 1: localStorage populated
[ ] Test 2: Console logs in correct order
[ ] Test 3: Navigation happens
[ ] Test 4: No errors in console
[ ] Test 5: localStorage structure correct
[ ] Test 6: Verify all user roles work
[ ] Test 7: Refresh maintains auth
[ ] Test 8: Logout and redirect to login
[ ] Test 9: Manual auth check script works
[ ] Test 10: RoleRoute simulation accurate

OVERALL: [ ] ✅ All tests pass - Ready for production
```

---

**Run through all tests in order. Each test verifies a different part of the login redirect flow.**

**If all pass:** ✅ Login redirect is fully fixed

**If any fail:** Check the troubleshooting section
