import { motion as Motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Sparkles } from "lucide-react";

function formatNotificationTime(value) {
  if (!value) return "Just now";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function NotificationDropdown({
  open,
  notifications = [],
  unreadCount = 0,
  onToggle,
  onMarkRead,
  onMarkAllRead,
}) {
  const isUnread = (notification) => notification?.isRead !== true && notification?.read !== true;

  return (
    <div className="relative">
      <Motion.button
        type="button"
        onClick={onToggle}
        animate={unreadCount > 0 ? { rotate: [0, -10, 10, -6, 6, 0] } : { rotate: 0 }}
        transition={unreadCount > 0 ? { duration: 0.8, repeat: Infinity, repeatDelay: 2.4 } : { duration: 0.2 }}
        className={`relative rounded-2xl border border-white/30 bg-white/35 p-2.5 text-[color:var(--text-main)] shadow-sm backdrop-blur ${
          unreadCount > 0 ? "pulse-ring" : ""
        }`}
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </Motion.button>

      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-14 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border border-white/30 bg-[color:var(--panel-strong)] shadow-[0_35px_100px_-30px_var(--shadow-strong)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/20 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-[color:var(--text-main)]">Notifications</p>
                <p className="text-xs text-[color:var(--text-muted)]">{unreadCount} unread</p>
              </div>
              <button
                type="button"
                onClick={onMarkAllRead}
                className="inline-flex items-center gap-1 rounded-full bg-white/45 px-3 py-1.5 text-xs font-medium text-[color:var(--text-main)] transition hover:bg-white/65"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Sparkles className="mx-auto h-5 w-5 text-violet-400" />
                  <p className="mt-3 text-sm font-medium text-[color:var(--text-main)]">No notifications yet</p>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">Updates from assessments, sessions, and alerts will appear here.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => onMarkRead(notification.id)}
                    className={`w-full border-b border-white/15 px-5 py-4 text-left transition last:border-b-0 hover:bg-white/35 ${
                      isUnread(notification) ? "bg-sky-500/10" : "bg-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[color:var(--text-main)]">{notification.title}</p>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">{notification.message}</p>
                      </div>
                      {isUnread(notification) && <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-sky-500" />}
                    </div>
                    <p className="mt-2 text-xs text-[color:var(--text-muted)]">{formatNotificationTime(notification.createdAt)}</p>
                  </button>
                ))
              )}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
