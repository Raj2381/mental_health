import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const CATEGORY_TO_SPECIALIZATION = {
  academicStress: "Academic Stress",
  emotionalWellbeing: "Emotional Health",
  anxietyStress: "Emotional Health",
  socialConnection: "Social Wellbeing",
  sleepQuality: "Sleep & Lifestyle",
};

export function getPrimaryConcernKey(categoryScores = {}) {
  const entries = Object.entries(categoryScores).filter(([, value]) =>
    Number.isFinite(Number(value))
  );

  if (entries.length === 0) return "academicStress";

  entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  return entries[0][0];
}

export function getSpecializationForConcern(concernKey) {
  return CATEGORY_TO_SPECIALIZATION[concernKey] || "Emotional Health";
}

export async function findMatchingCounsellor(categoryScores = {}) {
  const primaryConcernKey = getPrimaryConcernKey(categoryScores);
  const specialization = getSpecializationForConcern(primaryConcernKey);

  let counsellorCandidates = [];

  const specializedUsers = await getDocs(
    query(
      collection(db, "users"),
      where("role", "==", "counsellor"),
      where("profile.specialization", "==", specialization)
    )
  );

  if (!specializedUsers.empty) {
    counsellorCandidates = specializedUsers.docs;
  } else {
    const allCounsellors = await getDocs(
      query(collection(db, "users"), where("role", "==", "counsellor"))
    );
    counsellorCandidates = allCounsellors.docs;
  }

  if (counsellorCandidates.length === 0) {
    return {
      primaryConcernKey,
      specialization,
      assignedCounsellor: null,
    };
  }

  let selectedCounsellorDoc = counsellorCandidates[0];
  let minAssignedCount = Number.MAX_SAFE_INTEGER;

  for (const candidate of counsellorCandidates) {
    const assignedStudentsSnap = await getDocs(
      query(collection(db, "users"), where("assignedCounsellorId", "==", candidate.id))
    );
    const count = assignedStudentsSnap.docs.filter(
      (studentDoc) => String(studentDoc.data()?.role || "").toLowerCase() === "student"
    ).length;

    if (count < minAssignedCount) {
      minAssignedCount = count;
      selectedCounsellorDoc = candidate;
    }
  }

  const counsellorData = selectedCounsellorDoc.data() || {};

  return {
    primaryConcernKey,
    specialization,
    assignedCounsellor: {
      id: selectedCounsellorDoc.id,
      name: counsellorData?.name || counsellorData?.profile?.name || "Assigned Counsellor",
      phone: counsellorData?.profile?.phone || counsellorData?.phone || "Not available",
      email: counsellorData?.email || "",
      specialization: counsellorData?.profile?.specialization || specialization,
    },
  };
}
