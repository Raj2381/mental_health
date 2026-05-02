import { useState } from "react";
import { motion as Motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { saveUserProfile } from "../../services/firebase/users.js";
import { CheckCircle, AlertCircle, Hash, BookOpen, User, Phone, Calendar, GraduationCap } from "lucide-react";
import DashboardCard from "../dashboard/DashboardCard";

const C = {
  sage: "#6B8F71",
  sageMid: "#4A6E50",
  sagePale: "#EFF5F0",
  sageLight: "#D6E8D9",
  sand: "#F5F0E8",
  sandDark: "#E8DFD0",
  cream: "#FDFAF6",
  ink: "#2C2418",
  inkSoft: "#4A3F35",
  muted: "#8A7F74",
  blush: "#C9847E",
  blushPale: "#F5ECEA",
  skyBlue: "#7BA7BC",
  skyPale: "#EAF2F6",
};

export default function StudentIdentity({ userId, userData }) {
  const [form, setForm] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    gender: userData?.gender || "",
    dob: userData?.dob || "",
    rollNumber: userData?.rollNumber || "",
    department: userData?.department || "",
    semester: userData?.semester || "",
    year: userData?.year || "",
    college: userData?.college || "",
    bio: userData?.bio || "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
    setError("");
  };

  const validateForm = () => {
    const required = ["name", "email", "rollNumber", "department", "semester"];
    const missing = required.filter((field) => !form[field]?.toString().trim());

    if (missing.length > 0) {
      setError(`Missing required fields: ${missing.join(", ")}`);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!validateForm()) return;

    setSaving(true);
    setError("");

    try {
      await saveUserProfile(userId, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        dob: form.dob,
        rollNumber: form.rollNumber,
        department: form.department,
        semester: form.semester,
        year: form.year,
        college: form.college,
        bio: form.bio,
        profileCompleted: true,
      });

      setSaved(true);
      toast.success("Profile updated successfully");

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save profile. Please try again.");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Calculate profile completion
  const totalFields = ["name", "email", "rollNumber", "department", "semester", "phone", "college", "dob", "gender"];
  const filledFields = totalFields.filter((field) => form[field]?.toString().trim()).length;
  const completionPercent = Math.round((filledFields / totalFields.length) * 100);

  const isComplete =
    form.name &&
    form.email &&
    form.rollNumber &&
    form.department &&
    form.semester;

  const formSections = [
    {
      title: "Personal Information",
      icon: User,
      fields: [
        { name: "name", label: "Full Name", icon: User, required: true, type: "text", placeholder: "Enter your full name" },
        { name: "phone", label: "Phone Number", icon: Phone, required: false, type: "tel", placeholder: "Enter your phone" },
        { name: "gender", label: "Gender", icon: User, required: false, type: "select", placeholder: "Select gender", options: ["Male", "Female", "Other", "Prefer not to say"] },
        { name: "dob", label: "Date of Birth", icon: Calendar, required: false, type: "date", placeholder: "Select your DOB" },
      ],
    },
    {
      title: "Academic Information",
      icon: GraduationCap,
      fields: [
        { name: "rollNumber", label: "Roll Number", icon: Hash, required: true, type: "text", placeholder: "e.g., CS2024001" },
        { name: "department", label: "Department", icon: BookOpen, required: true, type: "select", placeholder: "Select department", options: ["Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Commerce", "Arts", "Science", "Business Administration"] },
        { name: "semester", label: "Semester", icon: BookOpen, required: true, type: "select", placeholder: "Select semester", options: ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"] },
        { name: "year", label: "Academic Year", icon: GraduationCap, required: false, type: "text", placeholder: "e.g., 2024-2025" },
        { name: "college", label: "College/University", icon: BookOpen, required: false, type: "text", placeholder: "Enter your college name", fullWidth: true },
      ],
    },
    {
      title: "About You",
      icon: User,
      fields: [
        { name: "bio", label: "Bio", icon: User, required: false, type: "textarea", placeholder: "Tell us about yourself...", fullWidth: true },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Completion Progress Card */}
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DashboardCard className="p-5 md:p-6" glow="from-emerald-500/16 via-teal-500/12 to-cyan-500/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
                Profile Completion
              </p>
              <p className="mt-1 text-2xl font-bold text-[color:var(--text-main)]">{completionPercent}%</p>
            </div>
            {isComplete && (
              <Motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 p-3"
              >
                <CheckCircle className="h-6 w-6 text-white" />
              </Motion.div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <Motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 shadow-lg"
            />
          </div>
          <p className="mt-3 text-xs text-[color:var(--text-muted)]">
            {isComplete ? "✓ All required fields complete" : `Complete ${9 - filledFields} more field${9 - filledFields !== 1 ? "s" : ""}`}
          </p>
        </DashboardCard>
      </Motion.div>

      {/* Form Sections */}
      {formSections.map((section, sectionIdx) => (
        <Motion.div
          key={sectionIdx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + sectionIdx * 0.1 }}
        >
          <DashboardCard className="p-5 md:p-6" glow="from-blue-500/12 via-purple-500/10 to-pink-500/8">
            {/* Section Header */}
            <div className="mb-6 flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/15 p-2">
                <section.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-base font-semibold text-[color:var(--text-main)]">{section.title}</h3>
            </div>

            {/* Section Fields */}
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field, fieldIdx) => (
                <div
                  key={field.name}
                  className={field.fullWidth ? "md:col-span-2" : ""}
                >
                  <Motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + fieldIdx * 0.05 }}
                  >
                    {/* Label */}
                    <label className="text-xs font-semibold uppercase tracking-wider text-[color:var(--text-muted)] block mb-2">
                      <span className="inline-flex items-center gap-1.5">
                        {field.icon && <field.icon className="h-3.5 w-3.5" />}
                        {field.label}
                        {field.required && <span className="text-red-400">*</span>}
                      </span>
                    </label>

                    {/* Input */}
                    {field.type === "select" ? (
                      <select
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleInputChange}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-blue-500 focus:bg-white/10 focus:outline-none"
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt} className="bg-slate-900">
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className="w-full min-h-24 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 transition-all duration-200 resize-none focus:border-blue-500 focus:bg-white/10 focus:outline-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 transition-all duration-200 focus:border-blue-500 focus:bg-white/10 focus:outline-none"
                      />
                    )}
                  </Motion.div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </Motion.div>
      ))}

      {/* Error Message */}
      {error && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </Motion.div>
      )}

      {/* Success Message */}
      {saved && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 flex items-center gap-3"
        >
          <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <p className="text-sm text-emerald-300">Profile saved successfully!</p>
        </Motion.div>
      )}

      {/* Save Button */}
      <Motion.button
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: saving ? 1 : 1.02 }}
        whileTap={{ scale: saving ? 1 : 0.98 }}
        className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)",
          opacity: saving ? 0.7 : 1,
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {saving ? (
          <>
            <Motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Saving Profile...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Save Profile</span>
          </>
        )}
      </Motion.button>
    </div>
  );
}
