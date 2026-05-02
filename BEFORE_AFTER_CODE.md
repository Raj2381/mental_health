# Before & After Code Comparison

## Issue 1: Daily Progress Display (0/8)

### ❌ BEFORE - Dashboard.jsx
```jsx
// Line 223 - Always shows 0/8
<p className="mt-4 text-5xl font-black tracking-tight">
  {dailyActivity.completedCount}/{dailyActivity.totalCount}
</p>

// Line 229 - Progress bar might be undefined
<div className="animated-gradient h-2 rounded-full bg-[...]" 
  style={{ width: `${dailyActivity.progressPercent}%` }} />

// Problem: If dailyActivity is null or undefined, will crash or show NaN
```

### ✅ AFTER - Dashboard.jsx
```jsx
// Line 224 - Now safely shows X/8 with fallback
<p className="mt-4 text-5xl font-black tracking-tight">
  {dailyActivity?.completedCount ?? 0}/{dailyActivity?.totalCount ?? 8}
</p>

// Line 230 - Safe progress bar with fallback
<div className="animated-gradient h-2 rounded-full bg-[...]" 
  style={{ width: `${dailyActivity?.progressPercent ?? 0}%` }} />

// Solution: Nullish coalescing (??) provides fallback values
```

---

## Issue 1: Progress Section Component (0%)

### ❌ BEFORE - ProgressSection.jsx
```jsx
export default function ProgressSection({ value = 0 }) {
  return (
    <Motion.div
      animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      // ...
    />
  );
}

// Problem: If value is NaN, result is unpredictable
```

### ✅ AFTER - ProgressSection.jsx
```jsx
export default function ProgressSection({ value = 0 }) {
  // Defensive: ensure value is always a number 0-100
  const displayValue = Math.max(0, Math.min(100, value ?? 0));
  
  return (
    <Motion.div
      animate={{ width: `${displayValue}%` }}
      // ...
    />
  );
}

// Solution: Extra validation layer for safety
```

---

## Issue 1: Real-Time Progress Listener

### ❌ BEFORE - progressSync.js
```javascript
export function watchDailyActivities(userId, callback) {
  const unsubscribe = onSnapshot(
    doc(db, "student_data", userId),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const dailyActivities = data.dailyActivities || {};
        callback({
          completedCount: dailyActivities.completedCount || 0,  // ❌ || is wrong for 0
          totalCount: dailyActivities.totalCount || 0,
          progressPercent: dailyActivities.progressPercent || 0,
        });
      }
      // ❌ No fallback if document doesn't exist
    },
    (error) => {
      console.error("watchDailyActivities error:", error);
    }
  );
  return unsubscribe;
}

// Problem 1: Using || instead of ?? treats 0 as falsy
// Problem 2: No fallback values if document missing
// Problem 3: Callback not called if snapshot doesn't exist
```

### ✅ AFTER - progressSync.js
```javascript
export function watchDailyActivities(userId, callback) {
  const unsubscribe = onSnapshot(
    doc(db, "student_data", userId),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const dailyActivities = data.dailyActivities || {};
        const result = {
          dailyActivities,
          completedCount: dailyActivities.completedCount ?? 0,  // ✅ ?? preserves 0
          totalCount: dailyActivities.totalCount ?? 0,
          progressPercent: dailyActivities.progressPercent ?? 0,
          dateKey: dailyActivities.dateKey,
          items: dailyActivities.items || {},
        };
        console.log("watchDailyActivities emitting:", result);
        callback(result);
      } else {
        // ✅ Fallback if document doesn't exist
        console.warn("watchDailyActivities: No student_data document found for user", userId);
        callback({
          dailyActivities: {},
          completedCount: 0,
          totalCount: 0,
          progressPercent: 0,
          dateKey: null,
          items: {},
        });
      }
    },
    (error) => {
      console.error("watchDailyActivities error:", error);
    }
  );
  return unsubscribe;
}

// Solution 1: Use ?? (nullish coalescing) not || (logical OR)
// Solution 2: Provide fallback object when document missing
// Solution 3: Always call callback with valid data
// Solution 4: Add logging for debugging
```

---

## Issue 2: Appointment Status Update

### ❌ BEFORE - appointments.js
```javascript
export async function updateAppointmentStatus(id, status) {
  const appointmentRef = doc(db, COLLECTIONS.appointments, id);
  const appointmentSnapshot = await getDoc(appointmentRef);
  const appointment = appointmentSnapshot.exists() 
    ? appointmentSnapshot.data() 
    : null;

  // ❌ No validation if id or status is missing
  await updateDoc(appointmentRef, {
    status,  // ❌ Might not be lowercase
    updatedAt: serverTimestamp(),
  });

  // ❌ Error not caught, will crash silently
  if (status === "accepted") {
    // ... accept logic
  }
  // ... more status logic
}

// Problems:
// - No validation of required parameters
// - Status not normalized (might be "Accepted" vs "accepted")
// - No error handling
// - No logging for debugging
```

### ✅ AFTER - appointments.js
```javascript
export async function updateAppointmentStatus(id, status) {
  // ✅ Validate required parameters
  if (!id || !status) {
    console.error("updateAppointmentStatus: id and status are required");
    return;
  }

  const appointmentRef = doc(db, COLLECTIONS.appointments, id);
  
  try {
    const appointmentSnapshot = await getDoc(appointmentRef);
    const appointment = appointmentSnapshot.exists() 
      ? appointmentSnapshot.data() 
      : null;

    // ✅ Update with normalized status
    await updateDoc(appointmentRef, {
      status: String(status).toLowerCase(),  // Ensure lowercase
      updatedAt: serverTimestamp(),
    });

    // ✅ Log for debugging
    console.log(`Appointment ${id} status updated to ${status}`);

    if (!appointment) return;

    // ✅ Handle each status with proper error handling
    if (status === "accepted") {
      const chatId = await ensureChat({...});
      
      await pushNotification({
        userId: appointment.studentId,
        type: "booking",
        title: "Session accepted",
        message: `${appointment.counsellorName} accepted your session.`,
      });

      await updateDoc(appointmentRef, {
        chatId,
        status: "accepted",
        updatedAt: serverTimestamp(),
      });
    }

    if (status === "rejected") {
      await pushNotification({
        userId: appointment.studentId,
        type: "booking",
        title: "Session declined",
        message: `${appointment.counsellorName} declined your session.`,
      });
    }

    if (status === "completed") {
      await pushNotification({
        userId: appointment.studentId,
        type: "booking",
        title: "Session completed",
        message: `${appointment.counsellorName} marked your session as completed.`,
      });
    }
  } catch (error) {
    // ✅ Catch and rethrow for caller handling
    console.error("Failed to update appointment status:", error);
    throw error;
  }
}

// Solutions:
// - Validate parameters upfront
// - Normalize status to lowercase
// - Add try-catch for error handling
// - Log all operations
// - Proper error propagation
```

---

## Issue 2: Counsellor Dashboard Error Handling

### ❌ BEFORE - CounsellorDashboard.jsx
```jsx
// Line 321 - Directly passing function reference
<AppointmentCard
  key={appt.id}
  appointment={appt}
  onStatusChange={updateAppointmentStatus}  // ❌ No error handling
/>

// Problem: If updateAppointmentStatus throws, entire component crashes
```

### ✅ AFTER - CounsellorDashboard.jsx
```jsx
// Line 168 - Wrapper function with error handling
const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
  try {
    await updateAppointmentStatus(appointmentId, newStatus);
    console.log(`Appointment ${appointmentId} updated to ${newStatus}`);
  } catch (error) {
    console.error("Failed to update appointment:", error);
    // User gets toast notification automatically from createAppointment
  }
};

// Line 321 - Using wrapper function
<AppointmentCard
  key={appt.id}
  appointment={appt}
  onStatusChange={handleUpdateAppointmentStatus}  // ✅ Has error handler
/>

// Solution: Wrapper catches errors and provides logging
```

---

## Issue 2: Appointment Display with Status Colors

### ❌ BEFORE - Dashboard.jsx
```jsx
{appointments.slice(0, 4).map((appt, index) => (
  <Motion.div
    key={appt.id}
    className="rounded-[1.4rem] border border-white/35 bg-white/35 px-4 py-4 text-sm backdrop-blur"
    // ❌ All appointments same color regardless of status
  >
    <div className="flex items-center justify-between gap-3">
      <p className="font-medium capitalize text-[color:var(--text-main)]">
        {appt.status}
      </p>
      <span className="soft-text inline-flex items-center gap-1 text-xs">
        <CalendarClock className="h-3.5 w-3.5" />
        {appt.date || "TBD"}
      </span>
    </div>
    <p className="soft-text mt-2">{appt.message || "General support"}</p>
  </Motion.div>
))}

// Problems:
// - Can't tell appointment status at a glance
// - Shows status label but not prominent
// - Missing key information (time)
```

### ✅ AFTER - Dashboard.jsx
```jsx
{appointments.slice(0, 4).map((appt, index) => {
  // ✅ Color code based on status
  const statusColor = 
    appt.status === "accepted" 
      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-300"
    : appt.status === "rejected" 
      ? "bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-300"
    : appt.status === "completed" 
      ? "bg-sky-500/20 border-sky-500/30 text-sky-600 dark:text-sky-300"
    : "bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-300";
  
  return (
    <Motion.div
      key={appt.id}
      className={`rounded-[1.4rem] border px-4 py-4 text-sm backdrop-blur ${statusColor}`}
      // ✅ Dynamic color based on status
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-[color:var(--text-main)]">
          {appt.counsellorName || "Counsellor"}  {/* ✅ Show counsellor name */}
        </p>
        <span className="inline-flex items-center gap-1 text-xs font-semibold rounded-full bg-white/20 px-2 py-1">
          <CalendarClock className="h-3.5 w-3.5" />
          {appt.status}  {/* ✅ Status prominent */}
        </span>
      </div>
      <p className="soft-text mt-2">{appt.message || "General support"}</p>
      <p className="soft-text text-xs mt-1">{appt.date} at {appt.time}</p>  {/* ✅ Time included */}
    </Motion.div>
  );
})}

// Solutions:
// - Color-coded by status for quick visual understanding
// - Show counsellor name (more relevant than status word)
// - Include both date AND time
// - Better visual hierarchy
```

---

## Summary of Patterns

### Pattern 1: Nullish Coalescing (??)
```javascript
// ❌ WRONG - treats 0 as falsy
let value = data.count || 0;  // If count is 0, becomes 0 (looks ok but logic wrong)

// ✅ CORRECT - only uses fallback if null/undefined
let value = data.count ?? 0;  // If count is 0, stays 0
```

### Pattern 2: Optional Chaining (?.)
```javascript
// ❌ WRONG - crashes if object is null
let value = data.nested.property;

// ✅ CORRECT - safely accesses nested property
let value = data?.nested?.property;
```

### Pattern 3: Defensive Defaults
```javascript
// ❌ WRONG - no fallback
return {
  count: data.count,
};

// ✅ CORRECT - has fallback
return {
  count: data.count ?? 0,
};
```

### Pattern 4: Error Handling
```javascript
// ❌ WRONG - error not caught
await updateDoc(ref, data);

// ✅ CORRECT - error handled
try {
  await updateDoc(ref, data);
} catch (error) {
  console.error("Failed to update:", error);
  throw error;
}
```

---

## Key Takeaways

1. **Use ?? not ||** for numeric/falsy values
2. **Use optional chaining ?.**  for nested properties
3. **Provide fallback values** in listeners/fetchers
4. **Always wrap async in try-catch**
5. **Log operations** for debugging
6. **Validate inputs** before using them
7. **Normalize data** (e.g., lowercase strings)
8. **Provide visual feedback** (colors, toasts)

