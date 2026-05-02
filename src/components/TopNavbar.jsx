import { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { LogOut, MoonStar, Shield, SunMedium, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { watchCurrentUser } from "../services/firebase/users";
import {
  markNotificationAsRead,
  markNotificationsAsRead,
  watchUserNotifications,
} from "../services/firebase/notifications";
import NotificationDropdown from "./NotificationDropdown";

export default function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userDoc, setUserDoc] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("wellness-theme") === "dark";
  });
  const notificationRef = useRef(null);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;
    const unsubUser = watchCurrentUser(auth.currentUser.uid, setUserDoc);
    const unsubNotifications = watchUserNotifications(auth.currentUser.uid, setNotifications);
    return () => {
      unsubUser?.();
      unsubNotifications?.();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    window.localStorage.setItem("wellness-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const role = (userDoc?.role || "student").toLowerCase();
  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isRead !== true && n.read !== true).length,
    [notifications]
  );

  const roleLinks = {
    student: [
      { label: "Dashboard", path: "/dashboard/student" },
      { label: "Assessment", path: "/assessment" },
      { label: "Progress", path: "/progress" },
      { label: "Attendance", path: "/attendance" },
      { label: "Messages", path: "/messages" },
      { label: "Profile", path: "/profile" },
    ],
    counsellor: [
      { label: "Counsellor Dashboard", path: "/dashboard/counsellor" },
      { label: "Messages", path: "/messages" },
      { label: "Profile", path: "/profile" },
    ],
    admin: [
      { label: "Admin Dashboard", path: "/dashboard/admin" },
      { label: "Profile", path: "/profile" },
    ],
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications
      .filter((item) => item.isRead !== true && item.read !== true)
      .map((item) => item.id);
    await markNotificationsAsRead(unreadIds);
  };

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 md:px-6">
      <div className="glass-panel mx-auto flex w-full max-w-[1600px] items-center justify-between rounded-[1.9rem] px-4 py-3 md:px-6">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate(role === "student" ? "/dashboard/student" : role === "counsellor" ? "/dashboard/counsellor" : "/dashboard/admin")}
            className="flex items-center gap-3 font-semibold text-[color:var(--text-main)]"
          >
            <span className="animated-gradient flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#38bdf8_0%,#8b5cf6_52%,#f97316_100%)] text-white shadow-lg">
              <Shield className="h-5 w-5" />
            </span>
            <div className="text-left">
              <span className="block text-sm uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Student Wellness</span>
              <span className="block text-base font-semibold">CalmOS</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-2">
            {(roleLinks[role] || []).map((link) => {
              const active = location.pathname === link.path;
              return (
                <Motion.button
                  key={link.path}
                  type="button"
                  onClick={() => navigate(link.path)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[linear-gradient(135deg,#0f172a_0%,#334155_100%)] text-white shadow-lg"
                      : "text-[color:var(--text-muted)] hover:bg-white/40 hover:text-[color:var(--text-main)]"
                  }`}
                >
                  {link.label}
                </Motion.button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3" ref={notificationRef}>
          <Motion.button
            type="button"
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="relative rounded-2xl border border-white/30 bg-white/35 p-2.5 text-[color:var(--text-main)] shadow-sm backdrop-blur"
            title="Toggle theme"
          >
            <Motion.div
              key={isDarkMode ? "dark" : "light"}
              initial={{ rotate: -35, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {isDarkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </Motion.div>
          </Motion.button>

          <NotificationDropdown
            open={isNotificationOpen}
            notifications={notifications}
            unreadCount={unreadCount}
            onToggle={() => setIsNotificationOpen((prev) => !prev)}
            onMarkRead={markNotificationAsRead}
            onMarkAllRead={handleMarkAllRead}
          />

          <div className="hidden sm:flex items-center gap-3 rounded-[1.3rem] border border-white/35 bg-white/35 px-3 py-2 backdrop-blur">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#14b8a6_0%,#3b82f6_45%,#8b5cf6_100%)] text-white shadow-lg">
              <UserRound className="h-4 w-4" />
            </div>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-[color:var(--text-main)]">{userDoc?.name || "User"}</p>
              <p className="text-[11px] capitalize text-[color:var(--text-muted)]">{role}</p>
            </div>
          </div>

          <Motion.button
            type="button"
            onClick={handleLogout}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="rounded-2xl border border-white/30 bg-white/35 p-2.5 text-[color:var(--text-main)] shadow-sm backdrop-blur"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Motion.button>
        </div>
      </div>
    </header>
  );
}
