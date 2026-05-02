import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Send, Loader, User, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getCurrentUser } from "../services/auth";
import { watchAssignedStudents } from "../services/firebase/users";
import {
  sendMessage,
  getOrCreateConversation,
  watchConversationMessages,
} from "../services/firebase/chats";

export default function CounsellorMessaging() {
  const [currentUser, setCurrentUser] = useState(null);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  // Initialize counsellor
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === "counsellor") {
      setCurrentUser(user);
    }
  }, []);

  // Watch assigned students
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = watchAssignedStudents(currentUser.id, (students) => {
      setAssignedStudents(students);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Watch messages when student selected
  useEffect(() => {
    if (!selectedStudentId || !currentUser) {
      setMessages([]);
      setConversationId("");
      return;
    }

    const getConvAndWatch = async () => {
      try {
        const convId = await getOrCreateConversation(
          selectedStudentId,
          currentUser.id
        );
        setConversationId(convId);

        const unsubscribe = watchConversationMessages(convId, (msgs) => {
          setMessages(msgs);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error setting up conversation:", error);
        toast.error("Failed to load conversation");
      }
    };

    const unsubPromise = getConvAndWatch();

    return () => {
      unsubPromise.then((unsub) => unsub?.());
    };
  }, [selectedStudentId, currentUser]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredStudents = assignedStudents.filter((student) =>
    (student.profile?.name || student.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedStudent = assignedStudents.find(
    (s) => s.id === selectedStudentId
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !conversationId || loading) return;

    setLoading(true);
    try {
      await sendMessage(
        conversationId,
        draft.trim(),
        currentUser.id,
        "counsellor"
      );
      setDraft("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== "counsellor") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Access Denied
          </h1>
          <p className="mt-2 text-slate-600">
            Only counsellors can access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-4">
      {/* Students List */}
      <Motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:col-span-1"
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">My Students</h2>
          <p className="text-xs text-slate-500">
            {assignedStudents.length} student
            {assignedStudents.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="border-b border-slate-200 p-4">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="max-h-[calc(100vh-17rem)] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <User className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">
                {searchTerm ? "No students found" : "No assigned students"}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                  selectedStudentId === student.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="truncate text-sm font-semibold text-slate-900">
                  {student.profile?.name || student.name || "Unknown"}
                </div>
                <p className="text-xs text-slate-500">
                  {student.profile?.rollNumber || student.rollNumber || "Student"}
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
        {selectedStudent ? (
          <div className="flex h-[calc(100vh-8rem)] flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedStudent.profile?.name || selectedStudent.name || "Unknown"}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedStudent.profile?.rollNumber ||
                    selectedStudent.rollNumber ||
                    "Student"}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-white p-6">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="mt-4 text-sm text-slate-500">
                      No messages yet. Start a conversation!
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
  );
}
