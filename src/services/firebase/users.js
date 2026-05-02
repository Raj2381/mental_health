import {
  collection,
  doc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS } from "./collections";

function normalizeRole(value) {
  const role = String(value || "student").toLowerCase();
  if (role === "admin" || role === "counsellor" || role === "student") return role;
  return "student";
}

export function getDefaultUserDocument({
  uid,
  name,
  email,
  role = "student",
  photoURL = "",
} = {}) {
  const normalizedRole = normalizeRole(role);

  return {
    uid: uid || "",
    name: name || "User",
    email: email || "",
    role: normalizedRole,
    photoURL: photoURL || "",
    profileImage: photoURL || "",
    riskScore: 0,
    riskLevel: "Low",
    assignedCounsellorId: "",
    dailyProgress: {
      percent: 0,
      completedTasks: [],
      date: new Date().toISOString().slice(0, 10),
    },
    weeklyStats: [],
    profile: {
      name: name || "User",
      email: email || "",
      phone: "",
      college: "",
      department: "",
      specialization: "",
      experience: "",
      bio: "",
      photoURL: photoURL || "",
      profileImage: photoURL || "",
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export async function ensureUserDocument(uid, payload = {}) {
  if (!uid) return;

  const base = getDefaultUserDocument({
    uid,
    name: payload?.name,
    email: payload?.email,
    role: payload?.role,
    photoURL: payload?.photoURL || payload?.profileImage,
  });

  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    {
      ...base,
      ...payload,
      profile: {
        ...base.profile,
        ...(payload?.profile || {}),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function normalizeDateKey(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) return "";
  return asDate.toISOString().slice(0, 10);
}

function diffDaysByKey(todayKey, lastKey) {
  if (!todayKey || !lastKey) return Number.POSITIVE_INFINITY;
  const today = new Date(`${todayKey}T00:00:00Z`).getTime();
  const last = new Date(`${lastKey}T00:00:00Z`).getTime();
  if (Number.isNaN(today) || Number.isNaN(last)) return Number.POSITIVE_INFINITY;
  return Math.floor((today - last) / 86400000);
}

export function computeNextStreak(user = {}, todayKey = new Date().toISOString().slice(0, 10)) {
  const last = normalizeDateKey(user?.lastActiveDate);
  const previous = Number(user?.streak || 0);

  if (!last) return 1;
  const diff = diffDaysByKey(todayKey, last);
  if (diff === 0) return previous > 0 ? previous : 1;
  if (diff === 1) return Math.max(1, previous + 1);
  return 1;
}

export async function updateUserStreak(uid, todayKey = new Date().toISOString().slice(0, 10)) {
  if (!uid) return { streak: 1, lastActiveDate: todayKey };

  const ref = doc(db, COLLECTIONS.users, uid);
  const snap = await getDoc(ref);
  const data = snap.exists() ? snap.data() : {};
  console.log("Streak before:", Number(data?.streak || 0), "lastActiveDate:", data?.lastActiveDate || null);
  const nextStreak = computeNextStreak(data, todayKey);
  console.log("Streak after:", nextStreak, "today:", todayKey);

  await setDoc(
    ref,
    {
      streak: nextStreak,
      lastActiveDate: todayKey,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { streak: nextStreak, lastActiveDate: todayKey };
}

export function watchCurrentUser(uid, callback) {
  if (!uid) return () => {};
  return onSnapshot(doc(db, COLLECTIONS.users, uid), (snap) => {
    const data = snap.exists() ? { id: snap.id, ...snap.data() } : null;
    console.log("🔥 FIREBASE DATA:", data);
    callback(data);
  });
}

export function watchUsersByRole(role, callback) {
  const q = query(collection(db, COLLECTIONS.users), where("role", "==", role));
  return onSnapshot(q, (snap) => {
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("🔥 FIREBASE DATA:", users);
    callback(users);
  });
}

export async function saveUserProfile(uid, payload = {}) {
  if (!uid) return;

  const profilePayload = payload?.profile ? payload.profile : payload;
  const topLevelRole = payload?.role;

  const normalizedName = String(profilePayload?.name || payload?.name || "").trim();
  const normalizedEmail = String(profilePayload?.email || payload?.email || "").trim();
  const normalizedPhoto =
    profilePayload?.photoURL ||
    profilePayload?.profileImage ||
    payload?.photoURL ||
    payload?.profileImage ||
    "";

  const writeData = {
    ...(normalizedName ? { name: normalizedName } : {}),
    ...(normalizedEmail ? { email: normalizedEmail } : {}),
    ...(normalizedPhoto ? { photoURL: normalizedPhoto, profileImage: normalizedPhoto } : {}),
    profile: {
      ...(profilePayload || {}),
      ...(normalizedName ? { name: normalizedName } : {}),
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      ...(normalizedPhoto ? { photoURL: normalizedPhoto, profileImage: normalizedPhoto } : {}),
      specialization: String(
        profilePayload?.specialization || payload?.specialization || ""
      ),
      experience:
        profilePayload?.experience ||
        profilePayload?.experienceYears ||
        payload?.experience ||
        payload?.experienceYears ||
        "",
    },
    updatedAt: serverTimestamp(),
  };

  if (topLevelRole) {
    writeData.role = topLevelRole;
  }

  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    writeData,
    { merge: true }
  );
}

export async function saveUserImageUrl(uid, imageUrl) {
  if (!uid) return;

  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    {
      photoURL: imageUrl,
      profile: {
        photoURL: imageUrl,
        profileImage: imageUrl,
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveRiskSummary(uid, payload = {}) {
  if (!uid) return;

  await setDoc(
    doc(db, COLLECTIONS.users, uid),
    {
      riskScore: Number(payload?.riskScore || 0),
      riskLevel: String(payload?.riskLevel || "Low"),
      lastAssessment: payload?.lastAssessment || serverTimestamp(),
      latestAssessment: payload?.latestAssessment || null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveCounsellorProfile(uid, payload = {}) {
  if (!uid) return;

  const specialization = String(payload?.specialization || "").trim();
  const experience = String(
    payload?.experience || payload?.experienceYears || ""
  ).trim();
  const bio = String(payload?.bio || "").trim();

  await updateDoc(doc(db, COLLECTIONS.users, uid), {
    "profile.specialization": specialization,
    "profile.experience": experience,
    "profile.experienceYears": experience,
    "profile.bio": bio,
    updatedAt: serverTimestamp(),
  });
}

export function watchAllUsers(callback) {
  return onSnapshot(collection(db, COLLECTIONS.users), (snap) => {
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log("🔥 FIREBASE DATA:", users);
    callback(users);
  });
}

export function watchAssignedStudents(counsellorId, callback) {
  if (!counsellorId) {
    callback([]);
    return () => {};
  }

  // Watch all students (assigned + unlinked)
  const q = query(
    collection(db, COLLECTIONS.users),
    where("role", "==", "student")
  );

  return onSnapshot(q, async (snap) => {
    const students = snap.docs
      .map((d) => {
        const data = d.data() || {};
        const latest = data?.latestAssessment || {};
        const stress = latest?.stressBreakdown || latest?.categoryScores || {};
        const isAssigned = String(data?.assignedCounsellorId || "") === counsellorId;

        return {
          id: d.id,
          ...data,
          assessmentScore: Number(data?.riskScore ?? latest?.score ?? 0),
          assessmentLevel: String(data?.riskLevel ?? latest?.riskLevel ?? "Low"),
          primaryConcern: latest?.primaryConcern || "general",
          stressBreakdown: {
            academic: Number(stress?.academic ?? stress?.academicStress ?? 0),
            emotional: Number(stress?.emotional ?? stress?.emotionalWellbeing ?? 0),
            social: Number(stress?.social ?? stress?.socialConnection ?? 0),
            sleep: Number(stress?.sleep ?? stress?.sleepQuality ?? 0),
          },
          isAssigned,
        };
      })
      .filter((student) => {
        // Show assigned students OR unlinked students (those without a counsellor)
        const isAssigned = student.isAssigned;
        const isUnlinked = !String(student?.assignedCounsellorId || "").trim();
        return isAssigned || isUnlinked;
      });

    console.log("🔥 STUDENTS:", students);
    console.log("🔥 FIREBASE DATA:", students);
    callback(students);
  });
}

export async function forceLinkStudentToCounsellor(studentId, counsellorId) {
  if (!studentId || !counsellorId) return;

  await updateDoc(doc(db, COLLECTIONS.users, studentId), {
    assignedCounsellorId: counsellorId,
    updatedAt: serverTimestamp(),
  });
}

// Auto-assign counsellor to newly created student
export async function autoAssignCounsellor(studentId) {
  if (!studentId) return null;

  try {
    // Get all active counsellors
    const counsellorQuery = query(
      collection(db, COLLECTIONS.users),
      where("role", "==", "counsellor")
    );
    const counsellorSnap = await getDocs(counsellorQuery);
    const counsellors = counsellorSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (counsellors.length === 0) {
      console.warn("[autoAssignCounsellor] No counsellors available");
      return null;
    }

    // Assign random counsellor (or use load-balancing logic)
    const assignedCounsellor = counsellors[Math.floor(Math.random() * counsellors.length)];
    
    // Update student record with assigned counsellor
    await updateDoc(doc(db, COLLECTIONS.users, studentId), {
      assignedCounsellorId: assignedCounsellor.id,
      assignedCounsellorName: assignedCounsellor.name || "Counsellor",
      assignedAt: serverTimestamp(),
    });

    console.log(
      `[autoAssignCounsellor] Student ${studentId} assigned to counsellor ${assignedCounsellor.id} (${assignedCounsellor.name})`
    );

    return assignedCounsellor;
  } catch (error) {
    console.error("[autoAssignCounsellor] Error:", error);
    return null;
  }
}

export async function assignUnlinkedStudentsToCounsellor(counsellorId) {
  if (!counsellorId) return 0;

  const usersSnap = await getDocs(
    query(collection(db, COLLECTIONS.users), where("role", "==", "student"))
  );

  const unlinkedStudents = usersSnap.docs.filter((item) => {
    const data = item.data() || {};
    return !String(data.assignedCounsellorId || "").trim();
  });

  await Promise.all(
    unlinkedStudents.map((item) =>
      updateDoc(doc(db, COLLECTIONS.users, item.id), {
        assignedCounsellorId: counsellorId,
        updatedAt: serverTimestamp(),
      })
    )
  );

  console.log("✅ Students linked to counsellor", {
    counsellorId,
    linkedCount: unlinkedStudents.length,
  });

  return unlinkedStudents.length;
}
