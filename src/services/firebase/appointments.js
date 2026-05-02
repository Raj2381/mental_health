import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS } from "./collections";
import { ensureChat } from "./chats";
import { pushNotification } from "./notifications";

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

export async function createAppointment({
  studentId,
  counsellorId,
  studentName,
  counsellorName,
  message,
  date,
  time,
  mode,
  initiatedBy = "counselor",
}) {
  const appointment = await addDoc(collection(db, COLLECTIONS.appointments), {
    studentId,
    counsellorId,
    studentName: studentName || "Student",
    counsellorName: counsellorName || "Counsellor",
    message: message || "General support request",
    date,
    time,
    mode: mode === "offline" ? "offline" : "online",
    status: "pending",
    initiatedBy: initiatedBy || "counselor",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, COLLECTIONS.studentData, studentId),
    {
      accessibleCounsellorIds: arrayUnion(counsellorId),
      lastUpdated: serverTimestamp(),
    },
    { merge: true }
  );

  if (initiatedBy === "counselor") {
    // Counselor-initiated: Counselor sent the request
    await pushNotification({
      userId: counsellorId,
      type: "booking",
      title: "📤 Session Scheduled",
      message: `You scheduled a session with ${studentName || "student"} for ${date} at ${time}. Awaiting student confirmation.`,
    });

    // Student receives request from counselor
    await pushNotification({
      userId: studentId,
      type: "booking",
      title: "📅 New Session Request",
      message: `${counsellorName || "Your counsellor"} has scheduled a session for ${date} at ${time}. Please confirm or decline.`,
    });
  } else {
    // Student-initiated: Student requested the session
    await pushNotification({
      userId: counsellorId,
      type: "booking",
      title: "🆕 Booking Request",
      message: `${studentName || "Student"} requested a session for ${date} at ${time}. Please accept or decline.`,
    });

    // Student confirmation
    await pushNotification({
      userId: studentId,
      type: "booking",
      title: "✅ Request Submitted",
      message: `Your session request with ${counsellorName || "counsellor"} for ${date} at ${time} has been sent. Awaiting confirmation.`,
    });
  }

  return appointment;
}

export async function updateAppointmentStatus(id, status) {
  if (!id || !status) {
    console.error("updateAppointmentStatus: id and status are required");
    return;
  }

  const appointmentRef = doc(db, COLLECTIONS.appointments, id);
  
  try {
    const appointmentSnapshot = await getDoc(appointmentRef);
    const appointment = appointmentSnapshot.exists() ? appointmentSnapshot.data() : null;

    // Update status
    await updateDoc(appointmentRef, {
      status: String(status).toLowerCase(),
      updatedAt: serverTimestamp(),
    });

    console.log(`Appointment ${id} status updated to ${status}`);

    if (!appointment) return;

    if (status === "accepted") {
      const chatId = await ensureChat({
        studentId: appointment.studentId,
        counsellorId: appointment.counsellorId,
        studentName: appointment.studentName,
        counsellorName: appointment.counsellorName,
      });

      await pushNotification({
        userId: appointment.studentId,
        type: "booking",
        title: "✅ Session Confirmed",
        message: `Great! Your session with ${appointment.counsellorName || "your counsellor"} is confirmed for ${appointment.date} at ${appointment.time}. Chat is now available.`,
      });

      await pushNotification({
        userId: appointment.counsellorId,
        type: "booking",
        title: "👤 Student Confirmed",
        message: `${appointment.studentName || "The student"} confirmed the session for ${appointment.date} at ${appointment.time}. Ready to begin!`,
      });

      await updateDoc(appointmentRef, {
        chatId,
        status: "accepted",
        updatedAt: serverTimestamp(),
      });
    }

    if (status === "rejected") {
      await pushNotification({
        userId: appointment.studentId,
        type: "booking",
        title: "❌ Session Declined",
        message: `You declined the session request for ${appointment.date} at ${appointment.time}.`,
      });

      await pushNotification({
        userId: appointment.counsellorId,
        type: "booking",
        title: "⚠️ Request Declined",
        message: `${appointment.studentName || "The student"} declined your session request for ${appointment.date} at ${appointment.time}.`,
      });
    }

    if (status === "completed") {
      await pushNotification({
        userId: appointment.studentId,
        type: "booking",
        title: "🎯 Session Complete",
        message: `Thank you! Your session with ${appointment.counsellorName || "your counsellor"} on ${appointment.date} has been completed.`,
      });

      await pushNotification({
        userId: appointment.counsellorId,
        type: "booking",
        title: "✓ Session Recorded",
        message: `Session with ${appointment.studentName || "student"} on ${appointment.date} has been marked as complete.`,
      });
    }
  } catch (error) {
    console.error("Failed to update appointment status:", error);
    throw error;
  }
}

export function watchCounsellorAppointments(counsellorId, callback) {
  if (!counsellorId) return () => {};
  const q = query(
    collection(db, COLLECTIONS.appointments),
    where("counsellorId", "==", counsellorId)
  );
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(sortByCreatedAtDesc(rows));
  });
}

export function watchStudentAppointments(studentId, callback) {
  if (!studentId) return () => {};
  const q = query(
    collection(db, COLLECTIONS.appointments),
    where("studentId", "==", studentId)
  );
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(sortByCreatedAtDesc(rows));
  });
}

export function watchAllAppointments(callback) {
  const q = query(collection(db, COLLECTIONS.appointments), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
