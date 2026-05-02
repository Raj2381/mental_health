# Firebase Schema & Security Rules Updates

## New Collection Structure

### Path: `users/{userId}/dailyPlans`

This is a new subcollection under each user containing daily task plans.

#### Document: `{YYYY-MM-DD}` (e.g., "2024-01-15")

```json
{
  "userId": "user_123",
  "date": "2024-01-15",
  "dateCreated": "2024-01-15T08:30:00Z",
  
  "tasks": [
    {
      "title": "Practice 5-minute deep breathing (4-7-8 technique)",
      "reason": "Panic attacks",
      "impact": "Calm nervous system",
      "completed": false,
      "completedAt": null
    },
    {
      "title": "Write down your worries, then release them",
      "reason": "Excessive worry",
      "impact": "Clear your mind",
      "completed": true,
      "completedAt": "2024-01-15T14:22:30Z"
    }
  ],
  
  "progress": {
    "completed": 1,
    "total": 7,
    "percentage": 14
  },
  
  "stats": {
    "originalRiskScore": 65,
    "currentRiskScore": 64.5,
    "potentialReduction": 3.5
  },
  
  "basedOn": {
    "totalScore": 65,
    "riskLevel": "Medium",
    "categories": {
      "anxiety": {
        "score": 75,
        "reasons": ["Panic attacks", "Excessive worry"]
      },
      "sleep": {
        "score": 45,
        "reasons": []
      },
      "academic": {
        "score": 55,
        "reasons": []
      },
      "social": {
        "score": 30,
        "reasons": []
      },
      "emotional": {
        "score": 35,
        "reasons": []
      }
    }
  },
  
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-01-15T14:22:30Z"
}
```

---

## Updated Collections

### `student_data` Collection Changes

When tasks are completed, the following fields are updated:

```json
{
  "uid": "user_123",
  
  // NEW FIELDS:
  "currentRiskScore": 64.5,
  "riskHistory": [
    {
      "score": 65,
      "timestamp": "2024-01-15T08:00:00Z",
      "source": "assessment"
    },
    {
      "score": 64.5,
      "timestamp": "2024-01-15T14:22:30Z",
      "source": "task_completion"
    }
  ],
  "lastRiskUpdate": "2024-01-15T14:22:30Z",
  
  // EXISTING FIELDS (unchanged):
  "currentRiskScore": 65,
  "streak": 5,
  "lastActiveDateKey": "2024-01-15",
  // ... other fields
}
```

---

## Firestore Security Rules

### Add to Your `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ── EXISTING RULES ──────────────────────────
    match /student_data/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      
      // ── NEW: Daily Plans Subcollection ──────────
      match /dailyPlans/{document=**} {
        allow read: if request.auth.uid == userId;
        
        // Allow creation/update of daily plans
        allow create: if request.auth.uid == userId 
          && request.resource.data.userId == userId
          && request.resource.data.date is string;
        
        // Allow updates to task completion status
        allow update: if request.auth.uid == userId
          && request.resource.data.userId == userId;
      }
    }
    
    // ... other rules
  }
}
```

---

## Composite Index Requirements

### Path: `users/{userId}/dailyPlans`

If you get "FAILED_PRECONDITION" errors, create this composite index:

```
Collection: users/{userId}/dailyPlans
Field 1: userId (Ascending)
Field 2: date (Descending)
```

**How to create in Firebase Console**:
1. Go to Firestore Database
2. Navigate to Indexes tab
3. Click "Create index"
4. Collection: `users/{userId}/dailyPlans`
5. Add fields: `userId` (Asc) and `date` (Desc)
6. Create index

**Alternative**: Use CLI
```bash
firebase deploy --only firestore:indexes
```

---

## Data Migration Guide

If you have existing users, no migration needed:
- New field: `riskHistory` is created on first task completion
- Existing fields remain unchanged
- Backward compatible

---

## Query Examples

### Get Today's Plan
```javascript
const today = new Date().toISOString().split("T")[0]; // "2024-01-15"
const planRef = doc(db, "users", userId, "dailyPlans", today);
const planSnap = await getDoc(planRef);
```

### Get Plans for Date Range
```javascript
const startDate = "2024-01-08";
const endDate = "2024-01-15";

const q = query(
  collection(db, "users", userId, "dailyPlans"),
  where("date", ">=", startDate),
  where("date", "<=", endDate)
);
const querySnap = await getDocs(q);
```

### Get Latest Risk Score
```javascript
const studentDataRef = doc(db, "student_data", userId);
const snap = await getDoc(studentDataRef);
const currentRiskScore = snap.data().currentRiskScore;
```

---

## Backup & Data Management

### Export Daily Plans
```bash
firebase firestore:export gs://your-bucket-name/backup
```

### Monitor Collection Growth
```
Firestore Console → Dashboard
- Track dailyPlans subcollection size
- Expected: ~1KB per day per user
- Storage growth: ~365KB per user per year
```

### Cleanup Old Plans (Optional)
For long-term performance, consider archiving plans older than 90 days:

```javascript
async function archiveOldPlans(userId, daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  const cutoffDateStr = cutoffDate.toISOString().split("T")[0];
  
  const q = query(
    collection(db, "users", userId, "dailyPlans"),
    where("date", "<", cutoffDateStr)
  );
  
  const querySnap = await getDocs(q);
  const batch = writeBatch(db);
  
  querySnap.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}
```

---

## Data Types & Constraints

```javascript
{
  // String: ISO date format (YYYY-MM-DD)
  date: string,
  
  // Array: Task objects
  tasks: Array<{
    title: string,           // Max 200 chars
    reason: string,          // Reason identifier
    impact: string,          // Impact description
    completed: boolean,      // Task status
    completedAt: string|null // ISO timestamp when completed
  }>,
  
  // Object: Numeric metrics
  stats: {
    originalRiskScore: number,     // 0-100
    currentRiskScore: number,      // 0-100
    potentialReduction: number     // Float
  },
  
  // Object: Progress tracking
  progress: {
    completed: number,  // 0-8 (completed task count)
    total: number,      // 5-8 (total task count)
    percentage: number  // 0-100 (completion %)
  }
}
```

---

## Error Handling

### Common Errors & Solutions

**Error**: `FAILED_PRECONDITION`
```
Solution: Create composite index (see above)
```

**Error**: `PERMISSION_DENIED`
```
Solution: Update Firestore rules to include dailyPlans
```

**Error**: `NOT_FOUND` (plan doesn't exist)
```
Solution: Check date format (must be YYYY-MM-DD)
         Check if getTodaysDailyPlan returns null
```

**Error**: `ALREADY_EXISTS`
```
Solution: Use merge: true in setDoc() to update
```

---

## Testing Queries

### Test in Firestore Console

**Get Daily Plan**:
```
Collections → users → {userId} → dailyPlans → {2024-01-15}
```

**Query by Date Range**:
```
Collection: users/{userId}/dailyPlans
Filter: date >= 2024-01-08
Filter: date <= 2024-01-15
```

---

## Performance Metrics

### Expected Document Size
- Average plan: 2-4 KB
- With 8 tasks: ~3 KB
- Risk history (30 days): +1-2 KB

### Expected Read/Write Costs
- Create plan: 1 write (dailyPlans) + 1 update (student_data) = 2 writes
- Complete task: 1 update (dailyPlans) + 1 update (student_data) = 2 writes
- Fetch plan: 1 read

---

## Integration with Existing Collections

### How it connects:

```
assessments (existing)
    ↓ latest assessment
    ↓ triggers task generation
    ↓
dailyPlans (NEW)
    ↓ task completion updates
    ↓
student_data (existing)
    ↓ currentRiskScore updated
    ↓ riskHistory appended
```

---

## Deployment Checklist

- [ ] Firestore rules updated with dailyPlans
- [ ] Create composite index (or auto-generated)
- [ ] Test getTodaysDailyPlan() query
- [ ] Test completeTask() updates
- [ ] Verify student_data fields updated
- [ ] Monitor Firestore quota usage
- [ ] Setup error monitoring
- [ ] Backup existing data

---

## Future Extensions

### Planned Fields (for future versions)
```javascript
{
  // For social features
  sharedWith: ["counsellor_id"],
  
  // For scheduling
  suggestedTimes: ["09:00", "14:00", "19:00"],
  
  // For analytics
  completionRate: 0.86,
  averageCompletionTime: 45, // minutes
  
  // For ML
  effectiveness: 0.92,
  taskDifficulty: "medium"
}
```

---

## Support

- Check Firebase console for quota warnings
- Monitor failed writes in error logs
- Test with development data first
- Use emulator for local testing

---

**Schema Version**: 1.0
**Last Updated**: Now
**Status**: Ready for Production
