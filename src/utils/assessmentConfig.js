// Assessment Configuration: All 25 Questions with Sub-Questions

export const ASSESSMENT_QUESTIONS = [
  // ACADEMIC STRESS (Q1-Q5)
  {
    id: "q1",
    text: "How often do you feel overwhelmed by academic workload and deadlines?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    worst: ["Often", "Always"],
    category: "academic",
    section: "academicStress"
  },
  {
    id: "q2",
    text: "Do you experience physical symptoms due to academic stress?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    worst: ["Often", "Always"],
    category: "academic",
    section: "academicStress"
  },
  {
    id: "q3",
    text: "How much pressure do you feel to achieve high grades?",
    options: ["No pressure", "Mild", "Moderate", "High", "Extreme"],
    worst: ["High", "Extreme"],
    category: "academic",
    section: "academicStress"
  },
  {
    id: "q4",
    text: "Do you feel you have adequate time to balance studies and personal life?",
    options: ["Always", "Usually", "Sometimes", "Rarely", "Never"],
    worst: ["Rarely", "Never"],
    category: "academic",
    section: "academicStress"
  },
  {
    id: "q5",
    text: "How often do you stay up late or skip meals due to academics?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Very frequently"],
    worst: ["Often", "Very frequently"],
    category: "academic",
    section: "academicStress"
  },

  // SOCIAL CONNECTION (Q6-Q10)
  {
    id: "q6",
    text: "How satisfied are you with your friendships?",
    options: ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"],
    worst: ["Dissatisfied", "Very dissatisfied"],
    category: "social",
    section: "socialConnection"
  },
  {
    id: "q7",
    text: "How often do you feel lonely?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    worst: ["Often", "Always"],
    category: "social",
    section: "socialConnection"
  },
  {
    id: "q8",
    text: "Do you have someone you feel comfortable talking to about your problems?",
    options: ["Yes, several", "Yes, one", "Maybe one", "Not really", "No one"],
    worst: ["Not really", "No one"],
    category: "social",
    section: "socialConnection"
  },
  {
    id: "q9",
    text: "How included do you feel in your community or peer group?",
    options: ["Very included", "Included", "Neutral", "Excluded", "Very excluded"],
    worst: ["Excluded", "Very excluded"],
    category: "social",
    section: "socialConnection"
  },
  {
    id: "q10",
    text: "Have you experienced bullying or toxic relationships?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Frequently"],
    worst: ["Often", "Frequently"],
    category: "social",
    section: "socialConnection"
  },

  // SLEEP QUALITY (Q11-Q15)
  {
    id: "q11",
    text: "How many hours of sleep do you typically get per night?",
    options: ["Less than 4", "4-5", "5-6", "6-7", "7+"],
    worst: ["Less than 4", "4-5"],
    category: "sleep",
    section: "sleepQuality"
  },
  {
    id: "q12",
    text: "Do you have trouble falling or staying asleep?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Every night"],
    worst: ["Often", "Every night"],
    category: "sleep",
    section: "sleepQuality"
  },
  {
    id: "q13",
    text: "Do you wake up feeling refreshed and rested?",
    options: ["Always", "Usually", "Sometimes", "Rarely", "Never"],
    worst: ["Rarely", "Never"],
    category: "sleep",
    section: "sleepQuality"
  },
  {
    id: "q14",
    text: "How often do you feel fatigued or low on energy during the day?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Constantly"],
    worst: ["Often", "Constantly"],
    category: "sleep",
    section: "sleepQuality"
  },
  {
    id: "q15",
    text: "Do you use your phone or screens just before trying to sleep?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    worst: ["Often", "Always"],
    category: "sleep",
    section: "sleepQuality"
  },

  // ANXIETY (Q16-Q20)
  {
    id: "q16",
    text: "Do you experience excessive worry or racing thoughts?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Nearly every day"],
    worst: ["Often", "Nearly every day"],
    category: "anxiety",
    section: "anxietyStress"
  },
  {
    id: "q17",
    text: "Do you experience physical anxiety symptoms (racing heart, sweating, etc.)?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Very frequently"],
    worst: ["Often", "Very frequently"],
    category: "anxiety",
    section: "anxietyStress"
  },
  {
    id: "q18",
    text: "Do you avoid situations or activities due to anxiety?",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
    worst: ["Often", "Always"],
    category: "anxiety",
    section: "anxietyStress"
  },
  {
    id: "q19",
    text: "Can you calm yourself down when feeling anxious?",
    options: ["Always", "Usually", "Sometimes", "Rarely", "Never"],
    worst: ["Rarely", "Never"],
    category: "anxiety",
    section: "anxietyStress"
  },
  {
    id: "q20",
    text: "How much does anxiety interfere with your daily activities?",
    options: ["Not at all", "A little", "Moderately", "Quite a bit", "Extremely"],
    worst: ["Quite a bit", "Extremely"],
    category: "anxiety",
    section: "anxietyStress"
  },

  // EMOTIONAL WELLBEING (Q21-Q25)
  {
    id: "q21",
    text: "How often do you feel depressed or hopeless?",
    options: ["Not at all", "Several days", "More than half the days", "Nearly every day"],
    worst: ["More than half the days", "Nearly every day"],
    category: "emotional",
    section: "emotionalWellbeing"
  },
  {
    id: "q22",
    text: "Have you lost interest in activities you normally enjoy?",
    options: ["Not at all", "A little", "Moderately", "Significantly", "Completely"],
    worst: ["Significantly", "Completely"],
    category: "emotional",
    section: "emotionalWellbeing"
  },
  {
    id: "q23",
    text: "Do you have healthy ways to cope with stress and emotions?",
    options: ["Yes, several", "Yes, a few", "One or two", "Not really", "None"],
    worst: ["Not really", "None"],
    category: "emotional",
    section: "emotionalWellbeing"
  },
  {
    id: "q24",
    text: "Have you had thoughts of self-harm or suicide?",
    options: ["Never", "Rarely", "Sometimes", "Often", "I have a plan"],
    worst: ["Sometimes", "Often", "I have a plan"],
    category: "emotional",
    section: "emotionalWellbeing",
    isCritical: true
  },
  {
    id: "q25",
    text: "How hopeful do you feel about your future?",
    options: ["Very hopeful (9-10)", "Hopeful (7-8)", "Uncertain (5-6)", "Not hopeful (3-4)", "Hopeless (1-2)"],
    worst: ["Not hopeful (3-4)", "Hopeless (1-2)"],
    category: "emotional",
    section: "emotionalWellbeing"
  }
];

export const worstAnswersPerQuestion = {
  academicStress: {
    0: [3, 4], // Q1: Often, Always
    1: [3, 4], // Q2: Often, Always
    2: [3, 4], // Q3: High, Extreme
    3: [0, 1], // Q4: Never, Rarely (reversed)
    4: [3, 4], // Q5: Often, Very frequently
  },
  socialConnection: {
    0: [3, 4], // Q1: Dissatisfied, Very dissatisfied
    1: [3, 4], // Q2: Often, Always
    2: [3, 4], // Q3: Not really, No one
    3: [3, 4], // Q4: Excluded, Very excluded
    4: [3, 4], // Q5: Often, Frequently
  },
  sleepQuality: {
    0: [0, 1], // Q1: Less than 4, 4-5 hours
    1: [3, 4], // Q2: Often, Every night
    2: [0, 1], // Q3: Rarely, Never (reversed)
    3: [3, 4], // Q4: Often, Constantly
    4: [3, 4], // Q5: Often, Always
  },
  anxietyStress: {
    0: [3, 4], // Q1: Often, Nearly every day
    1: [3, 4], // Q2: Often, Very frequently
    2: [3, 4], // Q3: Often, Always
    3: [0, 1], // Q4: Rarely, Never (reversed)
    4: [3, 4], // Q5: Quite a bit, Extremely
  },
  emotionalWellbeing: {
    0: [2, 3], // Q1: More than half, Nearly every day
    1: [3, 4], // Q2: Significantly, Completely
    2: [3, 4], // Q3: Not really, None
    3: [2, 3, 4], // Q4: Sometimes, Often, I have a plan (CRITICAL)
    4: [0, 1], // Q5: 1-2, 3-4 (reversed)
  },
};

export const subQuestionTemplates = {
  q1: {
    reason: { label: "What is the main reason?", options: ["Too many assignments", "Exam pressure", "Poor time management", "Fear of failure", "Competition/comparison"] },
    duration: { label: "How long have you felt this way?", options: ["Few days", "Few weeks", "Few months", "Several months", "Long-term"] },
    impact: { label: "How severely does this affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q2: {
    reason: { label: "What triggers these symptoms?", options: ["Before exams", "During busy periods", "Specific subjects", "Always/unpredictably", "Getting worse"] },
    duration: { label: "How long have you experienced this?", options: ["Few days", "Few weeks", "Few months", "Several months", "Long-term"] },
    impact: { label: "How much does it interfere?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q3: {
    reason: { label: "Who or what is the source?", options: ["Self-imposed expectations", "Parents/family", "Peers/comparison", "Teachers/institution", "Combination"] },
    duration: { label: "How long have you felt pressured?", options: ["Few days", "Few weeks", "Few months", "Several months", "Always"] },
    impact: { label: "How much stress does it cause?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q4: {
    reason: { label: "What gets sacrificed most?", options: ["Sleep", "Social life", "Health/exercise", "Hobbies", "Family time"] },
    duration: { label: "How often does this happen?", options: ["Occasionally", "Sometimes", "Regularly", "Most of the time", "Always"] },
    impact: { label: "How much does this affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q5: {
    reason: { label: "Why do you skip meals/sleep?", options: ["Too busy/procrastinating", "Anxiety/stress", "Lack of planning", "Caffeine dependency", "Don't notice"] },
    duration: { label: "How often does this happen?", options: ["Occasionally", "Sometimes", "Regularly", "Most nights", "Every night"] },
    impact: { label: "How does it affect your health?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q6: {
    reason: { label: "What's missing?", options: ["Deep connection", "Trust/honesty", "Support/understanding", "Shared interests", "Quality time"] },
    duration: { label: "How long have you felt this way?", options: ["Few weeks", "Few months", "Several months", "1-2 years", "Multiple years"] },
    impact: { label: "How much does this hurt?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q7: {
    reason: { label: "When do you feel most lonely?", options: ["In crowds", "After social events", "Weekends/alone time", "Most of the time", "Always"] },
    duration: { label: "How often do you feel lonely?", options: ["Occasionally", "Sometimes", "Regularly", "Most days", "Every day"] },
    impact: { label: "How much does it affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q8: {
    reason: { label: "Why haven't you found someone?", options: ["Fear of judgment", "Social anxiety", "Trust issues", "Lack of opportunity", "Don't know where"] },
    duration: { label: "How long have you felt alone?", options: ["Few weeks", "Few months", "Several months", "1-2 years", "Multiple years"] },
    impact: { label: "How much does this isolate you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q9: {
    reason: { label: "What would help inclusion?", options: ["More social events", "Welcoming groups", "Common interests", "Better communication", "Different peer group"] },
    duration: { label: "How long have you felt excluded?", options: ["Few weeks", "Few months", "Several months", "1-2 years", "Multiple years"] },
    impact: { label: "How much does exclusion hurt?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q10: {
    reason: { label: "How is this affecting you?", options: ["Emotional pain", "Avoiding situations", "Loss of confidence", "Physical impact", "Affecting studies"] },
    duration: { label: "How long has this been happening?", options: ["Few weeks", "Few months", "Several months", "1-2 years", "Multiple years"] },
    impact: { label: "How severely does it affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q11: {
    reason: { label: "Why is sleep limited?", options: ["Academic workload", "Phone/screens", "Anxiety", "Sleep disorder", "Schedule conflicts"] },
    duration: { label: "How long has this been the case?", options: ["Few weeks", "Few months", "Several months", "1-2 years", "Multiple years"] },
    impact: { label: "How does it affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q12: {
    reason: { label: "What keeps you awake?", options: ["Racing thoughts", "Stress/anxiety", "Physical discomfort", "Noise/environment", "Caffeine"] },
    duration: { label: "How often does this happen?", options: ["Occasionally", "Sometimes", "Regularly", "Most nights", "Every night"] },
    impact: { label: "How much does it affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q13: {
    reason: { label: "What could improve sleep?", options: ["More sleep hours", "Consistent schedule", "Reduce stress", "Better environment", "Medical help"] },
    duration: { label: "How often do you feel unrested?", options: ["Occasionally", "Sometimes", "Regularly", "Most days", "Every day"] },
    impact: { label: "How much does it affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q14: {
    reason: { label: "How does fatigue affect you?", options: ["Concentration issues", "Mood problems", "Physical sluggishness", "Accident risk", "Relationships"] },
    duration: { label: "How often do you feel fatigued?", options: ["Occasionally", "Sometimes", "Regularly", "Most days", "All the time"] },
    impact: { label: "How severely does it impact life?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q15: {
    reason: { label: "Why use phone before sleep?", options: ["Habit", "Checking messages", "Entertainment", "Work/study", "Anxiety relief"] },
    duration: { label: "How often does this happen?", options: ["Occasionally", "Sometimes", "Regularly", "Most nights", "Every night"] },
    impact: { label: "How much does it affect sleep?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q16: {
    reason: { label: "What do you worry about?", options: ["Academic performance", "Social situations", "Future/career", "Health", "Multiple things"] },
    duration: { label: "How often do you worry?", options: ["Occasionally", "Sometimes", "Regularly", "Most days", "Nearly daily"] },
    impact: { label: "How much does worry affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q17: {
    reason: { label: "When do these occur?", options: ["During exams", "Social situations", "Unpredictably", "Most days", "Constantly"] },
    duration: { label: "How often do symptoms happen?", options: ["Occasionally", "Sometimes", "Regularly", "Most days", "Daily"] },
    impact: { label: "How severely do they impact you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q18: {
    reason: { label: "What do you typically avoid?", options: ["Social events", "Presentations", "Certain places", "Specific people", "Activities"] },
    duration: { label: "How often do you avoid things?", options: ["Occasionally", "Sometimes", "Regularly", "Most situations", "Always"] },
    impact: { label: "How much does avoidance limit life?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q19: {
    reason: { label: "What might help calm you?", options: ["Nothing helps", "Exercise", "Talking to someone", "Medication", "Time alone"] },
    duration: { label: "How often does anxiety persist?", options: ["Short-lived", "Sometimes lingers", "Regularly prolonged", "Hours at a time", "All day/multiple days"] },
    impact: { label: "How much does it affect daily life?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q20: {
    reason: { label: "What activities are affected?", options: ["Social activities", "Academic work", "Hobbies", "Relationships", "Multiple areas"] },
    duration: { label: "How constant is this interference?", options: ["Occasionally", "Sometimes", "Regularly", "Most days", "Daily"] },
    impact: { label: "How severely does it limit you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q21: {
    reason: { label: "What triggers these feelings?", options: ["Academic stress", "Social isolation", "Family issues", "Unclear reason", "Multiple things"] },
    duration: { label: "How often do you feel this?", options: ["Sometimes", "Several days", "Half the days", "Most days", "Nearly daily"] },
    impact: { label: "How much does it affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q22: {
    reason: { label: "How long have you lost interest?", options: ["Few days", "Few weeks", "Few months", "Months+", "Can't remember"] },
    duration: { label: "Is this getting worse?", options: ["Improving", "Stable", "Slowly worsening", "Getting worse", "Rapidly worsening"] },
    impact: { label: "How much does it affect life?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q23: {
    reason: { label: "What's the main barrier?", options: ["Don't know how", "No energy/motivation", "No resources", "Too isolated", "Doesn't work"] },
    duration: { label: "How long has this been difficult?", options: ["Few weeks", "Few months", "Several months", "1-2 years", "Multiple years"] },
    impact: { label: "How much does it affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  },
  q24: {
    reason: { label: "When did this start?", options: ["Recently", "Few weeks", "Few months", "Long-term", "Getting worse"], isCritical: true },
    duration: { label: "How often are these thoughts?", options: ["Rarely", "Sometimes", "Regularly", "Often", "Constantly"], isCritical: true },
    impact: { label: "Do you have a plan?", options: ["No", "Maybe thought about it", "Somewhat", "Yes, detailed", "Already attempted"], isCritical: true }
  },
  q25: {
    reason: { label: "What would help you feel hopeful?", options: ["Professional support", "Life changes", "Better relationships", "Achievements", "Time/perspective"] },
    duration: { label: "How long have you felt hopeless?", options: ["Few days", "Few weeks", "Few months", "Several months", "Long-term"] },
    impact: { label: "How much does hopelessness affect you?", options: ["Slightly", "Moderately", "Significantly", "Severely", "Very severely"] }
  }
};

export const categoryWeights = {
  academicStress: 1.2,
  socialConnection: 1.1,
  sleepQuality: 1.0,
  anxietyStress: 1.5,
  emotionalWellbeing: 1.8,
};

export const impactScores = {
  "Slightly": 1,
  "Moderately": 2,
  "Significantly": 3,
  "Severely": 4,
  "Very severely": 5,
};

export const durationScores = {
  "Few days": 0,
  "Few weeks": 1,
  "Few months": 2,
  "Several months": 3,
  "1-2 years": 4,
  "Multiple years": 5,
  "Long-term": 5,
  "Occasionally": 0,
  "Sometimes": 1,
  "Regularly": 2,
  "Most days": 3,
  "Every day": 4,
  "All the time": 5,
  "Nearly daily": 4,
};

export const riskLevels = [
  { min: 0, max: 30, level: "Low", color: "emerald", icon: "🟢" },
  { min: 31, max: 55, level: "Moderate", color: "amber", icon: "🟡" },
  { min: 56, max: 75, level: "High", color: "orange", icon: "🟠" },
  { min: 76, max: 100, level: "Critical", color: "red", icon: "🔴" },
];

export const getRiskLevel = (score) => {
  return riskLevels.find(level => score >= level.min && score <= level.max) || riskLevels[3];
};

export const getQuestionById = (id) => {
  return ASSESSMENT_QUESTIONS.find(q => q.id === id);
};

export const isWorstAnswer = (questionId, answerText) => {
  const question = getQuestionById(questionId);
  if (!question) return false;
  return question.worst.includes(answerText);
};

export const getSubQuestions = (questionId) => {
  return subQuestionTemplates[questionId] || null;
};

// Category-based organization
export const CATEGORIES = [
  {
    id: "academicStress",
    title: "Academic Stress & Performance",
    icon: "📚",
    questionIds: ["q1", "q2", "q3", "q4", "q5"]
  },
  {
    id: "socialConnection",
    title: "Social Connection & Belonging",
    icon: "❤️",
    questionIds: ["q6", "q7", "q8", "q9", "q10"]
  },
  {
    id: "sleepQuality",
    title: "Sleep Quality & Energy",
    icon: "😴",
    questionIds: ["q11", "q12", "q13", "q14", "q15"]
  },
  {
    id: "anxietyStress",
    title: "Anxiety & Stress Management",
    icon: "😰",
    questionIds: ["q16", "q17", "q18", "q19", "q20"]
  },
  {
    id: "emotionalWellbeing",
    title: "Emotional Wellbeing & Coping",
    icon: "😊",
    questionIds: ["q21", "q22", "q23", "q24", "q25"]
  }
];

// Helper functions
export const getQuestionMetadata = (index) => {
  const sectionMap = {
    "academicStress": { title: "Academic Stress & Performance", icon: "📚" },
    "socialConnection": { title: "Social Connection & Belonging", icon: "❤️" },
    "sleepQuality": { title: "Sleep Quality & Energy", icon: "😴" },
    "anxietyStress": { title: "Anxiety & Stress Management", icon: "😰" },
    "emotionalWellbeing": { title: "Emotional Wellbeing & Coping", icon: "😊" },
  };
  const question = ASSESSMENT_QUESTIONS[index];
  if (!question) return null;
  return { ...sectionMap[question.section], section: question.section };
};
