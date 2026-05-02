# Signup System - Complete Test Commands

Copy and paste these commands to test the signup system. All tests should pass with the responses shown.

## ✅ Test 1: Successful Registration

```bash
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"test@example.com","password":"pass123","role":"student"}' | jq .
```

**Expected Output:**
```json
{
  "message": "User registered successfully",
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "randomid123",
    "id": "randomid123",
    "name": "John Doe",
    "email": "test@example.com",
    "role": "student",
    "profileImage": "",
    "assignedCounsellorId": null
  }
}
```

**Status Code:** 201 Created ✅

---

## ❌ Test 2: Duplicate Email

```bash
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"test@example.com","password":"pass123","role":"student"}' | jq .
```

**Expected Output:**
```json
{
  "error": "Email already registered",
  "errors": {
    "email": "This email is already in use. Please login or try another email."
  }
}
```

**Status Code:** 409 Conflict ✅

---

## ❌ Test 3: Invalid Email Format

```bash
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"notanemail","password":"pass123","role":"student"}' | jq .
```

**Expected Output:**
```json
{
  "error": "Validation failed",
  "errors": {
    "email": "Invalid email format"
  }
}
```

**Status Code:** 400 Bad Request ✅

---

## ❌ Test 4: Password Too Short

```bash
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"123","role":"student"}' | jq .
```

**Expected Output:**
```json
{
  "error": "Validation failed",
  "errors": {
    "password": "Password must be at least 6 characters"
  }
}
```

**Status Code:** 400 Bad Request ✅

---

## ❌ Test 5: Missing Name

```bash
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"test2@example.com","password":"pass123","role":"student"}' | jq .
```

**Expected Output:**
```json
{
  "error": "Validation failed",
  "errors": {
    "name": "Name is required"
  }
}
```

**Status Code:** 400 Bad Request ✅

---

## ❌ Test 6: Missing Role

```bash
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"test3@example.com","password":"pass123","role":""}' | jq .
```

**Expected Output:**
```json
{
  "error": "Validation failed",
  "errors": {
    "role": "Role is required"
  }
}
```

**Status Code:** 400 Bad Request ✅

---

## ❌ Test 7: Invalid Role

```bash
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"test4@example.com","password":"pass123","role":"teacher"}' | jq .
```

**Expected Output:**
```json
{
  "error": "Validation failed",
  "errors": {
    "role": "Invalid role selected"
  }
}
```

**Status Code:** 400 Bad Request ✅

---

## 🎯 Batch Test Script

Save this as `/tmp/test-signup.sh` and run it to test all scenarios at once:

```bash
#!/bin/bash

echo "🧪 Testing Signup API - All Scenarios"
echo ""

echo "Test 1: Successful Registration"
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"test@example.com","password":"pass123","role":"student"}' | jq .
echo ""

echo "Test 2: Duplicate Email"
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"test@example.com","password":"pass123","role":"student"}' | jq .
echo ""

echo "Test 3: Invalid Email Format"
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"notanemail","password":"pass123","role":"student"}' | jq .
echo ""

echo "Test 4: Password Too Short"
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","password":"123","role":"student"}' | jq .
echo ""

echo "Test 5: Missing Name"
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"test2@example.com","password":"pass123","role":"student"}' | jq .
echo ""

echo "Test 6: Missing Role"
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"test3@example.com","password":"pass123","role":""}' | jq .
echo ""

echo "Test 7: Invalid Role"
curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"test4@example.com","password":"pass123","role":"teacher"}' | jq .
echo ""

echo "✅ All tests completed!"
```

Run with:
```bash
chmod +x /tmp/test-signup.sh
/tmp/test-signup.sh
```

---

## 🔍 Backend Logs to Look For

When running tests, watch the backend terminal or logs for these patterns:

### Successful Registration
```
📥 [REGISTER] Request received:
   Name: John Doe
   Email: test@example.com
   Role: student
   Password length: 7
🔍 [REGISTER] Checking if email exists...
👤 [REGISTER] Creating new user...
💾 [REGISTER] Saving user to database...
✅ [REGISTER] User saved successfully! ID: randomid
🎓 [REGISTER] Auto-assigning counsellor for student...
🔐 [REGISTER] Generating JWT token...
✨ [REGISTER] SUCCESS! User: test@example.com Role: student
```

### Duplicate Email
```
📥 [REGISTER] Request received:
   Name: Jane Doe
   Email: test@example.com
   ...
🔍 [REGISTER] Checking if email exists...
⚠️  [REGISTER] Email already exists: test@example.com
```

### Validation Error
```
📥 [REGISTER] Request received:
   Name: (value)
   Email: (value)
   Role: (value)
   Password length: (value)
❌ [REGISTER] Validation failed: { field: 'error message' }
```

---

## 📋 Expected Results Summary

| Test # | Scenario | Expected Status | Field Error |
|--------|----------|-----------------|-------------|
| 1 | Valid signup | 201 ✅ | None |
| 2 | Duplicate email | 409 ✅ | email |
| 3 | Invalid email | 400 ✅ | email |
| 4 | Short password | 400 ✅ | password |
| 5 | Missing name | 400 ✅ | name |
| 6 | Missing role | 400 ✅ | role |
| 7 | Invalid role | 400 ✅ | role |

---

## 🖥️ Browser Testing

1. Open http://localhost:5174/signup
2. Try filling the form:
   - Valid inputs: Should show success
   - Invalid inputs: Should show red error messages
   - Duplicate email: Should show error
   - Short password: Should disable submit button

---

## 📊 Troubleshooting

### Backend not responding
```bash
# Check if backend is running
lsof -i :3001

# If not, start it
cd /Users/rajgupta/my-react-app/backend
node server.js
```

### Frontend not loading
```bash
# Check if frontend is running
lsof -i :5174

# If not, start it
cd /Users/rajgupta/my-react-app
npm run dev
```

### CORS errors
- Check `/backend/server.js` has CORS configured for your port
- Should include: localhost:5173, localhost:5174

### MongoDB errors (safe to ignore)
- System uses MockUser when MongoDB unavailable
- All tests work fine with MockUser

---

**All tests verified working ✅**
