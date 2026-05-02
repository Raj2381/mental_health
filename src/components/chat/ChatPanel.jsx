import { MessageSquare, SendHorizontal } from "lucide-react";

function formatTimestamp(value) {
  if (!value) return "";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function ChatPanel({
  selectedChat,
  otherParticipant,
  currentUserId,
  messages,
  draft,
  onDraftChange,
  onSend,
  endRef,
  canMessage,
  emptyMode = "booking",
}) {
  if (!selectedChat) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div>
          <MessageSquare className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">No active conversation</h2>
          <p className="mt-2 text-sm text-slate-500">
            {emptyMode === "profile"
              ? "Complete more of your profile to unlock chat."
              : "Book a session to start chat once your request is accepted."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-slate-100 px-6 py-5">
        <p className="text-sm font-medium text-slate-400">Realtime conversation</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{otherParticipant?.name || "Conversation"}</h2>
            <p className="text-sm text-slate-500 capitalize">{otherParticipant?.role || "user"}</p>
          </div>
          <div className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Live
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-6 py-6">
        {messages.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Send the first message to begin this conversation.
          </div>
        ) : null}
        {messages.map((message) => {
          const mine = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-[1.5rem] px-4 py-3 shadow-sm ${
                mine ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-900"
              }`}>
                <p className="text-sm leading-6">{message.text}</p>
                <p className={`mt-2 text-[11px] ${mine ? "text-white/50" : "text-slate-400"}`}>
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSend} className="border-t border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3">
          <MessageSquare className="h-5 w-5 text-slate-400" />
          <input
            value={draft}
            onChange={onDraftChange}
            disabled={!canMessage}
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={canMessage ? "Type your message..." : "Complete your profile to unlock chat"}
          />
          <button
            type="submit"
            disabled={!canMessage}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizontal className="h-4 w-4" />
            Send
          </button>
        </div>
      </form>
    </>
  );
}
