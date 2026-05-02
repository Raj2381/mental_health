# 🎯 Dynamic Sub-Question Assessment System - Implementation Complete

## Overview
Successfully upgraded the Student Assessment system from a static 5-question-per-section format to a dynamic 25-question system with intelligent sub-questions (reason, duration, impact) for worst-answer detection.

---

## ✅ Completed Tasks

### 1. Assessment Config (`src/utils/assessmentConfig.js`)
- **ASSESSMENT_QUESTIONS**: Array of all 25 questions with:
  - Question ID (q1-q25)
  - Full question text
  - Answer options (5 options per question)
  - Worst answers (trigger sub-questions)
  - Category (academic, social, sleep, anxiety, emotional)
  - Section grouping
  - Critical flag for q24 (self-harm)

- **subQuestionTemplates**: Question-specific sub-questions:
  - **reason**: Why is this happening? (5-7 context-specific options)
  - **duration**: How long has this been happening? (5-6 timeline options)
  - **impact**: How much does this affect you? (severity scale)
  - Mapped per questionId for direct lookup

- **Helper Functions**:
  - `getQuestionById(id)`: Retrieve question by ID
  - `isWorstAnswer(questionId, answerText)`: Check if answer triggers sub-questions
  - `getSubQuestions(questionId)`: Retrieve sub-question template
  - `getQuestionMetadata(index)`: Get section info by question index

- **Risk Scoring**:
  - `impactScores`: Map severity to risk points
  - `durationScores`: Map duration to risk points
  - `categoryWeights`: Per-category risk multipliers
  - `riskLevels`: Low/Moderate/High/Critical bands

---

### 2. Assessment.jsx (`src/pages/Assessment.jsx`)
- **Rewritten from scratch** to use ASSESSMENT_QUESTIONS config

- **State Management**:
  - `currentQuestionIndex`: Track which of 25 questions shown
  - `answers`: Map `questionId -> selectedOptionText`
  - `subAnswers`: Map `questionId -> { reason, duration, impact }`

- **Dynamic Risk Calculation**:
  - Real-time score updates as answers change
  - Per-category breakdown (academic, social, sleep, anxiety, emotional)
  - Critical alert detection for self-harm (q24)
  - Risk level color coding (🟢🟡🟠🔴)

- **Sub-Question Logic**:
  - **Trigger**: Only shows when worst answer selected
  - **Collapse**: Auto-removes if answer changed to non-worst
  - **Storage**: Persisted in Firebase subAnswers field
  - **Validation**: Optional (doesn't block submission if worst answer selected)

- **UI Components**:
  - **Question Navigator**: 25-button grid for jumping to any question
  - **Sub-Question Section**: Animated container with header + 3 dropdowns
  - **Custom Select Field**: Interactive dropdowns with animations, checkmarks, visual feedback
  - **Critical Alert Modal**: Red banner for self-harm detection with action buttons

- **Navigation**:
  - Previous/Next buttons
  - Jump to any question via navigator
  - Auto-scroll to question
  - Progress bar (0-100%)
  - Completion counter

---

### 3. Firebase Integration (`src/services/firebase/assessments.js`)
- Already includes `subAnswers` field in schema:
  ```
  subAnswers: {
    q1: { reason: "...", duration: "...", impact: "..." },
    q5: { reason: "...", duration: "...", impact: "..." },
    ...
  }
  ```
- Stores alongside:
  - `answers`: Flattened array of 25 selections
  - `categoryScores`: Per-category risk breakdown
  - `totalRiskScore`: Overall risk (0-100)
  - `criticalAlert`: Self-harm detection flag

---

## 🔄 Data Flow

```
Question Selected
  ↓
isWorstAnswer() check
  ├─ YES → Show SubQuestionSection (reason/duration/impact)
  │          ↓
  │       User fills 3 dropdowns
  │          ↓
  │       subAnswers[questionId] = { reason, duration, impact }
  │          ↓
  │       Real-time risk recalculation
  │
  └─ NO → Remove subAnswers[questionId] if exists
           ↓
        Risk score updates
           ↓
        Category breakdown refreshes

Submit
  ↓
All 25 questions answered? ✓
  ↓
Create Assessment Record
  ├─ Store answers array
  ├─ Store subAnswers object
  ├─ Calculate final scores
  └─ Send notifications
```

---

## 📊 Question Breakdown (25 Total)

| Section | Questions | Category | Worst Triggers |
|---------|-----------|----------|-----------------|
| **Academic Stress** | q1-q5 | academicStress | "Often"/"Always" |
| **Social Connection** | q6-q10 | socialConnection | "Dissatisfied"/"Excluded"/"No one" |
| **Sleep Quality** | q11-q15 | sleepQuality | "Few hours"/"Every night"/"Never" |
| **Anxiety** | q16-q20 | anxietyStress | "Often"/"Always"/"Never" calmness |
| **Emotional** | q21-q25 | emotionalWellbeing | "Nearly daily"/"None"/"Hopeless" |

**Critical Question**: q24 (Self-harm ideation)
- Worst answers: "Sometimes", "Often", "I have a plan"
- Triggers red alert modal with crisis hotline + chat support

---

## 🎨 Sub-Question Templates

Each of 25 questions has 3 sub-questions:

### Academic Stress (q1-q5)
- **q1**: Reason → Why overwhelmed? + Duration + Impact severity
- **q2**: When symptoms occur? + How often? + Effect on life
- **q3**: Who's pressure source? + How long? + Stress level
- **q4**: What gets sacrificed? + How often happens? + Life impact
- **q5**: Why skip meals? + Frequency + Health impact

### Social Connection (q6-q10)
- **q6**: What's missing in friendships? + Duration + Hurt level
- **q7**: When feel lonely? + Frequency + Effect
- **q8**: Why no confidant? + How long? + Isolation level
- **q9**: What helps inclusion? + Duration excluded + Pain level
- **q10**: How affects you? + Duration + Severity

### Sleep Quality (q11-q15)
- **q11**: Why limited sleep? + How long? + Effect
- **q12**: What keeps awake? + Frequency + Impact
- **q13**: What improves sleep? + Unrested frequency + Effect
- **q14**: How fatigue affects you? + How often? + Life impact
- **q15**: Why use phone? + Frequency + Sleep impact

### Anxiety Stress (q16-q20)
- **q16**: Worry topics? + Frequency + Effect
- **q17**: When symptoms occur? + How often? + Impact
- **q18**: What avoided? + How often avoid? + Life limitation
- **q19**: What calms you? + Duration of anxiety + Life effect
- **q20**: Activities affected? + Constancy + Severity

### Emotional Wellbeing (q21-q25)
- **q21**: Triggers depression? + Frequency + Effect
- **q22**: How long lost interest? + Trend (improving/worsening) + Life impact
- **q23**: Coping barriers? + Duration hard? + Effect
- **q24**: When self-harm thoughts? + Frequency + Do you have plan? ⚠️ CRITICAL
- **q25**: Hopeful things? + Duration hopeless + Effect

---

## 💾 Firebase Schema

```javascript
assessmentResults/{docId}
{
  userId: "...",
  answers: ["Never", "Often", "Always", ...], // 25 items
  subAnswers: {
    q1: { reason: "Exam pressure", duration: "Few months", impact: "Significantly" },
    q5: { reason: "Caffeine dependency", duration: "Most nights", impact: "Severely" },
    q16: { reason: "Academic performance", duration: "Nearly daily", impact: "Severely" },
    q24: { reason: "Getting worse", duration: "Constantly", impact: "Yes, detailed" }, // CRITICAL
    ...
  },
  score: 68,
  totalRiskScore: 68,
  riskLevel: "High",
  categoryScores: {
    academicStress: 75,
    socialConnection: 45,
    sleepQuality: 62,
    anxietyStress: 85,
    emotionalWellbeing: 72
  },
  criticalAlert: {
    isCritical: true,
    severity: "high",
    message: "Self-harm ideation detected...",
    questionId: "q24"
  },
  stressBreakdown: {
    academic: 75,
    social: 45,
    emotional: 72,
    sleep: 62,
    anxiety: 85
  },
  createdAt: Timestamp
}
```

---

## 🚀 Key Features

### Dynamic Sub-Questions ✓
- Appear only for worst answers
- Collapse when answer changes
- Real-time storage to Firebase
- Category-specific options

### Intelligent Validation ✓
- Ensures all 25 questions answered before submit
- Sub-answers optional (doesn't block)
- Critical alert for self-harm detection
- Real-time risk score updates

### Premium UI/UX ✓
- 25-question grid navigator
- Smooth transitions & animations
- Glass-morphism design
- Color-coded risk levels
- Category breakdown charts
- Critical alert modal with action buttons

### Real-time Risk Scoring ✓
- Updates as answers change
- Per-category breakdown
- Critical alert detection
- Risk level color coding
- Progress tracking

---

## 🧪 Testing Checklist

- [x] No compilation errors (0 errors in Assessment.jsx + assessmentConfig.js)
- [x] All 25 questions render correctly
- [x] Sub-questions appear only for worst answers
- [x] Sub-questions collapse when answer changes
- [x] Navigation between all 25 questions works
- [x] Risk score updates in real-time
- [x] Critical alert shows for q24 worst answers
- [x] Firebase stores answers + subAnswers correctly
- [x] Submit button validates all questions answered
- [x] Notifications sent to counsellors on high risk

---

## 📝 Implementation Details

### Sub-Question Template Structure
```javascript
q1: {
  reason: { 
    label: "What is the main reason?", 
    options: ["Too many assignments", "Exam pressure", ...] 
  },
  duration: { 
    label: "How long have you felt this way?", 
    options: ["Few days", "Few weeks", ...] 
  },
  impact: { 
    label: "How severely does this affect you?", 
    options: ["Slightly", "Moderately", ...] 
  }
}
```

### Worst Answer Detection
```javascript
isWorstAnswer(questionId, answerText) {
  const question = getQuestionById(questionId);
  return question.worst.includes(answerText);
}
```

### Sub-Answer Storage
```javascript
// On dropdown select
handleSubAnswer(field, value) {
  setSubAnswers(prev => ({
    ...prev,
    [currentQuestion.id]: {
      ...prev[currentQuestion.id],
      [field]: value
    }
  }));
}

// Firebase persists as:
{
  q1: { reason: "...", duration: "...", impact: "..." }
}
```

---

## 🔧 File Changes Summary

| File | Changes |
|------|---------|
| `src/utils/assessmentConfig.js` | +450 lines: ASSESSMENT_QUESTIONS array, subQuestionTemplates for all 25 Qs, helper functions |
| `src/pages/Assessment.jsx` | Complete rewrite: 600 lines, 25-question navigation, sub-question logic, real-time risk calculation |
| `src/services/firebase/assessments.js` | No changes needed (schema already supports subAnswers) |

---

## ✨ Production Ready

- ✅ Zero compilation errors
- ✅ All 25 questions mapped with sub-questions
- ✅ Dynamic sub-question logic implemented
- ✅ Category-specific reason options
- ✅ Firebase integration complete
- ✅ Critical alert detection (q24)
- ✅ Real-time risk scoring
- ✅ Premium UI with animations
- ✅ Full state management
- ✅ Notification system integrated
