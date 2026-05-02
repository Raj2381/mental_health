import { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Send, MessageSquare, Loader, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { getCurrentUser } from "../services/auth";
import {
  watchConversations,
  watchConversationMessages,
  sendMessage,
  getAssignedCounsellor,
  getOrCreateStudentCounsellorConversation,
  watchAssignedStudents,
} from "../services/firebase/chats";
import { ROLES } from "../services/auth/roleBasedAccess";
import DashboardCard from "../components/dashboard/DashboardCard";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [selectedConvId, setSelectedConvId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectingWithCounsellor, setConnectingWithCounsellor] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize user
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // For students: Watch conversations
  // For counsellors: Watch assigned students
  useEffect(() => {
    if (!currentUser?.id) return;

    if (currentUser.role === ROLES.STUDENT) {
      // Students watch their conversations
      const unsubscribe = watchConversations(currentUser.id, (convs) => {
        setConversations(convs);
        if (!selectedConvId && convs.length > 0) {
          setSelectedConvId(convs[0].id);
          const otherParticipantId = convs[0].participants.find(
            (p) => p !== currentUser.id
          );
          setSelectedParticipantId(otherParticipantId);
        }
      });

      return () => unsubscribe();
    } else if (currentUser.role === ROLES.COUNSELLOR) {
      // Counsellors watch their assigned students
      const unsubscribe = watchAssignedStudents(currentUser.id, (students) => {
        setAssignedStudents(students);
      });

      return () => unsubscribe();
    }
  }, [currentUser?.id, selectedConvId]);

  // Watch messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }

    const unsubscribe = watchConversationMessages(selectedConvId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedConvId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConvId),
    [conversations, selectedConvId]
  );

  const otherParticipantName = useMemo(() => {
    if (!selectedConversation || !currentUser) return null;
    return selectedConversation.participantNames?.[selectedParticipantId] || selectedParticipantId;
  }, [selectedConversation, selectedParticipantId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !selectedConvId || !currentUser || loading) return;

    setLoading(true);
    try {
      await sendMessage(
        selectedConvId,
        draft.trim(),
        currentUser.id,
        currentUser.role
      );
      setDraft("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChatWithStudent = async (studentId, studentName) => {
    if (!currentUser?.id) return;

    setConnectingWithCounsellor(true);
    try {
      console.log("Starting conversation with student:", studentId);
      const convId = await getOrCreateStudentCounsellorConversation(
        studentId,
        currentUser.id
      );

      if (convId) {
        setSelectedConvId(convId);
        setSelectedParticipantId(studentId);
        toast.success(`Connected with ${studentName}`);
      } else {
        toast.error("Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Error starting conversation");
    } finally {
      setConnectingWithCounsellor(false);
    }
  };

  const handleConnectWithCounsellor = async () => {
    if (!currentUser?.id) return;

    setConnectingWithCounsellor(true);
    try {
      console.log("Fetching assigned counsellor for student:", currentUser.id);
      const counsellor = await getAssignedCounsellor(currentUser.id);

      if (!counsellor?.id) {
        toast.error("You haven't been assigned a counsellor yet. Please contact admin.");
        return;
      }

      const convId = await getOrCreateStudentCounsellorConversation(
        currentUser.id,
        counsellor.id
      );

      if (convId) {
        setSelectedConvId(convId);
        setSelectedParticipantId(counsellor.id);
        toast.success(`Connected with ${counsellor.name}`);
      } else {
        toast.error("Failed to connect with counsellor");
      }
    } catch (error) {
      console.error("Error connecting with counsellor:", error);
      toast.error("Failed to connect with counsellor");
    } finally {
      setConnectingWithCounsellor(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentUser.role === ROLES.STUDENT ? (
        // STUDENT VIEW
        <div className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-3">
          {/* Counsellor Card */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <DashboardCard className="p-6 h-full" glow="from-blue-500/12 via-violet-500/8 to-teal-500/10">
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Your Counsellor</h2>
                {conversations.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                    <AlertCircle className="h-10 w-10 text-amber-400 mb-3" />
                    <p className="text-sm text-slate-600 mb-4">
                      {connectingWithCounsellor ? "Connecting..." : "Not connected yet"}
                    </p>
                    {!connectingWithCounsellor && (
                      <button
                        onClick={handleConnectWithCounsellor}
                        className="mt-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Connect with Counsellor
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {conversations.map((conv) => {
                      const otherUserId = conv.participants.find(
                        (p) => p !== currentUser.id
                      );
                      const name = conv.participantNames?.[otherUserId] || "Counsellor";
                      return (
                        <div
                          key={conv.id}
                          className="rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 p-4 border border-blue-100"
                        >
                          <h3 className="font-semibold text-slate-900 text-sm">{name}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {conv.lastMessage || "Start your first message"}
                          </p>
                          <button
                            onClick={() => {
                              setSelectedConvId(conv.id);
                              setSelectedParticipantId(otherUserId);
                            }}
                            className={`mt-3 w-full rounded py-2 text-xs font-semibold transition ${
                              selectedConvId === conv.id
                                ? "bg-blue-600 text-white"
                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }`}
                          >
                            {selectedConvId === conv.id ? "Active" : "Open Chat"}
                          </button>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </DashboardCard>
          </Motion.div>

          {/* Chat Area */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg h-[calc(100vh-8rem)]">
              {selectedConvId ? (
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-100 px-6 py-4">
                    <h3 className="text-lg font-bold text-slate-900">
                      {otherParticipantName || "Counsellor"}
                    </h3>
                    <p className="text-xs text-slate-500">Tap to message</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto bg-white p-6">
                    {messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center">
                        <div>
                          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                          <p className="mt-4 text-sm text-slate-500">
                            Start the conversation with your counsellor!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((msg) => {
                          const isOwn = msg.senderId === currentUser.id;
                          return (
                            <Motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-xs rounded-xl px-4 py-2.5 ${
                                  isOwn
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-900"
                                }`}
                              >
                                <p className="text-sm">{msg.text}</p>
                                <p
                                  className={`mt-1 text-xs ${
                                    isOwn ? "text-blue-100" : "text-slate-500"
                                  }`}
                                >
                                  {msg.createdAt
                                    ? new Date(
                                        msg.createdAt.toMillis?.() ||
                                          msg.createdAt.seconds * 1000
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </p>
                              </div>
                            </Motion.div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t border-slate-200 bg-slate-50 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Type a message..."
                        disabled={loading}
                        className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                      />
                      <button
                        type="submit"
                        disabled={!draft.trim() || loading}
                        className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:bg-slate-300"
                      >
                        {loading ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className="h-5 w-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-slate-500">Select a conversation to start</p>
                  </div>
                </div>
              )}
            </div>
          </Motion.div>
        </div>
      ) : (
        // COUNSELLOR VIEW
        <div className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-4">
          {/* Students List */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:col-span-1"
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">My Students</h2>
              <p className="text-xs text-slate-500 mt-1">
                {assignedStudents.length} student{assignedStudents.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="max-h-[calc(100vh-15rem)] overflow-y-auto">
              {assignedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-sm text-slate-500">
                    No students assigned yet
                  </p>
                </div>
              ) : (
                assignedStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStartChatWithStudent(student.id, student.name)}
                    disabled={connectingWithCounsellor}
                    className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                      selectedParticipantId === student.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {student.name}
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {student.email || "student"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </Motion.div>

          {/* Chat Area */}
          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:col-span-3"
          >
            {selectedConvId ? (
              <div className="flex h-[calc(100vh-8rem)] flex-col">
                {/* Header */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-100 px-6 py-4">
                  <h3 className="text-lg font-bold text-slate-900">
                    {otherParticipantName || "Student"}
                  </h3>
                  <p className="text-xs text-slate-500">1 participant</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto bg-white p-6">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 text-sm text-slate-500">
                          Start the conversation with the student!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId === currentUser.id;
                        return (
                          <Motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs rounded-xl px-4 py-2.5 ${
                                isOwn
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-100 text-slate-900"
                              }`}
                            >
                              <p className="text-sm">{msg.text}</p>
                              <p
                                className={`mt-1 text-xs ${
                                  isOwn ? "text-blue-100" : "text-slate-500"
                                }`}
                              >
                                {msg.createdAt
                                  ? new Date(
                                      msg.createdAt.toMillis?.() ||
                                        msg.createdAt.seconds * 1000
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </p>
                            </div>
                          </Motion.div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-slate-200 bg-slate-50 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      type="text"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Type a message..."
                      disabled={loading}
                      className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:bg-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={!draft.trim() || loading}
                      className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 disabled:bg-slate-300"
                    >
                      {loading ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-4 text-slate-500">Select a student to start messaging</p>
                </div>
              </div>
            )}
          </Motion.div>
        </div>
      )}
    </div>
  );
}
