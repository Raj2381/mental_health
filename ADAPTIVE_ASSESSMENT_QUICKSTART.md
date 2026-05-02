# Adaptive Assessment Quick Start Guide

## 🚀 What's New

Your assessment system now includes intelligent follow-up questions, real-time risk scoring, and immediate self-harm detection.

## For Students

### Taking the Assessment

1. **Navigate to Assessment** → Click on Assessment page
2. **Answer Questions** → Select your honest response for each question
3. **See Sub-Questions** *(NEW)* 
   - If you select a more concerning answer, sub-questions appear automatically
   - Answer "Why?", "How long?", and "How is it affecting you?"
4. **Watch Your Risk** → Real-time risk score updates in the header (top right)
5. **Review Categories** → See your scores across 5 wellbeing categories
6. **Complete All Sections** → Move through all 5 sections
7. **Submit** → Get instant results with personalized insights

### If Self-Harm is Detected 🚨
- A red alert appears immediately
- Click "Contact Counsellor" to call
- Click "Chat Now" for real-time support
- **This is not emergency only** - you can use this anytime

## For Counsellors

### Reading Student Assessments

1. **Open Student Profile** → Navigate to their assessment history
2. **See New Data** *(NEW)*
   - **Total Risk Score** (0-100 scale)
   - **Category Breakdown** → Academic, Social, Sleep, Anxiety, Emotional scores
   - **Sub-Answers** → Reasons they selected concerning answers
3. **Use Sub-Answers for Insights**
   - Why did they select concerning answers?
   - How long has it been happening?
   - How severely is it affecting them?
4. **Critical Alerts** *(NEW)*
   - Red flag if self-harm detected
   - Severity level (warning vs immediate)
   - Suggested action provided

### Sample Assessment Record
```
Student: John Doe
Total Risk Score: 67 (🟠 High)

Category Breakdown:
- Academic: 45 (moderate)
- Social: 38 (moderate)
- Sleep: 72 (high)
- Anxiety: 58 (high)
- Emotional: 71 (high)

Notable Sub-Answers:
- Sleep Q3: "Haven't slept well in 3 months, affecting school"
- Anxiety Q4: "Can't manage without worrying constantly"
- Emotional Q5: "Feeling hopeless for a few weeks"
```

## For Admins

### Monitoring System

1. **Access Admin Dashboard** → Assessment Analytics
2. **View New Metrics** *(NEW)*
   - Distribution of total risk scores
   - Average scores per category
   - Critical alerts triggered (self-harm detections)
3. **Generate Reports** → Include sub-answers in student reports
4. **Set Alerts** → Configure notifications for high-risk categories
5. **Track Trends** → Monitor risk scores over time per student

## System Features Explained

### 🔄 Smart Sub-Questions
**What?** When you answer concerning options, follow-up questions appear.  
**Why?** To understand the "why" behind your concerns.  
**Where?** Red-outlined box appears below your answer.  

**Questions Asked:**
- Reason: "What's causing this?"
- Duration: "How long has this been happening?"
- Impact: "How much is it affecting you?"

### 📊 Risk Score (0-100)
**What?** A number showing your current wellbeing.  
**Range:**
- 🟢 0-30: Low risk (you're doing well)
- 🟡 31-55: Moderate (keep an eye on this)
- 🟠 56-75: High (talk to a counsellor)
- 🔴 76-100: Critical (immediate support)

**How it's Calculated:**
1. Each answer gets a score (1-5, where 5 is most concerning)
2. Category weights applied (emotional concerns matter more)
3. Bonuses added for severity and duration
4. Final score: 0-100

### 📈 5-Category Breakdown
**What?** Your scores in different wellbeing areas.  
**Categories:**
- 📚 Academic: Workload, pressure, balance
- 👥 Social: Friends, belonging, connection
- 🌙 Sleep: Hours, quality, energy
- 😰 Anxiety: Worry, stress, panic
- 💭 Emotional: Mood, coping, self-harm

**How to Use:**
- See which areas need most attention
- Discuss high scores with counsellor
- Track changes over multiple assessments

### 🚨 Self-Harm Detection
**What?** Immediate alert if self-harm is mentioned.  
**Trigger:** Question 24 (thinking about self-harm)  
**Response Levels:**
- Sometimes/Often → Warning alert (yellow)
- Have a plan → Immediate alert (red)

**What Happens:**
1. Red alert box appears with empathetic message
2. Contact Counsellor button highlighted
3. Counsellor gets immediate notification
4. Risk score forced to 95+ for escalation

**Important:** This is always available - you can always reach out.

## Data Storage

### What Gets Saved
✅ Your answers to all 25 questions  
✅ Your sub-answers (reasons, duration, impact)  
✅ Your risk scores (overall and per category)  
✅ Timestamp of assessment  
✅ Any critical alerts triggered  

### Who Can See It
- ✅ You (always)
- ✅ Your assigned counsellor
- ✅ Admins/Principals (with oversight access)
- ❌ Other students (private)

### How It's Secure
- Encrypted in transit (HTTPS)
- Encrypted at rest (Firebase)
- Access controlled by role
- Audit logged

## Frequently Asked Questions

**Q: Why are sub-questions asking about my answers?**  
A: To better understand your situation. If you're struggling with something, the "why" helps counsellors give better support.

**Q: What if my risk score seems wrong?**  
A: The score includes multiple factors:
- How severe your answers are
- Whether they're "worst case" responses
- How long you've been experiencing it
- How much it's affecting you
- Which category (emotional concerns weigh more heavily)

**Q: Will my parents see this?**  
A: No. This is between you, your counsellor, and school leadership (if applicable). Your privacy is protected.

**Q: What happens if I'm flagged as high-risk?**  
A: A counsellor will reach out proactively. This isn't a punishment - it's support being offered.

**Q: Can I retake the assessment?**  
A: Yes! The system tracks all assessments, so counsellors can see your progress over time.

**Q: What if I'm in crisis right now?**  
A: If you're in immediate danger:
1. Call emergency services (911 in US)
2. Or text HOME to 741741 (Crisis Text Line)
3. Or call 988 (Suicide & Crisis Lifeline)

**Q: How often should I take the assessment?**  
A: Your school may recommend a schedule. Generally:
- First time: Initial baseline
- After 1 month: Check progress
- Ongoing: Monthly or as needed

## Testing the System

### As a Student
1. Go to Assessment page
2. Try different answer combinations
3. Notice sub-questions appear for concerning answers
4. Watch risk score change in real-time
5. Complete and submit to see full results

### As a Counsellor
1. Open student assessment record
2. Look for:
   - High category scores
   - Repeated concerning sub-answers
   - Duration indicators (long-term issues)
   - Critical alerts
3. Use these insights in sessions

### As an Admin
1. Check assessment collection in Firebase
2. Verify new fields present:
   - `subAnswers`
   - `totalRiskScore`
   - `categoryScores`
   - `criticalAlert`
3. Monitor critical alert logs

## Support

### Student Issues
- Can't see sub-questions?
  - Make sure to select a concerning answer
  - Refresh page
  
- Risk score seems high?
  - Check your answers
  - Consider speaking with counsellor

- Can't submit?
  - Make sure all questions answered
  - Check internet connection

### Counsellor Issues
- Can't see sub-answers?
  - Check student has completed new assessment
  - Old assessments may not have this data
  
- Critical alert not showing?
  - Verify Q24 score >= 2
  - Check for data sync issues

### Technical Support
- Component errors? Check browser console
- Firebase issues? Check Firestore rules
- Performance slow? Clear cache, try different browser

## Files to Review

**For Understanding the System:**
1. `ADAPTIVE_ASSESSMENT_GUIDE.md` - Complete technical documentation
2. `src/utils/assessmentConfig.js` - All questions and configurations
3. `src/utils/adaptiveRiskCalculator.js` - How risk is calculated
4. `src/pages/Assessment.jsx` - UI implementation

**For Configuration:**
- Adjust worst answers: `assessmentConfig.js` → `worstAnswersPerQuestion`
- Change risk weights: `assessmentConfig.js` → `categoryWeights`
- Modify sub-questions: `assessmentConfig.js` → `subQuestionTemplates`

## What's Different from Before?

| Feature | Before | After |
|---------|--------|-------|
| Sub-Questions | None | Auto-expanding contextual follow-ups |
| Risk Scoring | Simple average | Weighted multi-factor calculation |
| Self-Harm Detection | Manual review only | Automatic immediate alert |
| Dashboard | Basic progress | Live risk score + 5-category breakdown |
| Data Stored | Basic answers | Detailed reasons + risk scores |
| Counsellor Insights | Limited | Rich sub-answer data |

## Success Metrics

System is working well when:
✅ Sub-questions appear within 1 second  
✅ Risk score updates instantly on answer change  
✅ Self-harm alert appears immediately when triggered  
✅ All data appears in Firebase within 5 seconds of submission  
✅ Mobile layout responsive on all screen sizes  
✅ Animations smooth (60fps)  

---

**Ready to use!** The system is fully integrated and tested.

For technical setup questions, contact your development team.  
For privacy/security questions, contact your admin.  
For assessment-related questions, reach out to your counsellor.

---

*Last Updated: 2024*  
*System Status: ✅ Production Ready*
