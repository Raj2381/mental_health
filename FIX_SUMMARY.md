# Export Error Fix Summary

## Issue
`SyntaxError: The requested module 'assessmentConfig.js' does not provide an export named 'durationBonuses'`

## Root Cause
The old `adaptiveRiskCalculator.js` was trying to import outdated exports that were renamed in the new 25-question config:
- ❌ `optionScores` (renamed to `impactScores`)
- ❌ `impactBonuses` (replaced with `impactScores`)
- ❌ `durationBonuses` (renamed to `durationScores`)
- ❌ `questionMetadata` (replaced with `getQuestionMetadata()` function)
- ❌ `worstAnswersPerQuestion` (old schema, now using ASSESSMENT_QUESTIONS)

## Solution
Updated `adaptiveRiskCalculator.js` to:

1. **Fixed Imports**
   ```javascript
   import {
     categoryWeights,
     impactScores,           // ← renamed
     durationScores,         // ← renamed
     ASSESSMENT_QUESTIONS,   // ← new
     getRiskLevel,
     isWorstAnswer,          // ← helper function
     getQuestionById,        // ← helper function
   } from "./assessmentConfig";
   ```

2. **Rewrote calculateTotalRiskScore()**
   - Changed from section-based to question-ID based (q1-q25)
   - Maps answers by question ID instead of section index
   - Calculates scores per category (academic, social, sleep, anxiety, emotional)
   - Applies weighted scoring

3. **Updated checkCriticalAlert()**
   - Changed to use question ID "q24" for self-harm detection
   - Uses `isWorstAnswer()` helper function
   - Maps subAnswers by question ID

4. **Rewrote getDetailedBreakdown()**
   - Iterates through ASSESSMENT_QUESTIONS instead of old schema
   - Flags questions by questionId instead of section_index
   - Includes proper category score calculation

5. **Fixed Assessment.jsx**
   - Corrected useMemo hook parameters
   - Calls `calculateTotalRiskScore(answers, subAnswers)` correctly
   - Returns proper structure: `{ score, categoryScores, riskLevel }`

## Files Modified
- ✅ `src/utils/adaptiveRiskCalculator.js` - Complete rewrite of 3 functions
- ✅ `src/pages/Assessment.jsx` - Fixed risk calculation hook

## Verification
- ✅ All imports resolved
- ✅ No compilation errors
- ✅ Export names match new config (impactScores, durationScores)
- ✅ All 25 questions map correctly
- ✅ Risk scoring uses new Q-based structure
- ✅ Critical alert (q24) detection updated

## Result
Assessment system now works with 25-question config and dynamic sub-questions!
