# Frontend-Backend Integration Guide

## ✅ What's Ready

Your MERN stack is now set up for frontend-backend communication! Here's what you have:

### 1. **Environment Configuration** ✓
- **File**: `.env.local`
- **Setting**: `VITE_API_URL=http://localhost:3001/api`
- This tells React where your backend API is located

### 2. **API Helper** ✓
- **File**: `src/services/api.js`
- **Features**:
  - Axios instance pre-configured with your backend URL
  - Auto-adds authentication token to requests
  - Auto-handles 401 errors (redirects to login)
  - Ready to use in any component

### 3. **Example Components** ✓

#### GET Request Example
- **File**: `src/components/examples/UserListExample.jsx`
- **Shows how to**:
  - Fetch data with `useEffect`
  - Handle loading state
  - Handle error state
  - Display JSON response

#### POST Request Example
- **File**: `src/components/examples/TestForm.jsx`
- **Shows how to**:
  - Handle form input
  - Send POST request
  - Handle success response
  - Handle error responses
  - Show user feedback

#### Demo Page
- **File**: `src/pages/examples/APIIntegrationDemo.jsx`
- **View**: http://localhost:5173/demo (after adding to routes)

---

## 🚀 Quick Start

### Step 1: Ensure Backend is Running
```bash
cd /Users/rajgupta/my-react-app/backend
node server.js
```
Should show: ✅ MongoDB connected

### Step 2: Start Frontend
```bash
cd /Users/rajgupta/my-react-app
npm run dev
```
Should show: http://localhost:5173

### Step 3: Test API Connection
Test directly in browser:
```
http://localhost:3001/api/user
```
Should return:
```json
{
  "message": "User route working",
  "availableEndpoints": [...]
}
```

---

## 📝 How to Use in Your Components

### Pattern 1: GET Request (Fetch Data)

```javascript
import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/user/123");
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <p>Data: {JSON.stringify(data)}</p>;
}
```

**Key Points:**
- Use `useEffect` with empty dependency array `[]` for one-time fetch
- Always have loading, error, and success states
- Wrap in try-catch
- Error handling is automatic (no need to check response status)

---

### Pattern 2: POST Request (Send Data)

```javascript
import { useState } from "react";
import api from "../services/api.js";

export default function MyForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post("/auth/register", {
        name: "John Doe",
        email: "john@example.com",
        password: "123456",
        role: "student"
      });
      
      setSuccess(true);
      console.log("Response:", response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" required />
      <input type="email" placeholder="Email" required />
      <input type="password" placeholder="Password" required />
      
      <button disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Success!</p>}
    </form>
  );
}
```

**Key Points:**
- Always `e.preventDefault()` on form submit
- Send data as second argument to `api.post()`
- Check `err.response?.data?.error` for backend error messages
- Show loading state during request
- Show success/error feedback

---

## 🔌 Available Endpoints

Your backend has these endpoints ready to use:

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### User
- `GET /user` - Get user info (returns API status)
- `GET /user/:id` - Get user by ID (requires auth)
- `GET /user/current/profile` - Get current user (requires auth)
- `PUT /user/update` - Update user profile (requires auth)
- `GET /user/role/:role` - Get users by role (requires auth)

### Assessment
- `GET /assessment/user/:userId/latest` - Get latest assessment
- `POST /assessment/submit` - Submit assessment

### Progress
- `GET /progress/:userId` - Get user progress
- `POST /progress` - Create progress record

### Appointment
- `GET /appointment` - Get appointments
- `POST /appointment/book` - Book appointment

---

## 🛡️ Error Handling

The API instance automatically handles errors. You can check specific error types:

```javascript
catch (err) {
  if (err.response?.status === 404) {
    // Not found
  } else if (err.response?.status === 401) {
    // Unauthorized (auto-redirects to login)
  } else if (err.request && !err.response) {
    // Network error (backend not running)
  } else {
    // Other error
  }
}
```

Common errors:
- **Network Error**: Backend not running at http://localhost:3001
- **401 Unauthorized**: Token expired or missing (auto-redirects)
- **404 Not Found**: Endpoint doesn't exist
- **500 Server Error**: Backend error

---

## 🔐 Authentication

Authentication is already set up! Here's how it works:

1. **After Login**: Token is stored in `localStorage`
2. **Auto-Added to Requests**: Every API call includes the token
3. **Invalid Token**: Automatically redirects to `/login`
4. **Logout**: Remove token from localStorage

```javascript
// Store token after login
localStorage.setItem("auth_token", token);

// Clear token on logout
localStorage.removeItem("auth_token");
```

---

## 📦 What NOT to Change

✅ Do NOT modify:
- Backend routes or logic
- Backend folder structure
- API endpoint definitions
- Authentication flow

✅ Do ONLY add:
- New React components
- New pages
- Service functions that use `api.js`
- Form logic

---

## 🧪 Testing the Integration

### Test 1: Backend is Running
```bash
curl http://localhost:3001/api/user
```
Should return JSON response ✓

### Test 2: Frontend Can Reach Backend
Visit demo page:
```
http://localhost:5173/demo
```
Should show "User route working" ✓

### Test 3: POST Request Works
Fill the form on demo page and submit
Should show success/error message ✓

---

## 📁 File Structure

```
src/
├── services/
│   ├── api.js                 ← Main axios instance (pre-configured)
│   ├── auth.js                ← Auth service functions
│   └── mongodb/              
│       ├── users.js           ← User API functions
│       └── assessments.js     ← Assessment API functions
├── components/
│   └── examples/
│       ├── UserListExample.jsx    ← GET request example
│       └── TestForm.jsx           ← POST request example
├── pages/
│   └── examples/
│       └── APIIntegrationDemo.jsx ← Demo page
└── .env.local                ← API configuration
```

---

## 💡 Pro Tips

1. **Always use `api` instance**, not `fetch` or raw axios
   - It has auto-auth and error handling built in

2. **Always handle errors in user-friendly way**
   - Don't show technical error codes
   - Show what user can do about it

3. **Always show loading state**
   - Users know something is happening
   - Prevents duplicate submissions

4. **Test in browser console**
   - `console.log(localStorage.getItem("auth_token"))` to check token
   - `curl http://localhost:3001/api/user` to test backend

5. **Keep backend running**
   - Frontend won't connect if backend is off
   - Check terminal for "MongoDB connected" message

---

## ❓ Troubleshooting

**Problem**: "Cannot connect to backend"
- **Solution**: Ensure `node server.js` is running in backend folder

**Problem**: "401 Unauthorized"
- **Solution**: Login first, token will be auto-added

**Problem**: "404 Not Found"
- **Solution**: Check endpoint URL is spelled correctly

**Problem**: "CORS error"
- **Solution**: Already configured! No action needed.

---

## 🎓 Next Steps

1. Review `UserListExample.jsx` for GET pattern
2. Review `TestForm.jsx` for POST pattern
3. Copy patterns to your own components
4. Test with real backend endpoints
5. Handle errors gracefully

**You're all set! Start building! 🚀**
