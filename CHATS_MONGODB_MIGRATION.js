/**
 * Chats API Service (MongoDB Backend)
 * 
 * Migrated from Firebase to Express + MongoDB
 * Replaces: src/services/firebase/chats.js
 * 
 * Provides real-time chat functionality with polling
 */

const API_BASE_URL = "http://localhost:3001/api";

// Helper function for API calls
async function apiCall(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      }
    };

    // Add auth token if available
    const token = localStorage.getItem("auth_token");
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// Chat ID generation
// ─────────────────────────────────────────────────────────────

export function buildChatId(studentId, counsellorId) {
  return [studentId, counsellorId].filter(Boolean).join("_");
}

// ─────────────────────────────────────────────────────────────
// MIGRATION FROM FIREBASE
// ─────────────────────────────────────────────────────────────

/**
 * Ensure a chat exists between two users
 * 
 * FIREBASE (OLD):
 *   export async function ensureChat({ studentId, counsellorId, studentName, counsellorName }) {
 *     const chatId = buildChatId(studentId, counsellorId);
 *     const chatRef = doc(db, COLLECTIONS.chats, chatId);
 *     const snapshot = await getDoc(chatRef);
 * 
 *     if (!snapshot.exists()) {
 *       await setDoc(chatRef, {
 *         chatId,
 *         studentId,
 *         counsellorId,
 *         participants: [studentId, counsellorId],
 *         participantProfiles: {
 *           [studentId]: { id: studentId, name: studentName || "Student", role: "student" },
 *           [counsellorId]: { id: counsellorId, name: counsellorName || "Counsellor", role: "counsellor" },
 *         },
 *         lastMessage: "",
 *         lastMessageSenderId: null,
 *         isEnabled: true,
 *         createdAt: serverTimestamp(),
 *         updatedAt: serverTimestamp(),
 *       });
 *     } else if (snapshot.data()?.isEnabled !== true) {
 *       await updateDoc(chatRef, {
 *         isEnabled: true,
 *         updatedAt: serverTimestamp(),
 *       });
 *     }
 *     return chatId;
 *   }
 * 
 * MONGODB (NEW):
 *   POST /api/appointment/chat/ensure
 */
export async function ensureChat({ studentId, counsellorId, studentName, counsellorName }) {
  if (!studentId || !counsellorId) {
    console.error("Missing studentId or counsellorId");
    return null;
  }

  try {
    const chatId = buildChatId(studentId, counsellorId);
    
    const response = await apiCall("/appointment/chat/ensure", "POST", {
      chatId,
      studentId,
      counsellorId,
      studentName: studentName || "Student",
      counsellorName: counsellorName || "Counsellor",
      participants: [studentId, counsellorId],
      participantProfiles: {
        [studentId]: { id: studentId, name: studentName || "Student", role: "student" },
        [counsellorId]: { id: counsellorId, name: counsellorName || "Counsellor", role: "counsellor" },
      },
      lastMessage: "",
      lastMessageSenderId: null,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return response.chatId || chatId;
  } catch (error) {
    console.error("Error ensuring chat:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────

/**
 * Watch user's chats in real-time (polling)
 * 
 * FIREBASE (OLD):
 *   export function watchUserChats(uid, callback) {
 *     if (!uid) return () => {};
 *     const q = query(
 *       collection(db, COLLECTIONS.chats),
 *       where("participants", "array-contains", uid)
 *     );
 *     return onSnapshot(q, (snap) => {
 *       const rows = snap.docs
 *         .map((item) => ({ id: item.id, ...item.data() }))
 *         .sort((left, right) => {
 *           const leftValue = typeof left.updatedAt?.toMillis === "function" ? left.updatedAt.toMillis() : 0;
 *           const rightValue = typeof right.updatedAt?.toMillis === "function" ? right.updatedAt.toMillis() : 0;
 *           return rightValue - leftValue;
 *         });
 *       callback(rows);
 *     });
 *   }
 * 
 * MONGODB (NEW):
 *   GET /api/appointment/chats?userId=uid (with polling)
 */
export function watchUserChats(uid, callback) {
  if (!uid) return () => {};

  // Poll every 3 seconds for new/updated chats
  const pollInterval = setInterval(async () => {
    try {
      const chats = await apiCall(`/appointment/chats?userId=${uid}`);
      
      // Ensure it's an array and sorted
      const items = Array.isArray(chats) ? chats : [];
      const sorted = items.sort((left, right) => {
        const leftTime = new Date(left.updatedAt).getTime() || 0;
        const rightTime = new Date(right.updatedAt).getTime() || 0;
        return rightTime - leftTime;
      });
      
      callback(sorted);
    } catch (error) {
      console.error("Error watching chats:", error);
      // Call with empty array to avoid UI breaking
      callback([]);
    }
  }, 3000); // Poll every 3 seconds

  // Return unsubscribe function
  return () => clearInterval(pollInterval);
}

// ─────────────────────────────────────────────────────────────

/**
 * Watch messages in a specific chat (polling)
 * 
 * FIREBASE (OLD):
 *   export function watchChatMessages(chatId, callback) {
 *     if (!chatId) return () => {};
 *     const q = query(
 *       collection(db, COLLECTIONS.chats, chatId, "messages"),
 *       orderBy("timestamp", "asc")
 *     );
 *     return onSnapshot(q, (snap) => {
 *       callback(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
 *     });
 *   }
 * 
 * MONGODB (NEW):
 *   GET /api/appointment/chats/:chatId/messages (with polling)
 */
export function watchChatMessages(chatId, callback) {
  if (!chatId) return () => {};

  // Poll every 1.5 seconds for new messages (faster for chat)
  const pollInterval = setInterval(async () => {
    try {
      const messages = await apiCall(`/appointment/chats/${chatId}/messages`);
      
      // Ensure it's an array and sorted by timestamp
      const items = Array.isArray(messages) ? messages : [];
      const sorted = items.sort((a, b) => {
        const aTime = new Date(a.timestamp).getTime() || 0;
        const bTime = new Date(b.timestamp).getTime() || 0;
        return aTime - bTime;
      });
      
      callback(sorted);
    } catch (error) {
      console.error("Error watching chat messages:", error);
      callback([]);
    }
  }, 1500); // Poll every 1.5 seconds for faster message updates

  // Return unsubscribe function
  return () => clearInterval(pollInterval);
}

// ─────────────────────────────────────────────────────────────

/**
 * Send a chat message
 * 
 * FIREBASE (OLD):
 *   export async function sendChatMessage({ chatId, senderId, text }) {
 *     if (!chatId || !senderId || !text?.trim()) return;
 *     const trimmed = text.trim();
 * 
 *     await addDoc(collection(db, COLLECTIONS.chats, chatId, "messages"), {
 *       senderId,
 *       text: trimmed,
 *       timestamp: serverTimestamp(),
 *     });
 * 
 *     await updateDoc(doc(db, COLLECTIONS.chats, chatId), {
 *       lastMessage: trimmed,
 *       lastMessageSenderId: senderId,
 *       updatedAt: serverTimestamp(),
 *     });
 *   }
 * 
 * MONGODB (NEW):
 *   POST /api/appointment/chats/:chatId/messages
 */
export async function sendChatMessage({ chatId, senderId, text }) {
  if (!chatId || !senderId || !text?.trim()) {
    console.error("Missing required fields for sendChatMessage");
    return;
  }

  const trimmed = text.trim();

  try {
    // Backend handles both message creation and chat update
    await apiCall(`/appointment/chats/${chatId}/messages`, "POST", {
      senderId,
      text: trimmed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// ADDITIONAL HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Get messages for a chat (one-time fetch)
 * 
 * MONGODB:
 *   GET /api/appointment/chats/:chatId/messages
 */
export async function getChatMessages(chatId) {
  try {
    const messages = await apiCall(`/appointment/chats/${chatId}/messages`);
    return Array.isArray(messages) ? messages : [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
}

/**
 * Get all chats for a user (one-time fetch)
 * 
 * MONGODB:
 *   GET /api/appointment/chats?userId=uid
 */
export async function getUserChats(userId) {
  try {
    const chats = await apiCall(`/appointment/chats?userId=${userId}`);
    return Array.isArray(chats) ? chats : [];
  } catch (error) {
    console.error("Error fetching user chats:", error);
    return [];
  }
}

/**
 * Delete a chat
 * 
 * MONGODB:
 *   DELETE /api/appointment/chats/:chatId
 */
export async function deleteChat(chatId) {
  try {
    await apiCall(`/appointment/chats/${chatId}`, "DELETE");
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
}

/**
 * Delete a message
 * 
 * MONGODB:
 *   DELETE /api/appointment/chats/:chatId/messages/:messageId
 */
export async function deleteMessage(chatId, messageId) {
  try {
    await apiCall(`/appointment/chats/${chatId}/messages/${messageId}`, "DELETE");
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────
// USAGE EXAMPLES
// ─────────────────────────────────────────────────────────────

/*
// In a React component:

import { watchUserChats, watchChatMessages, sendChatMessage } from "@/services/mongodb/chats";

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) return;

    // Start polling user chats
    const unsubscribe = watchUserChats(userId, (data) => {
      setChats(data);
    });

    // Cleanup: stop polling when component unmounts
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!chats[0]?.id) return;

    // Start polling messages for first chat
    const unsubscribe = watchChatMessages(chats[0].id, (data) => {
      setMessages(data);
    });

    return () => unsubscribe();
  }, [chats]);

  const handleSendMessage = async (text) => {
    if (!chats[0]?.id) return;
    await sendChatMessage({
      chatId: chats[0].id,
      senderId: userId,
      text
    });
  };

  return (
    <div>
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id}>{msg.text}</div>
        ))}
      </div>
      <input onSubmit={(text) => handleSendMessage(text)} />
    </div>
  );
}
*/
