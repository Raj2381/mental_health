/**
 * CHAT SERVICE FUNCTIONS - COMPLETE REFERENCE
 * src/services/firebase/chats.js
 * 
 * All functions for real-time messaging system
 */

// ============================================
// 1. buildChatId(userId1, userId2)
// ============================================
/**
 * Creates a standardized conversation ID by sorting userIds
 * 
 * @param {string} userId1 - First user ID
 * @param {string} userId2 - Second user ID
 * @returns {string} Sorted conversation ID "userId1_userId2"
 * 
 * Example:
 *   buildChatId("alice", "bob")     → "alice_bob"
 *   buildChatId("bob", "alice")     → "alice_bob" (same!)
 *   buildChatId("admin1", "alice")  → "admin1_alice"
 */


// ============================================
// 2. getOrCreateConversation(studentId, counsellorId)
// ============================================
/**
 * Gets existing conversation or creates new one
 * Used to initialize a conversation between two users
 * 
 * @param {string} studentId - Student user ID
 * @param {string} counsellorId - Counsellor user ID
 * @returns {Promise<string>} Conversation ID
 * 
 * Firestore Operation:
 *   1. Build conversation ID
 *   2. Check if conversation exists
 *   3. If not, create with:
 *      - participants: [studentId, counsellorId]
 *      - participantRoles: {...}
 *      - lastMessage: ""
 *      - timestamps: createdAt, updatedAt
 * 
 * Example:
 *   const convId = await getOrCreateConversation(
 *     "student123",
 *     "counsellor456"
 *   );
 *   // Returns: "counsellor456_student123"
 */


// ============================================
// 3. watchConversations(userId, callback)
// ============================================
/**
 * Real-time listener for all user's conversations
 * Orders by updatedAt (newest first)
 * 
 * @param {string} userId - User ID to fetch conversations for
 * @param {Function} callback - Called with conversation array
 * @returns {Function} Unsubscribe function
 * 
 * Query:
 *   WHERE participants ARRAY_CONTAINS userId
 *   ORDER BY updatedAt DESC
 * 
 * Callback receives:
 *   [{
 *     id: "convId",
 *     participants: ["userId1", "userId2"],
 *     lastMessage: "...",
 *     updatedAt: Timestamp
 *   }, ...]
 * 
 * Example:
 *   const unsub = watchConversations("user123", (convs) => {
 *     console.log("Conversations:", convs);
 *     // convs[0] is most recent
 *   });
 *   
 *   return () => unsub(); // cleanup
 */


// ============================================
// 4. watchConversationMessages(conversationId, callback)
// ============================================
/**
 * Real-time listener for all messages in a conversation
 * Orders by createdAt (oldest first)
 * 
 * @param {string} conversationId - Conversation ID
 * @param {Function} callback - Called with messages array
 * @returns {Function} Unsubscribe function
 * 
 * Query:
 *   WHERE conversationId == conversationId
 *   ORDER BY createdAt ASC
 * 
 * Callback receives:
 *   [{
 *     id: "msgId",
 *     conversationId: "...",
 *     senderId: "userId",
 *     senderRole: "student|counsellor|admin",
 *     text: "Message content",
 *     createdAt: Timestamp
 *   }, ...]
 * 
 * Example:
 *   const unsub = watchConversationMessages("conv123", (msgs) => {
 *     setMessages(msgs);
 *     // msgs[0] is oldest, msgs[msgs.length-1] is newest
 *   });
 *   
 *   return () => unsub(); // cleanup
 */


// ============================================
// 5. sendMessage(conversationId, text, userId, userRole)
// ============================================
/**
 * Send a message in a conversation
 * Automatically updates lastMessage in conversation
 * 
 * @param {string} conversationId - Conversation ID
 * @param {string} text - Message text
 * @param {string} userId - Sender ID
 * @param {string} userRole - Sender role
 * @returns {Promise<void>}
 * 
 * Operations:
 *   1. Create document in messages collection:
 *      {
 *        conversationId,
 *        senderId: userId,
 *        senderRole: userRole,
 *        text: text.trim(),
 *        createdAt: serverTimestamp()
 *      }
 *   2. Update conversation:
 *      {
 *        lastMessage: text.trim(),
 *        lastMessageSenderId: userId,
 *        updatedAt: serverTimestamp()
 *      }
 * 
 * Example:
 *   await sendMessage(
 *     "conv123",
 *     "Hello!",
 *     "user456",
 *     "student"
 *   );
 */


// ============================================
// 6. sendBroadcast(text, senderId, senderRole)
// ============================================
/**
 * Send a message visible to all users
 * Creates message with conversationId: "broadcast"
 * 
 * @param {string} text - Broadcast message text
 * @param {string} senderId - Admin ID
 * @param {string} senderRole - Should be "admin"
 * @returns {Promise<void>}
 * 
 * Operations:
 *   Create document in messages collection:
 *     {
 *       conversationId: "broadcast",
 *       senderId: senderId,
 *       senderRole: senderRole,
 *       text: text.trim(),
 *       isBroadcast: true,
 *       createdAt: serverTimestamp()
 *     }
 * 
 * Example:
 *   await sendBroadcast(
 *     "Important: System maintenance on Sunday",
 *     "admin123",
 *     "admin"
 *   );
 */


// ============================================
// 7. watchAllMessages(callback)
// ============================================
/**
 * Real-time listener for ALL messages in system
 * Useful for monitoring/analytics
 * 
 * @param {Function} callback - Called with all messages array
 * @returns {Function} Unsubscribe function
 * 
 * Query:
 *   All messages
 *   ORDER BY createdAt ASC
 * 
 * Callback receives: [all messages in system]
 * 
 * ⚠️ Use with caution - can be expensive on large systems
 * 
 * Example:
 *   const unsub = watchAllMessages((msgs) => {
 *     console.log("Total messages:", msgs.length);
 *   });
 */


// ============================================
// LEGACY FUNCTIONS (Backward compatible)
// ============================================

/**
 * ensureChat(params)
 * @deprecated - Use getOrCreateConversation instead
 * 
 * Still available for backward compatibility
 * Creates chat in old "chats" collection
 */

/**
 * watchUserChats(uid, callback)
 * @deprecated - Use watchConversations instead
 */

/**
 * watchChatMessages(chatId, callback)
 * @deprecated - Use watchConversationMessages instead
 */

/**
 * sendChatMessage(params)
 * @deprecated - Use sendMessage instead
 */


// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * EXAMPLE 1: Student-Counsellor Messaging
 */
async function setupStudentMessaging(studentId, counsellorId) {
  // Get/create conversation
  const convId = await getOrCreateConversation(studentId, counsellorId);
  
  // Watch conversations (sidebar)
  const unsub1 = watchConversations(studentId, (convs) => {
    console.log("My conversations:", convs);
    // Update sidebar with conversation list
  });
  
  // Watch messages in selected conversation
  const unsub2 = watchConversationMessages(convId, (msgs) => {
    console.log("Messages:", msgs);
    // Update chat with messages
  });
  
  // Send message
  await sendMessage(convId, "Hi!", studentId, "student");
  
  // Cleanup
  return () => {
    unsub1();
    unsub2();
  };
}


/**
 * EXAMPLE 2: Admin Messaging User
 */
async function adminMessageUser(adminId, userId) {
  // Create conversation with user
  const convId = await getOrCreateConversation(userId, adminId);
  
  // Watch messages
  const unsub = watchConversationMessages(convId, (msgs) => {
    console.log("Chat history:", msgs);
  });
  
  // Admin sends message
  await sendMessage(convId, "Your account has been verified", adminId, "admin");
  
  return unsub;
}


/**
 * EXAMPLE 3: Admin Broadcast
 */
async function broadcastAnnouncement(adminId, message) {
  // Send broadcast
  await sendBroadcast(
    message,
    adminId,
    "admin"
  );
  
  // All users can query messages with:
  // WHERE conversationId == "broadcast"
  // ORDER BY createdAt DESC
}


/**
 * EXAMPLE 4: React Component Usage
 */
function StudentMessagesComponent() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState("");
  const [currentUser] = useState(getCurrentUser());
  
  // Watch conversations on mount
  useEffect(() => {
    if (!currentUser) return;
    
    const unsub = watchConversations(currentUser.id, setConversations);
    
    return () => unsub();
  }, [currentUser]);
  
  // Watch messages when conversation changes
  useEffect(() => {
    if (!selectedConvId) return;
    
    const unsub = watchConversationMessages(selectedConvId, setMessages);
    
    return () => unsub();
  }, [selectedConvId]);
  
  // Send message handler
  const handleSend = async (text) => {
    await sendMessage(
      selectedConvId,
      text,
      currentUser.id,
      currentUser.role
    );
  };
  
  // Render UI with conversations and messages
  return (
    <div>
      {/* Conversations list */}
      {conversations.map(conv => (
        <button onClick={() => setSelectedConvId(conv.id)}>
          {conv.lastMessage}
        </button>
      ))}
      
      {/* Messages */}
      {messages.map(msg => (
        <div>{msg.text}</div>
      ))}
      
      {/* Send form */}
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSend(e.target.message.value);
      }}>
        <input name="message" />
        <button>Send</button>
      </form>
    </div>
  );
}


// ============================================
// FIRESTORE RULES (for security)
// ============================================

/**
 * Apply these rules in Firestore:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     
 *     // Conversations
 *     match /conversations/{conversationId} {
 *       allow read: if request.auth.uid in resource.data.participants;
 *       allow create: if request.auth.uid in request.resource.data.participants;
 *       allow update: if request.auth.uid in resource.data.participants;
 *     }
 *     
 *     // Messages
 *     match /messages/{messageId} {
 *       allow read: if 
 *         exists(/databases/$(database)/documents/conversations/$(resource.data.conversationId))
 *         && request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
 *       
 *       allow create: if 
 *         request.auth.uid == request.resource.data.senderId &&
 *         exists(/databases/$(database)/documents/conversations/$(request.resource.data.conversationId));
 *     }
 *   }
 * }
 */
