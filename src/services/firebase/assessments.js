import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS } from "./collections";

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortDesc(items) {
  return [...items].sort((left, right) => toMillis(right.createdAt) - toMillis(left.createdAt));
}

export async function createAssessmentRecord(payload) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.assessments), {
      userId: payload.userId,
      name: payload.name,
      email: payload.email,
      answers: payload.answers || [],
      subAnswers: payload.subAnswers || {}, // NEW: Detailed reasons, duration, impact for worst answers
      score: payload.score || 0,
      totalRiskScore: payload.totalRiskScore || 0, // NEW: Adaptive risk calculation (0-100)
      riskLevel: payload.riskLevel || 'low',
      categoryScores: payload.categoryScores || {}, // NEW: Per-category risk breakdown
      stressBreakdown: {
        academic: payload.stressBreakdown?.academic || 0,
        social: payload.stressBreakdown?.social || 0,
        emotional: payload.stressBreakdown?.emotional || 0,
        sleep: payload.stressBreakdown?.sleep || 0,
      },
      criticalAlert: payload.criticalAlert || null, // NEW: Self-harm detection flag
      primaryConcern: payload.primaryConcern || '',
      createdAt: serverTimestamp(),
    });
    return docRef;
  } catch (error) {
    console.error('Error creating assessment record:', error);
    throw new Error(`Failed to save assessment: ${error.message}`);
  }
}

export function watchUserAssessments(userId, callback) {
  if (!userId) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.assessments),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
      },
      (error) => {
        // Silently fail for failed-precondition (missing index) - user can still see data
        if (error.code === 'failed-precondition') {
          console.debug("Assessments: Firestore index not yet ready, using fallback");
        } else {
          console.warn("Assessments listener error:", error.code);
        }
        callback([]);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn("assessments query error:", error.code);
    callback([]);
    return () => {};
  }
}

export function watchAllAssessments(callback) {
  const q = query(collection(db, COLLECTIONS.assessments), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export function watchAssessmentsForUserIds(userIds = [], callback) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length === 0) {
    callback([]);
    return () => {};
  }

  const chunks = [];
  for (let index = 0; index < ids.length; index += 10) {
    chunks.push(ids.slice(index, index + 10));
  }

  const cache = new Map();
  const unsubs = chunks.map((chunk, chunkIndex) => {
    const q = query(collection(db, COLLECTIONS.assessments), where("userId", "in", chunk));
    return onSnapshot(q, (snap) => {
      cache.set(
        chunkIndex,
        snap.docs.map((item) => ({ id: item.id, ...item.data() }))
      );
      callback(sortDesc([...cache.values()].flat()));
    });
  });

  return () => unsubs.forEach((unsub) => unsub?.());
}

// Admin-specific functions
export function watchAssessmentsByRiskLevel(riskLevel, callback) {
  const q = query(
    collection(db, COLLECTIONS.assessments),
    where("riskLevel", "==", riskLevel),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export function watchAssessmentsByDateRange(startDate, endDate, callback) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  
  const q = query(
    collection(db, COLLECTIONS.assessments),
    where("createdAt", ">=", start),
    where("createdAt", "<=", end),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export function watchAssessmentsByConcern(concern, callback) {
  const q = query(
    collection(db, COLLECTIONS.assessments),
    where("primaryConcern", "==", concern),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export function watchRecentAssessments(limitCount = 10, callback) {
  const q = query(
    collection(db, COLLECTIONS.assessments),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

// Analytics functions
export function getRiskDistribution(assessments) {
  const distribution = { low: 0, moderate: 0, high: 0 };
  assessments.forEach(assessment => {
    if (distribution[assessment.riskLevel] !== undefined) {
      distribution[assessment.riskLevel]++;
    }
  });
  return distribution;
}

export function getTopConcerns(assessments, limit = 5) {
  const concerns = {};
  assessments.forEach(assessment => {
    if (assessment.primaryConcern) {
      concerns[assessment.primaryConcern] = (concerns[assessment.primaryConcern] || 0) + 1;
    }
  });
  return Object.entries(concerns)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export function getDailyAssessmentCounts(assessments) {
  const dailyCounts = {};
  assessments.forEach(assessment => {
    const date = new Date(assessment.createdAt?.toDate?.() || assessment.createdAt);
    const dateKey = date.toISOString().split('T')[0];
    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
  });
  return Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}
