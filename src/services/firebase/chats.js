import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  collectionGroup,
} from "firebase/firestore";
import { db } from "../../firebase";
import { COLLECTIONS } from "./collections";
import { ROLES } from "../auth/roleBasedAccess";
import { pushNotification } from "./notifications";

export function buildChatId(userId1, userId2) {
  return [userId1, userId2].sort().join("_");
}

export async function getOrCreateConversation(studentId, counsellorId) {
  if (!studentId || !counsellorId) return null;

  const conversationId = buildChatId(studentId, counsellorId);
  const convRef = doc(db, COLLECTIONS.conversations, conversationId);
  const snapshot = await getDoc(convRef);

  if (!snapshot.exists()) {
    await setDoc(convRef, {
      participants: [studentId, counsellorId],
      participantRoles: { [studentId]: "student", [counsellorId]: "counsellor" },
      lastMessage: "",
      lastMessageSenderId: null,
      lastMessageTimestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  const chatRef = doc(db, COLLECTIONS.chats, conversationId);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      chatId: conversationId,
      studentId,
      counsellorId,
      participants: [studentId, counsellorId],
      lastMessage: "",
      lastMessageSenderId: null,
      isEnabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return conversationId;
}

export function watchConversations(userId, callback) {
  if (!userId) return () => {};

  const q = query(
    collection(db, COLLECTIONS.conversations),
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const conversations = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(conversations);
  });
}

export function watchConversationMessages(conversationId, callback) {
  if (!conversationId) return () => {};

  const q = query(
    collection(db, COLLECTIONS.messages),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
}

export async function sendMessage(conversationId, text, userId, userRole) {
  if (!conversationId || !text?.trim() || !userId) return;

  try {
    const messageRef = collection(db, COLLECTIONS.messages);
    await addDoc(messageRef, {
      conversationId,
      chatId: conversationId,
      senderId: userId,
      senderRole: userRole,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });

    // Get conversation details to find recipient
    const convRef = doc(db, COLLECTIONS.conversations, conversationId);
    const convSnap = await getDoc(convRef);
    const conversation = convSnap.data() || {};
    
    // Get sender details
    const senderRef = doc(db, COLLECTIONS.users, userId);
    const senderSnap = await getDoc(senderRef);
    const senderData = senderSnap.data() || {};
    const senderName = senderData?.name || senderData?.displayName || "Someone";

    // Find recipient (other participant)
    const recipients = conversation?.participants || [];
    const recipientId = recipients.find((id) => id !== userId);

    // Send notification to recipient with role-specific message
    if (recipientId) {
      const roleLabel = userRole === "student" ? "Student" : "Counsellor";
      
      await pushNotification({
        userId: recipientId,
        type: "message",
        title: `💬 New message from ${senderName}`,
        message: `[${roleLabel}] ${text.trim().substring(0, 50)}${text.trim().length > 50 ? "..." : ""}`,
      });
    }

    await updateDoc(doc(db, COLLECTIONS.conversations, conversationId), {
      lastMessage: text.trim(),
      lastMessageSenderId: userId,
      updatedAt: serverTimestamp(),
    });

    await setDoc(
      doc(db, COLLECTIONS.chats, conversationId),
      {
        chatId: conversationId,
        lastMessage: text.trim(),
        lastMessageSenderId: userId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
}

export async function sendBroadcast(text, senderId, senderRole) {
  if (!text?.trim() || !senderId) return;

  try {
    const messageRef = collection(db, COLLECTIONS.messages);
    const docRef = await addDoc(messageRef, {
      conversationId: "broadcast",
      senderId,
      senderRole,
      text: text.trim(),
      isBroadcast: true,
      createdAt: serverTimestamp(),
    });

    // Get sender details
    const senderRef = doc(db, COLLECTIONS.users, senderId);
    const senderSnap = await getDoc(senderRef);
    const senderData = senderSnap.data() || {};
    const senderName = senderData?.name || senderData?.displayName || "Admin";

    // Get all users to notify them
    const usersSnap = await getDocs(collection(db, COLLECTIONS.users));
    const roleLabel = senderRole === "admin" ? "Admin" : "Counsellor";
    
    usersSnap.forEach((userDoc) => {
      const userId = userDoc.id;
      if (userId !== senderId) {
        pushNotification({
          userId,
          type: "broadcast",
          title: `📢 Announcement from ${senderName}`,
          message: `[${roleLabel}] ${text.trim().substring(0, 50)}${text.trim().length > 50 ? "..." : ""}`,
        }).catch((error) => console.error("Failed to send broadcast notification:", error));
      }
    });

    return docRef;
  } catch (error) {
    console.error("Failed to send broadcast:", error);
    throw error;
  }
}

export function watchAllMessages(callback) {
  const q = query(
    collection(db, COLLECTIONS.messages),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
}

export async function ensureChat({ studentId, counsellorId, studentName, counsellorName }) {
  if (!studentId || !counsellorId) return null;

  const chatId = buildChatId(studentId, counsellorId);
  const chatRef = doc(db, COLLECTIONS.chats, chatId);
  const snapshot = await getDoc(chatRef);

  if (!snapshot.exists()) {
    await setDoc(chatRef, {
      chatId,
      studentId,
      counsellorId,
      participants: [studentId, counsellorId],
      participantProfiles: {
        [studentId]: { id: studentId, name: studentName || "Student", role: "student" },
        [counsellorId]: { id: counsellorId, name: counsellorName || "Counsellor", role: "counsellor" },
      },
      lastMessage: "",
      lastMessageSenderId: null,
      isEnabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else if (snapshot.data()?.isEnabled !== true) {
    await updateDoc(chatRef, {
      isEnabled: true,
      updatedAt: serverTimestamp(),
    });
  }

  return chatId;
}

export function watchUserChats(uid, callback) {
  if (!uid) return () => {};
  const q = query(collection(db, COLLECTIONS.chats), where("participants", "array-contains", uid));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((left, right) => {
        const leftValue = typeof left.updatedAt?.toMillis === "function" ? left.updatedAt.toMillis() : 0;
        const rightValue = typeof right.updatedAt?.toMillis === "function" ? right.updatedAt.toMillis() : 0;
        return rightValue - leftValue;
      });
    callback(rows);
  });
}

export function watchChatMessages(chatId, callback) {
  if (!chatId) return () => {};
  const q = query(
    collection(db, COLLECTIONS.chats, chatId, "messages"),
    orderBy("timestamp", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export async function sendChatMessage({ chatId, senderId, text }) {
  if (!chatId || !senderId || !text?.trim()) return;
  const trimmed = text.trim();

  try {
    await addDoc(collection(db, COLLECTIONS.chats, chatId, "messages"), {
      senderId,
      text: trimmed,
      timestamp: serverTimestamp(),
    });

    // Get chat details to find participants
    const chatRef = doc(db, COLLECTIONS.chats, chatId);
    const chatSnap = await getDoc(chatRef);
    const chatData = chatSnap.data() || {};

    // Get sender details
    const senderRef = doc(db, COLLECTIONS.users, senderId);
    const senderSnap = await getDoc(senderRef);
    const senderData = senderSnap.data() || {};
    const senderName = senderData?.name || senderData?.displayName || "Someone";

    // Find recipient (other participant)
    const participants = chatData?.participants || [];
    const recipientId = participants.find((id) => id !== senderId);

    // Determine sender role
    const senderRole = chatData?.participantProfiles?.[senderId]?.role || "user";
    const roleLabel = senderRole === "student" ? "Student" : "Counsellor";

    // Send notification to recipient
    if (recipientId) {
      await pushNotification({
        userId: recipientId,
        type: "message",
        title: `💬 New message from ${senderName}`,
        message: `[${roleLabel}] ${trimmed.substring(0, 50)}${trimmed.length > 50 ? "..." : ""}`,
      });
    }

    await updateDoc(doc(db, COLLECTIONS.chats, chatId), {
      lastMessage: trimmed,
      lastMessageSenderId: senderId,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to send chat message:", error);
    throw error;
  }
}

/**
 * Get the assigned counsellor for a student
 */
export async function getAssignedCounsellor(studentId) {
  if (!studentId) return null;

  try {
    const studentSnap = await getDoc(doc(db, COLLECTIONS.users, studentId));
    
    if (!studentSnap.exists()) {
      console.warn("Student not found:", studentId);
      return null;
    }

    const student = studentSnap.data();
    const counsellorId = student?.assignedCounsellorId;

    if (!counsellorId) {
      console.warn("Student has no assigned counsellor:", studentId);
      return null;
    }

    // Get counsellor details
    const counsellorSnap = await getDoc(doc(db, COLLECTIONS.users, counsellorId));
    
    if (!counsellorSnap.exists()) {
      console.warn("Assigned counsellor not found:", counsellorId);
      return null;
    }

    return {
      id: counsellorSnap.id,
      ...counsellorSnap.data(),
    };
  } catch (error) {
    console.error("Error fetching assigned counsellor:", error);
    return null;
  }
}

/**
 * Get all students assigned to a counsellor
 */
export async function getAssignedStudents(counsellorId) {
  if (!counsellorId) return [];

  try {
    const q = query(
      collection(db, COLLECTIONS.users),
      where("assignedCounsellorId", "==", counsellorId),
      where("role", "==", ROLES.STUDENT)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching assigned students:", error);
    return [];
  }
}

/**
 * Watch assigned students for a counsellor in real-time
 */
export function watchAssignedStudents(counsellorId, callback) {
  if (!counsellorId) return () => {};

  try {
    const q = query(
      collection(db, COLLECTIONS.users),
      where("assignedCounsellorId", "==", counsellorId),
      where("role", "==", ROLES.STUDENT)
    );

    return onSnapshot(q, (snap) => {
      const students = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(students);
    });
  } catch (error) {
    console.error("Error watching assigned students:", error);
    return () => {};
  }
}

/**
 * Get or create a conversation between student and counsellor
 */
export async function getOrCreateStudentCounsellorConversation(studentId, counsellorId) {
  if (!studentId || !counsellorId) return null;

  try {
    const conversationId = buildChatId(studentId, counsellorId);
    const convRef = doc(db, COLLECTIONS.conversations, conversationId);
    const snapshot = await getDoc(convRef);

    if (!snapshot.exists()) {
      // Get both user details
      const [studentSnap, counsellorSnap] = await Promise.all([
        getDoc(doc(db, COLLECTIONS.users, studentId)),
        getDoc(doc(db, COLLECTIONS.users, counsellorId)),
      ]);

      const studentData = studentSnap.data() || {};
      const counsellorData = counsellorSnap.data() || {};

      await setDoc(convRef, {
        participants: [studentId, counsellorId],
        participantRoles: { 
          [studentId]: ROLES.STUDENT, 
          [counsellorId]: ROLES.COUNSELLOR 
        },
        participantNames: {
          [studentId]: studentData.name || "Student",
          [counsellorId]: counsellorData.name || "Counsellor",
        },
        lastMessage: "",
        lastMessageSenderId: null,
        lastMessageTimestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return conversationId;
  } catch (error) {
    console.error("Error in getOrCreateStudentCounsellorConversation:", error);
    return null;
  }
}
