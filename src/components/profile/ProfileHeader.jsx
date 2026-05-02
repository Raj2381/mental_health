import { motion as Motion } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import {
  Activity,
  CalendarRange,
  Camera,
  Flame,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { db, auth } from "../../firebase";
import { uploadProfileImage } from "../../services/firebase/storage";
import DashboardCard from "../dashboard/DashboardCard";

const defaultStatMeta = [
  { key: "streak", label: "Streak", icon: Flame, suffix: " days" },
  { key: "activity", label: "Activity", icon: Activity, suffix: "%" },
  { key: "attendance", label: "Attendance", icon: CalendarRange, suffix: "%" },
];

function MiniBars({ points = [] }) {
  const safePoints = points.length ? points : [42, 54, 63, 68, 72, 76, 84];
  return (
    <div className="flex h-16 items-end gap-2">
      {safePoints.map((value, index) => (
        <Motion.div
          key={`${value}-${index}`}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: `${Math.max(20, value)}%`, opacity: 1 }}
          transition={{ delay: 0.25 + index * 0.06, duration: 0.45, ease: "easeOut" }}
          className="w-2.5 rounded-full bg-gradient-to-t from-cyan-400 via-sky-400 to-violet-400 shadow-[0_14px_24px_-16px_rgba(59,130,246,0.9)]"
        />
      ))}
    </div>
  );
}

export default function ProfileHeader({
  greeting,
  profile,
  stats,
  insight,
  streakHistory,
  onUploadClick,
  statMeta = defaultStatMeta,
  badgeLabel = "Wellness Profile",
  panelTitle = "Streak rhythm",
  panelBody = "Stronger routines show up when your activity and attendance stay aligned. Keep this pace to protect your energy.",
  metaItems = [],
}) {
  const fileInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const initials = (profile?.name || "U").slice(0, 1).toUpperCase();

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    setUploadingImage(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        toast.error("User not authenticated");
        return;
      }

      const downloadUrl = await uploadProfileImage(userId, file);
      await updateDoc(doc(db, "users", userId), {
        profileImage: downloadUrl,
        updatedAt: serverTimestamp(),
      });

      toast.success("Profile image updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to upload image");
      console.error("Image upload error:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <DashboardCard
      className="animated-gradient shimmer-sweep overflow-hidden p-6 md:p-8"
      glow="from-sky-500/24 via-violet-500/20 to-orange-400/16"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.22),transparent_28%)]" />
      <div className="relative grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <Motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
              className="pulse-ring relative"
            >
              <div className="animated-gradient relative h-28 w-28 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#22d3ee_0%,#3b82f6_42%,#8b5cf6_75%,#fb923c_100%)] p-[3px] shadow-[0_30px_80px_-34px_rgba(59,130,246,0.85)]">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.8rem] bg-[color:var(--panel-strong)] text-4xl font-semibold text-[color:var(--text-main)]">
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile?.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <Motion.button
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: uploadingImage ? 1 : 1.05 }}
                type="button"
                disabled={uploadingImage}
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 rounded-full border border-white/60 bg-white/80 p-2.5 text-slate-700 shadow-lg backdrop-blur dark:bg-slate-900/80 dark:text-slate-100 disabled:opacity-60"
              >
                <Camera className="h-4 w-4" />
              </Motion.button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
            </Motion.div>

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/45 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--text-muted)] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                {badgeLabel}
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--text-main)] md:text-4xl">
                {greeting}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-white/35 bg-white/45 px-3 py-1 font-medium capitalize text-[color:var(--text-main)] backdrop-blur">
                  {profile?.role || "student"}
                </span>
                {(metaItems.length ? metaItems : [profile?.email || "No email added yet"]).map((item) => (
                  <span key={item} className="soft-text">{item}</span>
                ))}
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                {insight}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {statMeta.map((item, index) => (
              <Motion.div
                key={item.key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08, duration: 0.45 }}
                className="rounded-[1.6rem] border border-white/40 bg-white/40 p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[color:var(--text-muted)]">{item.label}</span>
                  <item.icon className="h-4 w-4 text-[color:var(--text-main)]" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-[color:var(--text-main)]">
                  {stats?.[item.key] ?? 0}
                  <span className="ml-1 text-sm font-medium text-[color:var(--text-muted)]">{item.suffix}</span>
                </p>
              </Motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[1.8rem] border border-white/35 bg-white/35 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[color:var(--text-muted)]">Momentum</p>
              <h2 className="mt-1 text-xl font-semibold text-[color:var(--text-main)]">{panelTitle}</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(251,146,60,0.24),rgba(139,92,246,0.22))]">
              <ShieldCheck className="h-5 w-5 text-[color:var(--text-main)]" />
            </div>
          </div>

          <div className="mt-5">
            <MiniBars points={streakHistory} />
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-white/40 bg-black/5 px-4 py-3 dark:bg-white/5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              This week
            </p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--text-main)]">
              {panelBody}
            </p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
