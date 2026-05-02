import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS } from "./collections";

function sortSubjects(rows) {
  return [...rows].sort((left, right) =>
    String(left.subjectName || left.subject || "").localeCompare(String(right.subjectName || right.subject || ""))
  );
}

function normalizeAttendanceRow(item) {
  return {
    ...item,
    subjectName: item.subjectName || item.subject || "",
    subject: item.subject || item.subjectName || "",
    attendedClasses: Math.max(0, Number(item.attendedClasses || 0)),
    totalClasses: Math.max(0, Number(item.totalClasses || 0)),
    percentage: Number(item.percentage || 0),
    isInitialized: Boolean(item.isInitialized),
  };
}

export function calculatePercentage(attendedClasses = 0, totalClasses = 0) {
  const attended = Math.max(0, Number(attendedClasses || 0));
  const total = Math.max(0, Number(totalClasses || 0));
  if (!total) return 0;
  return Number(((attended / total) * 100).toFixed(1));
}

export function watchUserAttendance(userId, callback) {
  if (!userId) return () => {};
  const q = query(collection(db, COLLECTIONS.attendance), where("userId", "==", userId));
  return onSnapshot(q, (snap) => {
    callback(sortSubjects(snap.docs.map((item) => normalizeAttendanceRow({ id: item.id, ...item.data() }))));
  });
}

export async function addSubjectWithInitialData(userId, payload = {}) {
  const cleanSubjectName = String(payload.subjectName || payload.subject || "").trim();
  if (!userId || !cleanSubjectName) return false;
  
  const attendedClasses = Math.max(0, Number(payload.attendedClasses || 0));
  const totalClasses = Math.max(attendedClasses, Number(payload.totalClasses || 0));
  const subjectKey = cleanSubjectName.toLowerCase().replace(/\s+/g, "-");
  
  try {
    await setDoc(
      doc(db, COLLECTIONS.attendance, `${userId}_${subjectKey}`),
      {
        userId,
        subjectName: cleanSubjectName,
        subject: cleanSubjectName,
        attendedClasses,
        totalClasses,
        percentage: calculatePercentage(attendedClasses, totalClasses),
        isInitialized: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Error adding subject:", error);
    throw error;
  }
}

export async function markAttendance(subjectId, type) {
  if (!subjectId || !["attended", "missed"].includes(type)) return;

  await runTransaction(db, async (transaction) => {
    const subjectRef = doc(db, COLLECTIONS.attendance, subjectId);
    const snap = await transaction.get(subjectRef);
    if (!snap.exists()) return;

    const current = normalizeAttendanceRow(snap.data());
    if (!current.isInitialized) return;
    const attendedIncrement = type === "attended" ? 1 : 0;
    const nextAttended = Math.max(0, current.attendedClasses + attendedIncrement);
    const nextTotal = Math.max(nextAttended, current.totalClasses + 1);

    transaction.set(
      subjectRef,
      {
        attendedClasses: nextAttended,
        totalClasses: nextTotal,
        percentage: calculatePercentage(nextAttended, nextTotal),
        isInitialized: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
}

/**
 * Update attendance for a specific subject
 * This is an alias for markAttendance with better naming
 */
export async function updateAttendanceClass(userId, subjectId, type) {
  if (!subjectId || !["attended", "missed"].includes(type)) {
    throw new Error("Invalid subject ID or attendance type");
  }
  return markAttendance(subjectId, type);
}

export async function saveAttendanceSubject(userId, subjectPayload) {
  const subjectName = String(subjectPayload?.subjectName || subjectPayload?.subject || "").trim();
  if (!userId || !subjectName) return false;
  
  const attendedClasses = Math.max(0, Number(subjectPayload.attendedClasses || 0));
  const totalClasses = Math.max(attendedClasses, Number(subjectPayload.totalClasses || 0));
  const subjectKey = subjectName.toLowerCase().replace(/\s+/g, "-");

  try {
    await setDoc(
      doc(db, COLLECTIONS.attendance, `${userId}_${subjectKey}`),
      {
        userId,
        subjectName,
        subject: subjectName,
        attendedClasses,
        totalClasses,
        percentage: calculatePercentage(attendedClasses, totalClasses),
        isInitialized: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error("Error saving attendance subject:", error);
    throw error;
  }
}
