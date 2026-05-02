import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth.js";
import { createAssessmentRecord } from "../services/firebase/assessments.js";
import { toast } from "react-hot-toast";
import { processCompleteAssessmentPipeline } from "../services/wellnessDataFlow.js";
import { calculateTotalRiskScore, checkCriticalAlert, getDetailedBreakdown } from "../utils/adaptiveRiskCalculator";
import { ASSESSMENT_QUESTIONS, CATEGORIES, subQuestionTemplates, getSubQuestions, isWorstAnswer, getQuestionById, getQuestionMetadata } from "../utils/assessmentConfig";
import { findMatchingCounsellor } from "../utils/counsellorMatcher";
import { autoAssignCounsellor } from "../services/firebase/users";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, ChevronRight, AlertCircle, Phone, MessageCircle, Zap, ChevronDown, Lock } from "lucide-react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function Assessment() {
  const [currentSection, setCurrentSection] = useState(0);
  const activeCategory = currentSection;
  const setActiveCategory = setCurrentSection;
  const [answers, setAnswers] = useState({}); // Map: questionId -> selectedOptionText
  const [subAnswers, setSubAnswers] = useState({}); // Map: questionId -> { reason, duration, impact }
  const [lastAnsweredQuestionId, setLastAnsweredQuestionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const progress = (totalAnswered / totalQuestions) * 100;
  
  const currentCategory = CATEGORIES[activeCategory];
  const categoryQuestionsIds = currentCategory.questionIds;
  const categoryQuestions = categoryQuestionsIds.map(id => getQuestionById(id)).filter(Boolean);
  const answeredInCategory = categoryQuestionsIds.filter(id => answers[id]).length;

  const isSectionComplete = (sectionIndex) => {
    const category = CATEGORIES[sectionIndex];
    if (!category) return false;
    return category.questionIds.every(questionId => answers[questionId] !== undefined);
  };

  const maxUnlockedSection = useMemo(() => {
    const firstIncomplete = CATEGORIES.findIndex((_, idx) => !isSectionComplete(idx));
    if (firstIncomplete === -1) return CATEGORIES.length - 1;
    return firstIncomplete;
  }, [answers]);

  const isAllComplete = useMemo(
    () => CATEGORIES.every((_, idx) => isSectionComplete(idx)),
    [answers]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeCategory]);

  // Calculate risk score dynamically
  const { riskScore, categoryScores, criticalAlert, riskLevel } = useMemo(() => {
    try {
      const totalRisk = calculateTotalRiskScore(answers, subAnswers);
      const breakdown = getDetailedBreakdown(answers, subAnswers);
      const critical = checkCriticalAlert(answers, subAnswers);
      
      return {
        riskScore: totalRisk.score || 0,
        categoryScores: totalRisk.categoryScores || {},
        criticalAlert: critical,
        riskLevel: totalRisk.riskLevel || { level: "Low", color: "emerald", icon: "🟢" }
      };
    } catch (e) {
      console.error("Risk calculation error:", e);
      return { riskScore: 0, categoryScores: {}, criticalAlert: { isCritical: false }, riskLevel: { level: "Low", color: "emerald", icon: "🟢" } };
    }
  }, [answers, subAnswers]);

  // Per-category progress
  // Per-category progress
  const getCategoryProgress = (categoryIndex) => {
    const category = CATEGORIES[categoryIndex];
    const answered = category.questionIds.filter(qId => answers[qId]).length;
    return { answered, total: category.questionIds.length, percentage: (answered / category.questionIds.length) * 100 };
  };

  const handleSectionClick = (sectionIndex) => {
    if (sectionIndex === activeCategory) return;

    if (!isSectionComplete(activeCategory)) {
      toast.error("Please complete all questions in this section first");
      return;
    }

    if (sectionIndex > maxUnlockedSection) {
      toast.error("Complete previous sections to unlock this section");
      return;
    }

    setActiveCategory(sectionIndex);
  };

  const handleAnswer = (optionText, questionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionText
    }));
    setLastAnsweredQuestionId(questionId);
    
    // If this wasn't a worst answer and we had sub-answers, clear them
    if (!isWorstAnswer(questionId, optionText)) {
      setSubAnswers(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  };

  const handleSubAnswer = (field, value, questionId) => {
    setSubAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value
      }
    }));
  };

  const goToPreviousCategory = () => {
    if (activeCategory > 0) {
      setActiveCategory(prev => prev - 1);
    }
  };

  const goToNextCategory = () => {
    if (!isSectionComplete(activeCategory)) {
      toast.error("Complete all questions before proceeding");
      return;
    }

    if (activeCategory < CATEGORIES.length - 1) {
      setActiveCategory(activeCategory + 1);
    } else {
      toast.success("All sections complete! You can submit now.");
    }
  };

  const submitAssessmentHandler = async () => {
    setLoading(true);
    try {
      // Validate all questions answered
      if (!isAllComplete) {
        toast.error("Please complete all sections before submitting.");
        setLoading(false);
        return;
      }

      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("User not authenticated. Please login again.");
        setLoading(false);
        return;
      }

      console.log("Answers:", answers);

      // Flatten answers to array for storage
      const answersArray = ASSESSMENT_QUESTIONS.map(q => answers[q.id]);

      const result = {
        score: Math.round(riskScore),
        riskLevel: riskLevel.level,
        riskColor: riskLevel.color,
      };

      console.log("Score:", result);

      // Preserve existing counselor assignment if student already has one
      const userRef = doc(db, "users", currentUser.id);
      const existingUserSnap = await getDoc(userRef);
      const existingUserData = existingUserSnap.exists() ? existingUserSnap.data() : {};
      
      let resolvedCounsellorId = existingUserData?.assignedCounsellorId || "";
      let resolvedCounsellorName = existingUserData?.assignedCounsellorName || "Counsellor";
      let primaryConcernKey = "academicStress";
      let specialization = "Emotional Health"; // Default specialization

      // Only find/assign a new counselor if student doesn't already have one
      if (!resolvedCounsellorId) {
        const { primaryConcernKey: concern, specialization: spec, assignedCounsellor } = await findMatchingCounsellor(categoryScores || {});
        primaryConcernKey = concern;
        specialization = spec || "Emotional Health";
        const fallbackCounsellor = assignedCounsellor?.id
          ? null
          : await autoAssignCounsellor(currentUser.id);
        resolvedCounsellorId = assignedCounsellor?.id || fallbackCounsellor?.id || "";
        resolvedCounsellorName = assignedCounsellor?.name || fallbackCounsellor?.name || "Counsellor";
      } else {
        // Still find primary concern for assessment record, but keep existing counselor
        const { primaryConcernKey: concern, specialization: spec } = await findMatchingCounsellor(categoryScores || {});
        primaryConcernKey = concern;
        specialization = spec || "Emotional Health";
      }

      const stressBreakdown = {
        academic: Number(categoryScores?.academicStress || 0),
        social: Number(categoryScores?.socialConnection || 0),
        emotional: Number(categoryScores?.emotionalWellbeing || 0),
        sleep: Number(categoryScores?.sleepQuality || 0),
        anxiety: Number(categoryScores?.anxietyStress || 0),
      };

      // Create assessment record with all data via Firebase
      await createAssessmentRecord({
        userId: currentUser.id,
        name: currentUser?.name || "Student",
        email: currentUser?.email || "",
        answers: answersArray,
        subAnswers: subAnswers,
        score: result.score,
        totalRiskScore: riskScore,
        categoryScores: categoryScores,
        riskLevel: result.riskLevel,
        criticalAlert: criticalAlert.isCritical ? criticalAlert : null,
        stressBreakdown,
        primaryConcern: primaryConcernKey,
      });

      const todayKey = new Date().toISOString().slice(0, 10);

      await updateDoc(userRef, {
        role: "student",
        riskScore: result.score,
        riskLevel: result.riskLevel,
        assignedCounsellorId: resolvedCounsellorId,
        assignedCounsellorName: resolvedCounsellorName,
        dailyProgress: existingUserData?.dailyProgress || {
          percent: 0,
          completedTasks: [],
          date: todayKey,
        },
        weeklyStats: Array.isArray(existingUserData?.weeklyStats)
          ? existingUserData.weeklyStats
          : [],
        lastAssessment: serverTimestamp(),
        latestAssessment: {
          score: result.score,
          riskLevel: result.riskLevel,
          riskColor: result.riskColor,
          categoryScores,
          criticalAlert: criticalAlert.isCritical ? criticalAlert : null,
          stressBreakdown,
          primaryConcern: primaryConcernKey,
        },
        updatedAt: serverTimestamp(),
      });

      // NEW: Save scores and generate tasks via wellness data flow
      console.log("🚀 Processing complete wellness pipeline...");
      await processCompleteAssessmentPipeline(
        currentUser.id,
        answers,
        subAnswers,
        categoryScores
      );

      localStorage.setItem("studentResult", JSON.stringify({
        score: parseFloat(riskScore),
        level: result.riskLevel,
        riskColor: result.riskColor,
        categoryScores: categoryScores,
        primaryConcern: primaryConcernKey,
        recommendedCounsellorSpecialization: specialization,
        answers,
        subAnswers,
      }));

      console.log("✅ Assessment submitted successfully");
      navigate("/dashboard/student");
    } catch (error) {
      console.error("❌ Error submitting assessment:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      toast.error(error?.response?.data?.message || error?.message || "Error submitting assessment. Please try again.");
      setLoading(false);
    }
  };

  const activeSectionProgressPercent = Math.round((answeredInCategory / categoryQuestionsIds.length) * 100);
  const firstUnansweredQuestionId = categoryQuestions.find((question) => !answers[question.id])?.id || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </Motion.button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Wellness Assessment
          </h1>
          <div className="w-16"></div>
        </Motion.div>

        {/* Category Navigation Tabs */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-x-auto"
        >
          <div className="flex gap-3 pb-2">
            {CATEGORIES.map((category, idx) => {
              const { answered, total } = getCategoryProgress(idx);
              const isActive = activeCategory === idx;
              const isCurrentComplete = isSectionComplete(activeCategory);
              const isUnlocked = idx <= maxUnlockedSection;
              const isCompleted = answered === total && answered > 0;
              const isLocked = !isActive && (!isUnlocked || !isCurrentComplete);
              
              return (
                <Motion.button
                  key={category.id}
                  whileHover={isLocked ? {} : { scale: 1.02 }}
                  whileTap={isLocked ? {} : { scale: 0.98 }}
                  onClick={() => handleSectionClick(idx)}
                  className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/50 scale-105"
                      : isLocked
                        ? "bg-white/5 text-gray-500 border border-white/10 opacity-55 cursor-not-allowed"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.title}</span>
                  {isCompleted && (
                    <Motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-1 text-green-400"
                    >
                      ✓
                    </Motion.div>
                  )}
                  {isLocked && <Lock className="w-3.5 h-3.5 text-white/40" />}
                </Motion.button>
              );
            })}
          </div>
        </Motion.div>

        {/* Progress Section */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {currentCategory.title}
            </h2>
            <span className="text-sm text-gray-400">
              {answeredInCategory} of {categoryQuestionsIds.length} questions answered
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
            <Motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${activeSectionProgressPercent}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          <p className="mt-3 text-xs text-white/70">Section completion: {activeSectionProgressPercent}%</p>

          {/* Overall Progress */}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-sm text-gray-300">Overall Progress</span>
            <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {Math.round(progress)}% Complete
            </span>
          </div>

          <div className="mt-3 w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/10">
            <Motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </Motion.div>
        <AnimatePresence>
          {criticalAlert.isCritical && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="mb-6 bg-gradient-to-br from-red-950/50 to-red-900/30 border-2 border-red-500/50 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-red-500/20"
            >
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-8 h-8 text-red-400 animate-pulse flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-red-200 mb-2">
                    {criticalAlert.severity === 'immediate' ? '⚠️ Immediate Support Needed' : "⚠️ We're Here to Help"}
                  </h3>
                  <p className="text-red-100/90 mb-4 leading-relaxed">{criticalAlert.message}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => window.open(`tel:${"9876543210"}`)}
                      className="flex items-center space-x-2 px-5 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:shadow-red-500/50"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Contact Counsellor</span>
                    </button>
                    <button
                      onClick={() => navigate('/messages')}
                      className="flex items-center space-x-2 px-5 py-3 bg-red-600/50 hover:bg-red-600 rounded-lg font-semibold text-white transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Chat Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* Single Active Category View */}
        <AnimatePresence mode="wait">
          <Motion.div
            key={`category-${activeCategory}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            ref={containerRef}
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-8 shadow-2xl">
            {/* Category Info */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
              <span className="text-5xl">{currentCategory.icon}</span>
              <div>
                <h2 className="text-3xl font-bold text-white">{currentCategory.title}</h2>
                <p className="text-sm text-gray-400 mt-1">{currentCategory.description || `Answer these ${categoryQuestionsIds.length} questions to assess your ${currentCategory.title.toLowerCase()}`}</p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {categoryQuestions.map((question, qIdx) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isActiveQuestion={
                    (firstUnansweredQuestionId && question.id === firstUnansweredQuestionId)
                    || (!firstUnansweredQuestionId && question.id === lastAnsweredQuestionId)
                  }
                  isAnswered={!!answers[question.id]}
                  selectedAnswer={answers[question.id]}
                  onAnswer={(option) => handleAnswer(option, question.id)}
                  subAnswers={subAnswers[question.id]}
                  onSubAnswer={(field, value) => handleSubAnswer(field, value, question.id)}
                  isWorstAnswered={answers[question.id] && isWorstAnswer(question.id, answers[question.id])}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-10 flex items-center justify-between pt-8 border-t border-white/10">
              <Motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goToPreviousCategory}
                disabled={activeCategory === 0}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeCategory === 0
                    ? "bg-white/5 text-white/40 cursor-not-allowed"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                ← Previous Section
              </Motion.button>

              {activeCategory < CATEGORIES.length - 1 && (
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goToNextCategory}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                    isSectionComplete(activeCategory)
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/30"
                      : "bg-white/10 text-white/60 border border-white/20"
                  }`}
                >
                  <span>Next Section</span>
                  <ChevronRight className="w-4 h-4" />
                </Motion.button>
              )}

              {activeCategory === CATEGORIES.length - 1 && answeredInCategory === categoryQuestionsIds.length && (
                <div className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  All sections complete! Ready to submit below.
                </div>
              )}
            </div>
            </div>
          </Motion.div>
        </AnimatePresence>

        {/* Submit Button */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 mb-8"
        >
          {isAllComplete ? (
            <Motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={submitAssessmentHandler}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {loading ? (
                <>
                  <Motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>🎯 Complete Assessment</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </Motion.button>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <p className="text-white/70">
                Complete all categories to submit. <span className="font-bold text-white">{totalQuestions - totalAnswered}</span> questions remaining.
              </p>
            </div>
          )}
        </Motion.div>
      </div>
    </div>
  );
}

/**
 * QuestionCard Component - Reusable question with options and sub-questions
 */
function QuestionCard({ question, isAnswered, selectedAnswer, onAnswer, subAnswers = {}, onSubAnswer, isWorstAnswered, isActiveQuestion }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const subs = getSubQuestions(question.id);

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`space-y-4 rounded-2xl p-4 transition-all ${
        isActiveQuestion
          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 ring-1 ring-blue-400/40"
          : ""
      }`}
    >
      <div className="flex items-start space-x-4 pb-4 border-b border-white/10">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          isAnswered 
            ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200' 
            : 'bg-white/10 border-2 border-white/30 text-white/50'
        }`}>
          {isAnswered ? <CheckCircle className="w-4 h-4" /> : question.id.slice(1)}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white">{question.text}</h4>
          {isAnswered && (
            <p className="text-sm text-emerald-200 mt-2">✓ Answer selected: <span className="font-medium">{selectedAnswer}</span></p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12">
        {question.options.map((option, idx) => (
          <Motion.button
            key={idx}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(option)}
            className={`p-4 rounded-lg border-2 transition-all text-left font-medium group ${
              selectedAnswer === option
                ? "border-blue-400 bg-gradient-to-br from-blue-500/30 to-purple-500/20 text-blue-100 shadow-lg shadow-blue-500/20"
                : "border-white/10 bg-white/5 text-white/80 hover:border-white/30 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all ${
                selectedAnswer === option
                  ? "border-blue-300 bg-blue-400"
                  : "border-white/40"
              }`} />
              <span>{option}</span>
            </div>
          </Motion.button>
        ))}
      </div>

      {/* Sub-Question Section */}
      <AnimatePresence>
        {isWorstAnswered && subs && (
          <SubQuestionSection
            question={question}
            subAnswers={subAnswers}
            handleSubAnswer={onSubAnswer}
            subQuestionTemplates={subQuestionTemplates}
          />
        )}
      </AnimatePresence>
    </Motion.div>
  );
}

function SubQuestionSection({ question, subAnswers = {}, handleSubAnswer, subQuestionTemplates }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const subs = getSubQuestions(question.id);

  if (!subs) return null;

  const allFilled = subAnswers?.reason && subAnswers?.duration && subAnswers?.impact;

  return (
    <Motion.div
      initial={{ opacity: 0, y: -10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -10, height: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6 space-y-6 ml-12"
    >
      {/* Header */}
      <div className="flex items-start space-x-3">
        <Motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
        </Motion.div>
        <div>
          <p className="text-base font-semibold text-red-200">Help us understand your situation better</p>
          <p className="text-sm text-red-300/80 mt-1">This will improve your personalized recommendations</p>
        </div>
      </div>

      {/* Sub-Questions */}
      <div className="space-y-4">
        <CustomSelectField
          label={subs.reason.label}
          value={subAnswers?.reason || ""}
          options={subs.reason.options}
          isOpen={openDropdown === "reason"}
          onToggle={() => setOpenDropdown(openDropdown === "reason" ? null : "reason")}
          onSelect={(val) => { handleSubAnswer("reason", val); setOpenDropdown(null); }}
          icon="🎯"
        />

        <CustomSelectField
          label={subs.duration.label}
          value={subAnswers?.duration || ""}
          options={subs.duration.options}
          isOpen={openDropdown === "duration"}
          onToggle={() => setOpenDropdown(openDropdown === "duration" ? null : "duration")}
          onSelect={(val) => { handleSubAnswer("duration", val); setOpenDropdown(null); }}
          icon="⏱️"
        />

        <CustomSelectField
          label={subs.impact.label}
          value={subAnswers?.impact || ""}
          options={subs.impact.options}
          isOpen={openDropdown === "impact"}
          onToggle={() => setOpenDropdown(openDropdown === "impact" ? null : "impact")}
          onSelect={(val) => { handleSubAnswer("impact", val); setOpenDropdown(null); }}
          icon="💔"
        />
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {allFilled && (
          <Motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 rounded-lg p-4 flex items-center space-x-3"
          >
            <Motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5 }}>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </Motion.div>
            <p className="text-sm font-medium text-green-200">✅ Got it! This helps us understand better</p>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}

/**
 * Custom Interactive Select Field
 */
function CustomSelectField({ label, value, options, isOpen, onToggle, onSelect, icon }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-white/90 flex items-center space-x-2">
        <span>{icon}</span>
        <span>{label}</span>
      </label>

      <div className="relative">
        <Motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={onToggle}
          className={`w-full px-5 py-3 rounded-xl font-medium text-left transition-all duration-300 flex items-center justify-between ${
            value
              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-green-100"
              : "bg-white/5 border border-white/20 text-white/70 hover:border-white/40 hover:bg-white/10"
          } ${isOpen ? "ring-2 ring-blue-500/50 border-blue-500/50" : ""}`}
        >
          <span className="flex items-center space-x-2">
            {value ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>{value}</span>
              </>
            ) : (
              <span className="text-white/50">Select an option...</span>
            )}
          </span>
          <Motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-4 h-4" />
          </Motion.div>
        </Motion.button>

        <AnimatePresence>
          {isOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
            >
              <div className="max-h-64 overflow-y-auto">
                {options.map((option, idx) => (
                  <Motion.button
                    key={idx}
                    onClick={() => onSelect(option)}
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)", paddingLeft: "1.5rem" }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full px-4 py-3 text-left transition-all border-b border-white/5 last:border-b-0 flex items-center justify-between group ${
                      value === option
                        ? "bg-blue-500/20 text-blue-100"
                        : "text-white/70 hover:text-white/90"
                    }`}
                  >
                    <span>{option}</span>
                    {value === option && (
                      <Motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </Motion.div>
                    )}
                  </Motion.button>
                ))}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
