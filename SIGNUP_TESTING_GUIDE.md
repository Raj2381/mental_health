# Signup Testing Guide - Quick Reference

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Terminal 1: Start MongoDB
mongod --dbpath /path/to/db

# Terminal 2: Start Backend
cd backend
npm start
# Should show: "🚀 Server running on http://localhost:3001"

# Terminal 3: Start Frontend
npm run dev
# Should show: "Local: http://localhost:5174"
```

---

## 📝 Test Cases

### Test Case 1: Valid Registration
```
Navigate to: http://localhost:5174/signup

Step 1: Fill form with valid data
├─ Name: "John Doe"
├─ Email: "john@example.com"
├─ Password: "password123"
├─ Confirm Password: "password123"
└─ Role: "student"

Step 2: Observe button
└─ Button should be enabled (100% opacity)

Step 3: Click "Create account"
└─ Button shows spinner: "⟳ Creating account..."

Step 4: Wait for success
└─ Auto-redirects to /dashboard/student

Expected Result: ✅ PASS
```

---

### Test Case 2: Invalid Email Format
```
Navigate to: http://localhost:5174/signup

Step 1: Fill form
├─ Name: "John Doe"
├─ Email: "not-an-email"
├─ Password: "password123"
├─ Confirm Password: "password123"
└─ Role: "student"

Step 2: Observe real-time feedback
├─ Email field shows: ❌ "Invalid email format"
└─ Submit button: DISABLED (60% opacity)

Step 3: Fix email
├─ Email: "john@example.com"
└─ Error clears immediately

Step 4: Button becomes enabled
└─ Now you can submit

Expected Result: ✅ PASS
```

---

### Test Case 3: Password Too Short
```
Navigate to: http://localhost:5174/signup

Step 1: Fill form with short password
├─ Name: "John Doe"
├─ Email: "john@example.com"
├─ Password: "pass"
├─ Confirm Password: "pass"
└─ Role: "student"

Step 2: Observe validation
├─ Password field error: "Password must be at least 6 characters"
└─ Submit button: DISABLED

Step 3: Increase password length
├─ Password: "password123"
└─ Confirm Password: "password123"

Step 4: Error clears
└─ Button enables

Expected Result: ✅ PASS
```

---

### Test Case 4: Password Mismatch
```
Navigate to: http://localhost:5174/signup

Step 1: Fill form with mismatched passwords
├─ Name: "John Doe"
├─ Email: "john@example.com"
├─ Password: "password123"
├─ Confirm Password: "password456"
└─ Role: "student"

Step 2: Observe error
├─ Confirm Password field: "Passwords do not match"
└─ Submit button: DISABLED

Step 3: Match passwords
├─ Confirm Password: "password123"
└─ Error clears

Expected Result: ✅ PASS
```

---

### Test Case 5: Missing Required Field
```
Navigate to: http://localhost:5174/signup

Step 1: Fill partially
├─ Name: "John Doe"
├─ Email: (empty)
├─ Password: "password123"
├─ Confirm Password: "password123"
└─ Role: "student"

Step 2: Observe button
└─ Submit button: DISABLED

Step 3: Attempt submit (if somehow possible)
└─ Backend response: 400 "Email is required"

Expected Result: ✅ PASS
```

---

### Test Case 6: Invalid Role (API Test)
```
Using curl or Postman:

POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "superuser"
}

Expected Response (400):
{
  "error": "Validation failed",
  "errors": {
    "role": "Invalid role selected"
  }
}

Expected Result: ✅ PASS
```

---

### Test Case 7: Duplicate Email
```
Navigate to: http://localhost:5174/signup

Step 1: Register first account
├─ Name: "John Doe"
├─ Email: "john@example.com"
├─ Password: "password123"
└─ Confirm Password: "password123"
├─ Click submit
└─ Wait for redirect

Step 2: Return to signup
└─ Open /signup again

Step 3: Try same email
├─ Name: "Jane Doe"
├─ Email: "john@example.com" (same as before)
├─ Password: "password123"
├─ Confirm Password: "password123"
└─ Click submit

Step 4: Observe error
├─ Server error appears: "Email already registered"
├─ Suggestion: "This email is already in use. Please login or try another email."
└─ Error auto-clears in 5 seconds

Expected Result: ✅ PASS
```

---

### Test Case 8: Error Auto-Clear
```
Navigate to: http://localhost:5174/signup

Step 1: Submit invalid data
├─ Email: "invalid-email"
└─ Click submit

Step 2: Error appears
└─ Shows: "Invalid email format"

Step 3: Wait 5 seconds
└─ Error disappears automatically

Step 4: No manual dismissal needed
└─ User experience is seamless

Expected Result: ✅ PASS
```

---

### Test Case 9: Submit Button States
```
Navigate to: http://localhost:5174/signup

Test Invalid State:
├─ Leave Name empty
├─ Observe button
│  ├─ Opacity: 60%
│  ├─ Cursor: not-allowed
│  └─ Cannot be clicked
└─ Status: DISABLED

Test Valid State:
├─ Fill all fields correctly
├─ Observe button
│  ├─ Opacity: 100%
│  ├─ Cursor: pointer
│  └─ Can be clicked
└─ Status: ENABLED

Test Loading State:
├─ Submit valid form
├─ Observe button
│  ├─ Shows spinner: ⟳
│  ├─ Text: "Creating account..."
│  ├─ Opacity: Reduced
│  └─ Cannot be clicked
└─ Status: LOADING

Expected Result: ✅ PASS (all states work)
```

---

### Test Case 10: Password Toggle (Show/Hide)
```
Navigate to: http://localhost:5174/signup

Step 1: Type password
├─ Password: "password123"
└─ Initially shows as: ••••••••••

Step 2: Click eye icon next to password
├─ Password reveals: "password123"
└─ Icon changes to: closed eye

Step 3: Click eye icon again
├─ Password hides: ••••••••••
└─ Icon changes to: open eye

Step 4: Test confirm password toggle
├─ Same behavior
└─ Independent of password field

Step 5: Test during loading
├─ Submit form
├─ Click eye icon
└─ Should be disabled (cursor: not-allowed)

Expected Result: ✅ PASS
```

---

### Test Case 11: Counsellor Registration
```
Navigate to: http://localhost:5174/signup

Step 1: Select "counsellor" role
├─ Form expands to show professional details section
└─ New fields appear:
   ├─ Specialization (required)
   ├─ License number (required)
   ├─ Years of experience (required)
   ├─ Certifications (required)
   └─ License document upload (required)

Step 2: Fill all fields
├─ Name: "Dr. Jane Smith"
├─ Email: "jane@example.com"
├─ Password: "password123"
├─ Specialization: "Clinical Psychology"
├─ License: "LIC2024/001"
├─ Years: "5"
├─ Certifications: "M.Sc Psychology"
└─ Upload document

Step 3: Submit
└─ Should create counsellor account

Expected Result: ✅ PASS
```

---

### Test Case 12: Role Change UI
```
Navigate to: http://localhost:5174/signup

Step 1: Default is "student"
├─ Professional details section: HIDDEN
└─ Basic fields only visible

Step 2: Change to "counsellor"
├─ Professional details section: APPEARS (animated)
├─ Additional fields visible
└─ Validation updates

Step 3: Change back to "student"
├─ Professional details section: DISAPPEARS (animated)
├─ Additional fields hidden
└─ Validation resets

Expected Result: ✅ PASS
```

---

## 🧪 API Testing with Curl

### Test 1: Invalid Email (Backend Validation)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"invalid","password":"password123","role":"student"}'

Expected Response:
{
  "error": "Validation failed",
  "errors": {
    "email": "Invalid email format"
  }
}
```

### Test 2: Short Password (Backend Validation)
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"pass","role":"student"}'

Expected Response:
{
  "error": "Validation failed",
  "errors": {
    "password": "Password must be at least 6 characters"
  }
}
```

### Test 3: Duplicate Email (Backend Validation)
```bash
# First registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"student"}'

# Second registration (same email)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"john@example.com","password":"password123","role":"student"}'

Expected Response (409):
{
  "error": "Email already registered",
  "errors": {
    "email": "This email is already in use. Please login or try another email."
  }
}
```

### Test 4: Successful Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"student"}'

Expected Response (201):
{
  "message": "User registered successfully",
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "profileImage": ""
  }
}
```

---

## ✅ Test Checklist

- [ ] Valid registration creates account
- [ ] Invalid email shows specific error
- [ ] Short password shows specific error
- [ ] Missing fields prevented by button
- [ ] Duplicate email shows helpful message
- [ ] Errors auto-clear after 5 seconds
- [ ] Submit button disabled when invalid
- [ ] Submit button enabled when valid
- [ ] Loading state shows spinner
- [ ] Success redirects to dashboard
- [ ] Password toggle works
- [ ] Counsellor fields appear/disappear
- [ ] Field-level errors map correctly
- [ ] Password hashing works (check DB)
- [ ] JWT token generated and stored

---

## 🔍 Browser DevTools Checks

### Check 1: Local Storage
```javascript
// In browser console
localStorage.getItem('auth_token')
// Should return JWT token after successful signup

localStorage.getItem('user')
// Should return user object as JSON
```

### Check 2: Network Tab
```
POST /api/auth/register
Status: 400 (error) or 201 (success)
Response shows proper JSON with errors or success
```

### Check 3: Console Errors
```
No console errors should appear
Only informational logs from app
```

### Check 4: Password in Database
```bash
# Connect to MongoDB
mongosh

# Check user collection
use wellness_hub
db.users.find({email: "john@example.com"})

# Password should be HASHED, not plain text
# Example: "$2a$10$..."
```

---

## 📊 Test Results Template

| Test Case | Status | Notes |
|-----------|--------|-------|
| Valid registration | ✅ PASS | User created, redirected |
| Invalid email | ✅ PASS | Error shown, button disabled |
| Short password | ✅ PASS | Error shown immediately |
| Password mismatch | ✅ PASS | Error cleared when fixed |
| Missing fields | ✅ PASS | Button stays disabled |
| Duplicate email | ✅ PASS | 409 error with suggestion |
| Error auto-clear | ✅ PASS | Clears in 5 seconds |
| Button states | ✅ PASS | All states working |
| Password toggle | ✅ PASS | Show/hide working |
| Counsellor fields | ✅ PASS | Conditional display works |
| API validation | ✅ PASS | Backend catches errors |

---

## 🎯 Expected Outcomes

✅ All form validations working
✅ Error messages displaying correctly
✅ Auto-clear functionality active
✅ Button states responsive
✅ Backend validation comprehensive
✅ Frontend and backend validation aligned
✅ User experience seamless
✅ No UI changes from original design
✅ Production-ready system

---

## 🆘 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution**: Start MongoDB with `mongod` or use MongoDB Atlas

### Issue: "CORS Error"
**Solution**: Check backend CORS settings or restart backend

### Issue: "Token not saving"
**Solution**: Check localStorage in DevTools, ensure JavaScript enabled

### Issue: "Button always disabled"
**Solution**: Check browser console for errors, verify form data

### Issue: "Error not auto-clearing"
**Solution**: Check browser DevTools for JavaScript errors

