import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS } from "./collections";

export function watchStudent(uid, callback) {
  if (!uid) return () => {};
  return onSnapshot(doc(db, COLLECTIONS.studentData, uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export function watchAllStudents(callback) {
  return onSnapshot(collection(db, COLLECTIONS.studentData), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// Fetch students assigned to a counsellor from users collection
export function watchAssignedStudents(counsellorId, callback) {
  if (!counsellorId) return () => {};
  const q = query(
    collection(db, COLLECTIONS.users),
    where("role", "==", "student"),
    where("assignedCounsellorId", "==", counsellorId)
  );
  return onSnapshot(q, (snap) => {
    const students = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`[watchAssignedStudents] Found ${students.length} students assigned to counsellor ${counsellorId}`, students);
    callback(students);
  });
}

// Fetch all students from users collection (for total count)
export function watchAllStudentsFromUsers(callback) {
  const q = query(
    collection(db, COLLECTIONS.users),
    where("role", "==", "student")
  );
  return onSnapshot(q, (snap) => {
    const students = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(`[watchAllStudentsFromUsers] Found ${students.length} total students`, students);
    callback(students);
  });
}
