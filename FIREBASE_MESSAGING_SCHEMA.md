// FIREBASE FIRESTORE SCHEMA FOR REAL-TIME MESSAGING SYSTEM
// ========================================================

/*
COLLECTIONS:
1. conversations/{conversationId}
2. messages/{messageId}
*/

// 1. CONVERSATIONS COLLECTION
// =============================
{
  "conversations": {
    "{conversationId (buildChatId: userId1_userId2)}": {
      "participants": ["userId1", "userId2"],              // Array of 2 user IDs
      "participantRoles": {                               // Roles of participants
        "userId1": "student",
        "userId2": "counsellor"
      },
      "lastMessage": "This is the last message...",       // String
      "lastMessageSenderId": "userId1",                  // String
      "lastMessageTimestamp": "Timestamp",               // Firebase Timestamp
      "createdAt": "Timestamp",                          // Firebase Timestamp
      "updatedAt": "Timestamp"                           // Firebase Timestamp (sorted by this)
    }
  }
}

// 2. MESSAGES COLLECTION (Top-level, not nested)
// =================================================
{
  "messages": {
    "{messageId}": {
      "conversationId": "{conversationId}",              // Reference to conversation
      "senderId": "userId",                             // String
      "senderRole": "student|counsellor|admin",        // String
      "text": "Message content",                        // String
      "isBroadcast": false,                            // Optional boolean
      "createdAt": "Timestamp"                         // Firebase Timestamp
    }
  }
}

// FUNCTIONS REFERENCE
// ====================

/*
1. buildChatId(userId1, userId2)
   → Returns: "userId1_userId2" (sorted)

2. getOrCreateConversation(studentId, counsellorId)
   → Creates conversation if not exists
   → Returns: conversationId

3. watchConversations(userId, callback)
   → Real-time listener for all user's conversations
   → Ordered by updatedAt DESC
   → Returns: unsubscribe function

4. watchConversationMessages(conversationId, callback)
   → Real-time listener for all messages in conversation
   → Ordered by createdAt ASC
   → Returns: unsubscribe function

5. sendMessage(conversationId, text, userId, userRole)
   → Adds message to messages collection
   → Updates conversation's lastMessage & updatedAt
   → Returns: Promise

6. sendBroadcast(text, senderId, senderRole)
   → Creates message with isBroadcast: true
   → Returns: Promise

7. watchAllMessages(callback)
   → Real-time listener for ALL messages
   → Ordered by createdAt ASC
   → Returns: unsubscribe function
*/

// PROFILE COMPLETION LOGIC
// =========================
/*
Required fields for unlock: [name, phone, department, semester, college]
Profile ready threshold: 60% completion

calculateProfileCompletion(profile) → Number (0-100)
isProfileReady(profile) → Boolean (completion >= 60)

Lock Screen appears when profile < 60%
Chat unlocks when profile >= 60%
*/

// ROLE-BASED ACCESS
// ==================
/*
STUDENT:
  - Can see conversations with assigned counsellor
  - Can send/receive messages from counsellor
  - Messages sorted by updatedAt

COUNSELLOR:
  - Can see conversations with assigned students
  - Can send/receive messages from students
  - Can see all their student conversations

ADMIN:
  - Can send direct messages to any user
  - Can send broadcast messages
  - Can access AdminMessaging component
*/

// SCHEMA VALIDATION RULES (firestore.rules)
// ===========================================
/*
allow read on conversations:
  → User must be in participants array

allow write on conversations:
  → Creator must be in participants array

allow read on messages:
  → User must be in corresponding conversation's participants

allow create on messages:
  → senderId must match authenticated user
  → conversationId must exist
  → text must not be empty

allow update on messages:
  → Deny (immutable)

allow delete on messages:
  → Admin only
*/
