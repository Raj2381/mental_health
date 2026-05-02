import { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  VenusAndMars,
  Calendar,
  Hash,
  Building2,
  GraduationCap,
  School,
  FileText,
  Camera,
  Save,
  Users,
  Shield,
  UserCheck,
  Activity,
  Flame,
  BarChart3,
  Pencil,
  Eye,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Clock3,
  KeyRound,
  LogOut,
  Trash2,
} from "lucide-react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getCurrentUser } from "../services/auth";
import {
  saveUserProfile,
  watchAllUsers,
  watchAssignedStudents,
} from "../services/firebase/users";
import {
  sendResetLink,
  revokeSessions,
  deleteAccount,
} from "../services/authSettings";
import { uploadProfileImage, saveProfileImage } from "../services/storage";

const EMPTY_PROFILE = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  dateOfBirth: "",
  rollNumber: "",
  department: "",
  semester: "",
  college: "",
  specialization: "",
  experienceYears: "",
  licenseNumber: "",
  bio: "",
  profileImage: "",
};

const PROFILE_COMPLETION_FIELDS = ["name", "phone", "department", "semester", "bio"];

function toMillis(value) {
  if (!value) return null;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function formatLastUpdated(value) {
  const millis = toMillis(value);
  if (!millis) return "Never";
  const diffMinutes = Math.max(0, Math.floor((Date.now() - millis) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function validateProfile(profile, role) {
  const errors = {};

  if (!String(profile.name || "").trim()) {
    errors.name = "Name is required";
  }

  if (!String(profile.email || "").trim()) {
    errors.email = "Email is required";
  }

  if (!String(profile.phone || "").trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^\d{10}$/.test(String(profile.phone).replace(/\D/g, ""))) {
    errors.phone = "Enter a valid 10-digit phone number";
  }

  if (role === "student") {
    if (!String(profile.rollNumber || "").trim()) errors.rollNumber = "Roll number is required";
    if (!String(profile.department || "").trim()) errors.department = "Department is required";
    if (!String(profile.semester || "").trim()) errors.semester = "Semester is required";
  }

  if (role === "counsellor") {
    if (!String(profile.specialization || "").trim()) errors.specialization = "Specialization is required";
    if (!String(profile.experienceYears || "").trim()) errors.experienceYears = "Experience is required";
    if (!String(profile.licenseNumber || "").trim()) errors.licenseNumber = "License number is required";
  }

  return errors;
}

function InputField({ label, name, value, onChange, icon: Icon, type = "text", readOnly = false, placeholder = "", error = "", tooltip = "" }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65" title={tooltip || undefined}>{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
        <input
          name={name}
          type={type}
          value={value || ""}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white/5 px-10 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition ${
            error
              ? "border-rose-400/80 focus:border-rose-400"
              : "border-white/15 focus:border-sky-400"
          } ${readOnly ? "cursor-not-allowed bg-white/10 text-white/70" : ""}`}
        />
      </div>
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

function TextareaField({ label, name, value, onChange, placeholder = "", error = "", readOnly = false, tooltip = "" }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65" title={tooltip || undefined}>{label}</label>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        rows={4}
        className={`w-full rounded-xl border bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition ${
          error
            ? "border-rose-400/80 focus:border-rose-400"
            : "border-white/15 focus:border-sky-400"
        } ${readOnly ? "cursor-not-allowed bg-white/10 text-white/70" : ""}`}
      />
      {error ? <p className="text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}

function CollapsibleSection({ title, icon: Icon, subtitle, isOpen, onToggle, children }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/5 p-5 backdrop-blur-xl">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between text-left">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-sky-500/25 to-violet-500/25 p-2.5">
            <Icon className="h-4 w-4 text-sky-200" />
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90">{title}</h3>
            {subtitle ? <p className="mt-1 text-xs text-white/55">{subtitle}</p> : null}
          </div>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4 text-white/70" /> : <ChevronDown className="h-4 w-4 text-white/70" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-5 overflow-hidden"
          >
            {children}
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const hydratedRef = useRef(false);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState("student");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isEditing, setIsEditing] = useState(true);
  const [syncStatus, setSyncStatus] = useState("synced");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activitySummary, setActivitySummary] = useState({ streak: 0, riskScore: 0, completion: 0 });
  const [openSections, setOpenSections] = useState({ personal: true, role: true, about: true, account: true });
  const [accountLoading, setAccountLoading] = useState({
    reset: false,
    revoke: false,
    delete: false,
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setUserId(user.id);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsub = onSnapshot(doc(db, "users", userId), (docSnap) => {
      const data = docSnap.data() || {};
      console.log("🔥 FIREBASE DATA:", data);
      const incomingProfile = data?.profile || {};
      const incomingRole = String(data?.role || "student").toLowerCase();

      setRole(incomingRole);
      setLastUpdated(data?.updatedAt || null);
      setActivitySummary({
        streak: Number(data?.streak || 0),
        riskScore: Number(data?.riskScore ?? data?.latestAssessment?.score ?? 0),
        completion: Number(data?.dailyProgress?.percent || 0),
      });

      if (!hydratedRef.current && !isEditing) {
        setProfile({
          ...EMPTY_PROFILE,
          ...incomingProfile,
          email: incomingProfile.email || data?.email || "",
          profileImage: incomingProfile.profileImage || data?.photoURL || "",
        });
        hydratedRef.current = true;
      }

      if (syncStatus !== "saving") setSyncStatus("synced");
      setLoading(false);
    });

    return () => unsub();
  }, [userId, isEditing, syncStatus]);

  useEffect(() => {
    if (!userId || role !== "admin") {
      setAllUsers([]);
      return;
    }

    const unsub = watchAllUsers((users) => {
      setAllUsers(users);
      if (!selectedUserId && users.length > 0) {
        setSelectedUserId(users[0].id);
      }
    });

    return () => unsub?.();
  }, [userId, role, selectedUserId]);

  useEffect(() => {
    if (!userId || role !== "counsellor") {
      setAssignedStudents([]);
      return;
    }

    const unsub = watchAssignedStudents(userId, (students) => {
      setAssignedStudents(students);
      if (!selectedUserId && students.length > 0) {
        setSelectedUserId(students[0].id);
      }
    });

    return () => unsub?.();
  }, [userId, role, selectedUserId]);

  const selectedViewProfile = useMemo(() => {
    if (role !== "admin") return profile;

    const source = allUsers;
    const selected = source.find((item) => item.id === selectedUserId);
    return selected?.profile || null;
  }, [role, profile, allUsers, assignedStudents, selectedUserId]);

  const roleBadge = useMemo(() => {
    if (role === "admin") return { label: "Admin", color: "bg-rose-500/20 text-rose-200" };
    if (role === "counsellor") return { label: "Counsellor", color: "bg-violet-500/20 text-violet-200" };
    return { label: "Student", color: "bg-sky-500/20 text-sky-200" };
  }, [role]);

  const completionPercent = useMemo(() => {
    const completed = PROFILE_COMPLETION_FIELDS.filter((field) => String(profile[field] || "").trim()).length;
    return Math.round((completed / PROFILE_COMPLETION_FIELDS.length) * 100);
  }, [profile]);

  const featureUnlockMessage = useMemo(() => {
    if (completionPercent >= 90) return "All premium features unlocked.";
    if (completionPercent >= 70) return "Messaging unlocked. Complete profile for deeper insights.";
    return "Complete profile to unlock messaging & advanced insights.";
  }, [completionPercent]);

  const badges = useMemo(() => {
    const list = [];
    if (activitySummary.streak >= 7) list.push("🔥 7-day streak");
    if (activitySummary.riskScore <= 35) list.push("🧠 Mentally strong");
    if (activitySummary.completion >= 75) list.push("📈 Improving");
    if (list.length === 0) list.push("✨ Getting started");
    return list;
  }, [activitySummary]);

  const syncMeta = useMemo(() => {
    if (syncStatus === "saving") return { dot: "bg-amber-400", text: "Saving", tone: "text-amber-200" };
    if (syncStatus === "error") return { dot: "bg-rose-500", text: "Error", tone: "text-rose-200" };
    return { dot: "bg-emerald-400", text: "Synced", tone: "text-emerald-200" };
  }, [syncStatus]);

  const isReadOnlyMode = role === "admin" ? true : !isEditing;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    console.log("Typing profile:", { ...profile, [name]: value });
  };

  const persistProfile = async (showToast = false) => {
    if (!userId || role === "admin") return;

    const validationErrors = validateProfile(profile, role);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSyncStatus("error");
      if (showToast) toast.error("Please fix validation errors");
      return;
    }

    setSyncStatus("saving");
    if (showToast) setSaving(true);
    try {
      await saveUserProfile(userId, {
        role,
        profile: {
          ...profile,
          role,
          experience: profile.experienceYears || profile.experience || "",
        },
      });

      await setDoc(
        doc(db, "users", userId),
        {
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSyncStatus("synced");
      if (showToast) toast.success("Profile saved successfully");
    } catch {
      setSyncStatus("error");
      if (showToast) toast.error("Failed to save profile");
    } finally {
      if (showToast) setSaving(false);
    }
  };

  const handleSave = async () => {
    await persistProfile(true);
    if (syncStatus !== "error") {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (!hydratedRef.current || role === "admin" || !isEditing) return;

    const timer = setTimeout(() => {
      persistProfile(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [profile, isEditing, role]);

  const handleUploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !userId || role === "admin") return;

    setUploadingImage(true);
    setSyncStatus("saving");
    try {
      const url = await uploadProfileImage(file, userId);

      setProfile((prev) => ({ ...prev, profileImage: url }));

      await saveUserProfile(userId, {
        role,
        profile: {
          ...profile,
          profileImage: url,
          photoURL: url,
          role,
        },
      });

      await saveProfileImage(userId, url);

      setSyncStatus("synced");
      toast.success("Profile image uploaded");
    } catch {
      setSyncStatus("error");
      toast.error("Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePasswordReset = async () => {
    const targetEmail = profile.email || getCurrentUser()?.email || "";
    if (!targetEmail) {
      toast.error("No account email found");
      return;
    }

    setAccountLoading((prev) => ({ ...prev, reset: true }));
    try {
      await sendResetLink(targetEmail);
      toast.success("Password reset email sent");
    } catch (error) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setAccountLoading((prev) => ({ ...prev, reset: false }));
    }
  };

  const handleRevokeSessions = async () => {
    if (!userId) {
      toast.error("Unauthorized access");
      return;
    }

    setAccountLoading((prev) => ({ ...prev, revoke: true }));
    try {
      await revokeSessions(userId);
      toast.success("Logged out from all devices");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Failed to revoke sessions");
    } finally {
      setAccountLoading((prev) => ({ ...prev, revoke: false }));
    }
  };

  const handleDeleteAccount = async () => {
    const targetEmail = profile.email || getCurrentUser()?.email || "";
    if (!targetEmail) {
      toast.error("No account email found");
      return;
    }

    if (!deletePassword.trim()) {
      toast.error("Password is required");
      return;
    }

    setAccountLoading((prev) => ({ ...prev, delete: true }));
    try {
      await deleteAccount(targetEmail, deletePassword);
      toast.success("Account deleted successfully");
      setShowDeleteModal(false);
      setDeletePassword("");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setAccountLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-2xl border border-white/15 bg-white/5 p-6 text-white/80 shadow-sm backdrop-blur-xl">Loading profile...</div>
      </div>
    );
  }

  const viewerList = role === "admin" ? allUsers : assignedStudents;
  const roleFields = role === "counsellor"
    ? [
        { key: "specialization", label: "Specialization", icon: UserCheck, placeholder: "e.g. Anxiety & Student Wellness", tooltip: "This helps students find a relevant counsellor" },
        { key: "experienceYears", label: "Experience (years)", icon: BarChart3, placeholder: "e.g. 8", tooltip: "Experience helps personalize assignment confidence" },
        { key: "licenseNumber", label: "License Number", icon: Hash, placeholder: "Professional license ID", tooltip: "Stored for institutional verification" },
      ]
    : role === "admin"
      ? []
      : [
          { key: "rollNumber", label: "Roll Number", icon: Hash, placeholder: "CS2024001", tooltip: "Your roll number helps track academic stress patterns" },
          { key: "department", label: "Department", icon: Building2, placeholder: "Computer Science", tooltip: "Department helps compare peer benchmarks" },
          { key: "semester", label: "Semester", icon: GraduationCap, placeholder: "6", tooltip: "Semester drives workload and risk expectations" },
          { key: "college", label: "College", icon: School, placeholder: "Institution name", tooltip: "Used to customize institution-level insights" },
        ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <Motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/12 bg-[linear-gradient(135deg,rgba(15,23,42,0.78),rgba(30,41,59,0.72),rgba(59,130,246,0.15))] p-6 shadow-[0_24px_80px_-38px_rgba(59,130,246,0.85)] backdrop-blur-2xl"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={selectedViewProfile?.photoURL || selectedViewProfile?.profileImage || profile.profileImage || profile.photoURL || "https://ui-avatars.com/api/?name=Student&background=1E293B&color=E2E8F0"}
                alt="Profile"
                className="h-20 w-20 rounded-2xl border border-white/20 object-cover"
              />
              {role !== "admin" ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 rounded-full border border-white/25 bg-white/20 p-2 text-white shadow"
                >
                  <Camera className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{selectedViewProfile?.name || profile.name || "User Profile"}</h1>
              <p className="text-sm text-white/65">{selectedViewProfile?.email || profile.email || "No email"}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadge.color}`}>{roleBadge.label}</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
                  <span className={`h-2 w-2 rounded-full ${syncMeta.dot}`} />
                  <span className={syncMeta.tone}>{syncMeta.text}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-white/60">
                  <Clock3 className="h-3.5 w-3.5" /> Last updated: {formatLastUpdated(lastUpdated)}
                </span>
              </div>
            </div>
          </div>

          {role !== "admin" ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                {isEditing ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                {isEditing ? "View Mode" : "Edit Profile"}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploadingImage || !isEditing}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white transition hover:from-sky-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          ) : null}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUploadImage}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Streak</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white"><Flame className="h-5 w-5 text-orange-300" /> {activitySummary.streak}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Risk Score</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white"><Activity className="h-5 w-5 text-rose-300" /> {activitySummary.riskScore}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Completion</p>
            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold text-white"><BarChart3 className="h-5 w-5 text-sky-300" /> {activitySummary.completion}%</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Profile Completion</p>
              <p className="mt-1 text-2xl font-bold text-white">{completionPercent}%</p>
            </div>
            <BadgeCheck className="h-6 w-6 text-emerald-300" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-sky-500 via-violet-500 to-emerald-500" style={{ width: `${completionPercent}%` }} />
          </div>
          <p className="mt-3 text-sm text-white/70">{featureUnlockMessage}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span key={badge} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">{badge}</span>
          ))}
        </div>
      </Motion.div>

      {role !== "student" ? (
        <div className="rounded-2xl border border-white/12 bg-white/5 p-5 shadow-sm backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            {role === "admin" ? <Shield className="h-4 w-4 text-rose-300" /> : <UserCheck className="h-4 w-4 text-violet-300" />}
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85">{role === "admin" ? "All Users" : "Assigned Students"}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {viewerList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedUserId(item.id)}
                className={`rounded-xl border p-3 text-left transition ${
                  selectedUserId === item.id
                    ? "border-sky-500/80 bg-sky-500/20"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <p className="text-sm font-semibold text-white">{item?.profile?.name || item?.name || "Unnamed User"}</p>
                <p className="text-xs text-white/70">{item?.profile?.email || item?.email || "No email"}</p>
                <p className="mt-1 text-xs text-white/55">Role: {String(item?.role || "student")}</p>
              </button>
            ))}
            {viewerList.length === 0 ? <p className="text-sm text-white/70">No users found.</p> : null}
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        <CollapsibleSection
          title="Personal Information"
          icon={User}
          subtitle="Identity and contact details"
          isOpen={openSections.personal}
          onToggle={() => setOpenSections((prev) => ({ ...prev, personal: !prev.personal }))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <InputField label="Name" name="name" value={profile.name} onChange={handleInputChange} icon={User} placeholder="Enter full name" error={errors.name} readOnly={isReadOnlyMode} tooltip="Your name appears in counselling and dashboard records" />
            <InputField label="Phone" name="phone" value={profile.phone} onChange={handleInputChange} icon={Phone} placeholder="10-digit phone number" error={errors.phone} readOnly={isReadOnlyMode} tooltip="Used for critical support communication" />
            <InputField label="Gender" name="gender" value={profile.gender} onChange={handleInputChange} icon={VenusAndMars} placeholder="Male / Female / Other" readOnly={isReadOnlyMode} />
            <InputField label="Date of Birth" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleInputChange} icon={Calendar} type="date" readOnly={isReadOnlyMode} />
            <InputField label="Email (Locked)" name="email" value={profile.email} onChange={handleInputChange} icon={Mail} readOnly error={errors.email} tooltip="Email is managed from your authentication account" />
            <InputField label="Role (Locked)" name="role" value={role} onChange={() => {}} icon={Shield} readOnly tooltip="Role is controlled by system permissions" />
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          title={role === "counsellor" ? "Counsellor Credentials" : role === "admin" ? "Admin Overview" : "Academic Information"}
          icon={role === "counsellor" ? Shield : GraduationCap}
          subtitle={role === "counsellor" ? "Professional details for trust and assignment matching" : role === "admin" ? "Minimal editable data for administrator profiles" : "Academic profile improves stress recommendations"}
          isOpen={openSections.role}
          onToggle={() => setOpenSections((prev) => ({ ...prev, role: !prev.role }))}
        >
          {roleFields.length === 0 ? (
            <p className="text-sm text-white/70">Admin accounts use a minimal profile layout.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {roleFields.map((field) => (
                <InputField
                  key={field.key}
                  label={field.label}
                  name={field.key}
                  value={profile[field.key]}
                  onChange={handleInputChange}
                  icon={field.icon}
                  placeholder={field.placeholder}
                  error={errors[field.key]}
                  readOnly={isReadOnlyMode}
                  tooltip={field.tooltip}
                />
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="About"
          icon={FileText}
          subtitle="Tell us about your goals and context"
          isOpen={openSections.about}
          onToggle={() => setOpenSections((prev) => ({ ...prev, about: !prev.about }))}
        >
          <TextareaField
            label="Bio"
            name="bio"
            value={profile.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself"
            readOnly={isReadOnlyMode}
            tooltip="Bio helps personalize recommendations and counsellor context"
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Account Settings"
          icon={Shield}
          subtitle="Security and account-level actions"
          isOpen={openSections.account}
          onToggle={() => setOpenSections((prev) => ({ ...prev, account: !prev.account }))}
        >
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={accountLoading.reset || accountLoading.revoke || accountLoading.delete}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" /> {accountLoading.reset ? "Sending..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={handleRevokeSessions}
              disabled={accountLoading.reset || accountLoading.revoke || accountLoading.delete}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" /> {accountLoading.revoke ? "Processing..." : "Logout All Devices"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={accountLoading.reset || accountLoading.revoke || accountLoading.delete}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" /> Delete Account
            </button>
          </div>
        </CollapsibleSection>
      </div>

      <AnimatePresence>
        {showDeleteModal ? (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          >
            <Motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-rose-400/30 bg-slate-900 p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white">Confirm Account Deletion</h3>
              <p className="mt-2 text-sm text-white/70">Enter your password to permanently delete your account and all related data.</p>
              <div className="mt-4 space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-rose-400"
                  placeholder="Enter your password"
                />
              </div>
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                  }}
                  disabled={accountLoading.delete}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={accountLoading.delete}
                  className="rounded-xl border border-rose-400/40 bg-rose-500/20 px-4 py-2 text-sm font-semibold text-rose-100 disabled:opacity-60"
                >
                  {accountLoading.delete ? "Deleting..." : "Delete Permanently"}
                </button>
              </div>
            </Motion.div>
          </Motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-center justify-center text-xs text-white/70">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur">
          <Users className="h-3.5 w-3.5" />
          Real-time profile sync enabled
        </span>
      </div>
    </div>
  );
}
