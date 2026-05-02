import { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Send, Broadcast, Loader, User, MessageSquare, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getCurrentUser } from "../services/auth";
import { watchAllUsers } from "../services/firebase/users";
import {
  sendMessage,
  sendBroadcast,
  getOrCreateConversation,
  watchConversationMessages,
} from "../services/firebase/chats";

export default function AdminMessaging() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  // Initialize admin
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.role === "admin") {
      setCurrentUser(user);
    }
  }, []);

  // Watch all users
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = watchAllUsers((users) => {
      setAllUsers(users.filter((u) => u.id !== currentUser.id));
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Watch messages when user selected
  useEffect(() => {
    if (!selectedUserId || !currentUser) {
      setMessages([]);
      setConversationId("");
      return;
    }

    const getConvAndWatch = async () => {
      try {
        const convId = await getOrCreateConversation(selectedUserId, currentUser.id);
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
  }, [selectedUserId, currentUser]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredUsers = allUsers.filter((user) =>
    (user.profile?.name || user.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const selectedUser = allUsers.find((u) => u.id === selectedUserId);

  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !conversationId || loading) return;

    setLoading(true);
    try {
      await sendMessage(conversationId, draft.trim(), currentUser.id, "admin");
      setDraft("");
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!draft.trim() || isBroadcasting) return;

    const confirmed = window.confirm(
      "Send this message to ALL users? This cannot be undone."
    );
    if (!confirmed) return;

    setIsBroadcasting(true);
    try {
      await sendBroadcast(draft.trim(), currentUser.id, "admin");
      setDraft("");
      toast.success("Broadcast message sent to all users");
    } catch (error) {
      console.error("Failed to broadcast:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <X className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Access Denied
          </h1>
          <p className="mt-2 text-slate-600">Only admins can access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-4">
      {/* Users List */}
      <Motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:col-span-1"
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">All Users</h2>
          <p className="text-xs text-slate-500">
            {allUsers.length} user{allUsers.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="border-b border-slate-200 p-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="max-h-[calc(100vh-17rem)] overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <User className="h-12 w-12 text-slate-300" />
              <p className="mt-4 text-sm text-slate-500">No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                  selectedUserId === user.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="truncate text-sm font-semibold text-slate-900">
                  {user.profile?.name || user.name || "Unknown"}
                </div>
                <p className="text-xs text-slate-500">
                  {user.role || "user"}
                </p>
              </button>
            ))
          )}
        </div>
      </Motion.div>

      {/* Chat/Broadcast Area */}
      <Motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:col-span-3"
      >
        {selectedUser ? (
          <div className="flex h-[calc(100vh-8rem)] flex-col">
            {/* Header */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedUser.profile?.name || selectedUser.name || "Unknown"}
                </h3>
                <p className="text-xs text-slate-500">
                  Role: {selectedUser.role}
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
              <form onSubmit={handleSendDirectMessage} className="flex gap-3">
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
          <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-500">Select a user to start messaging</p>
            </div>

            {/* Broadcast Section */}
            <div className="mt-8 w-full border-t border-slate-200 pt-8">
              <div className="flex flex-col items-center justify-center px-6 py-8">
                <Broadcast className="h-12 w-12 text-amber-400" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Send Broadcast
                </h3>
                <p className="mt-2 text-sm text-slate-500 text-center">
                  Send a message to all users at once
                </p>

                <form
                  onSubmit={handleSendBroadcast}
                  className="mt-6 w-full max-w-md space-y-3"
                >
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Broadcast message to all users..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || isBroadcasting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-white hover:bg-amber-600 disabled:bg-slate-300"
                  >
                    {isBroadcasting ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Broadcast className="h-5 w-5" />
                        Send to All
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </Motion.div>
    </div>
  );
}
