import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Heart,
  User,
  Users,
  Shield,
  Check,
  Sparkles,
  AlertTriangle,
  Brain,
  Activity,
} from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const ROLE_OPTIONS = [
  {
    value: "student",
    label: "Student",
    description: "Track wellness and connect with support",
    icon: User,
  },
  {
    value: "counsellor",
    label: "Counsellor",
    description: "Guide students with personalized care",
    icon: Users,
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage platform operations securely",
    icon: Shield,
  },
];

const FEATURE_BADGES = [
  { icon: Brain, text: "Guided emotional assessments" },
  { icon: Activity, text: "Progress insights and tracking" },
  { icon: Sparkles, text: "Trusted expert support" },
];

function getPasswordStrength(password = "") {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const levels = [
    { label: "Very weak", color: "#d35d5d", width: "20%" },
    { label: "Weak", color: "#d9834e", width: "35%" },
    { label: "Fair", color: "#cfaa42", width: "55%" },
    { label: "Strong", color: "#73a84b", width: "78%" },
    { label: "Very strong", color: "#4a8d3f", width: "100%" },
  ];

  return levels[Math.max(0, Math.min(score - 1, 4))] || levels[0];
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#786f61]">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-[#d8cebf] to-transparent" />
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [adminCode, setAdminCode] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const validate = () => {
    const next = {};

    if (!String(form.name || "").trim()) next.name = "Full name is required";
    if (!String(form.email || "").trim()) next.email = "Email is required";
    else if (!String(form.email).includes("@")) next.email = "Invalid email format";
    if (!form.password) next.password = "Password is required";
    else if (String(form.password).length < 6) next.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) next.confirmPassword = "Confirm password is required";
    else if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";

    if (form.role === "admin" && !String(adminCode || "").trim()) {
      next.adminCode = "Admin code is required";
    }

    const ADMIN_CODE = "RAJ123";
    if (form.role === "admin" && String(adminCode || "") !== String(ADMIN_CODE || "")) {
      next.adminCode = "Invalid admin code";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (serverError) setServerError("");
  };

  const onRoleChange = (role) => {
    setForm((prev) => ({ ...prev, role }));
    if (role !== "admin") setAdminCode("");
    setErrors((prev) => ({ ...prev, adminCode: "" }));
    setServerError("");
  };

  const onSubmit = async () => {
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);

      await setDoc(doc(db, "users", userCred.user.uid), {
        name: form.name,
        email: form.email,
        role: form.role,
        profile: {},
        createdAt: serverTimestamp(),
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userCred.user.uid,
          _id: userCred.user.uid,
          name: form.name,
          email: form.email,
          role: form.role,
        })
      );
      localStorage.setItem("auth_token", userCred.user.uid);

      if (form.role === "admin") navigate("/dashboard/admin", { replace: true });
      else if (form.role === "counsellor") navigate("/dashboard/counsellor", { replace: true });
      else navigate("/dashboard/student", { replace: true });
    } catch (error) {
      setServerError(error?.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  const onKeyDownSubmit = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!loading) onSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] px-4 py-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#d7cfbf] bg-[#faf8f4] shadow-[0_24px_80px_-35px_rgba(74,103,65,0.35)] lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1e3320] via-[#274028] to-[#2d4a2f] p-8 text-[#f5f0e8] lg:p-10"
        >
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d0dfcd]/[0.06]" />
          <div className="absolute bottom-8 right-14 h-44 w-44 rounded-full bg-[#d0dfcd]/[0.05]" />
          <div className="absolute -bottom-24 -left-20 h-60 w-60 rounded-full bg-[#d0dfcd]/[0.04]" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c7d6c3]/60 bg-[#5b7753] px-3 py-1 text-xs font-semibold tracking-wide text-[#f5f0e8]">
              <Heart className="h-3.5 w-3.5" /> Wellness Hub
            </div>

            <h1 className="mt-5 text-4xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Begin your
              <br />
              <span style={{ fontFamily: "'Playfair Display', 'DM Serif Display', serif", fontStyle: "italic" }}>
                wellness
              </span>{" "}
              journey.
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#e7ede6]">
              Create your account to access guided assessments, progress tracking,
              and supportive conversations in a calm, trusted environment.
            </p>

            <div className="mt-8 overflow-hidden rounded-xl border border-[#d1dece]/40 bg-[#5a7653]">
              <div className="grid grid-cols-3 divide-x divide-[#c9d8c5]/30 text-center">
                <div className="px-3 py-3">
                  <p className="text-xl font-bold">10k+</p>
                  <p className="text-[11px] uppercase tracking-wide text-[#dde8db]">Students</p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-xl font-bold">50+</p>
                  <p className="text-[11px] uppercase tracking-wide text-[#dde8db]">Experts</p>
                </div>
                <div className="px-3 py-3">
                  <p className="text-xl font-bold">24/7</p>
                  <p className="text-[11px] uppercase tracking-wide text-[#dde8db]">Support</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {FEATURE_BADGES.map(({ icon: Icon, text }) => (
                <div key={text} className="inline-flex items-center gap-2 rounded-lg bg-[#5a7653] px-3 py-2 text-sm text-[#edf3ec]">
                  <Icon className="h-4 w-4" /> {text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="p-8 lg:p-10"
        >
          <div className="mx-auto w-full max-w-xl">
            <h2 className="text-3xl text-[#2f2a22]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Create your account
            </h2>
            <p className="mt-2 text-sm text-[#6f6658]">
              Calm onboarding now. Complete extended profile details later.
            </p>

            <div className="mt-6 space-y-5">
              <SectionDivider label="Select Role" />
              <div className="grid gap-2 sm:grid-cols-3">
                {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => {
                  const isActive = form.role === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onRoleChange(value)}
                      disabled={loading}
                      className={`relative rounded-xl border p-3 text-left transition ${
                        isActive
                          ? "border-[#4a6741] bg-[#edf4ee] shadow-[0_0_0_2px_rgba(74,103,65,0.14)]"
                          : "border-[#ddd3c3] bg-[#faf8f4] hover:border-[#98ab93]"
                      } ${loading ? "opacity-60" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex rounded-full bg-[#e8efe7] p-1.5 text-[#4a6741]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full border transition ${
                            isActive
                              ? "border-[#4a6741] bg-[#4a6741] text-white"
                              : "border-[#b8af9f] bg-transparent text-transparent"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#2f2a22]">{label}</p>
                      <p className="mt-1 text-[11px] leading-snug text-[#7e7567]">{description}</p>
                    </button>
                  );
                })}
              </div>

              <SectionDivider label="Your Details" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4a443a]">Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    onKeyDown={onKeyDownSubmit}
                    className="w-full rounded-xl border border-[#d8cfbf] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#2f2a22] outline-none transition hover:border-[#b4ab9b] focus:border-[#4a6741]"
                    placeholder="John Doe"
                    disabled={loading}
                  />
                  {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4a443a]">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    onKeyDown={onKeyDownSubmit}
                    className="w-full rounded-xl border border-[#d8cfbf] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#2f2a22] outline-none transition hover:border-[#b4ab9b] focus:border-[#4a6741]"
                    placeholder="you@example.com"
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email}</p> : null}
                </div>
              </div>

              <SectionDivider label="Security" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4a443a]">Password</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={onChange}
                      onKeyDown={onKeyDownSubmit}
                      className="w-full rounded-xl border border-[#d8cfbf] bg-[#fffdf9] px-3 py-2.5 pr-10 text-sm text-[#2f2a22] outline-none transition hover:border-[#b4ab9b] focus:border-[#4a6741]"
                      placeholder="Minimum 6 characters"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition ${
                        showPassword ? "text-[#4a6741]" : "text-[#7f7668]"
                      }`}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4a443a]">Confirm Password</label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={onChange}
                      onKeyDown={onKeyDownSubmit}
                      className="w-full rounded-xl border border-[#d8cfbf] bg-[#fffdf9] px-3 py-2.5 pr-10 text-sm text-[#2f2a22] outline-none transition hover:border-[#b4ab9b] focus:border-[#4a6741]"
                      placeholder="Re-enter password"
                      disabled={loading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 transition ${
                        showConfirmPassword ? "text-[#4a6741]" : "text-[#7f7668]"
                      }`}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword ? <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p> : null}
                </div>
              </div>

              <div className="rounded-lg border border-[#ddd4c6] bg-[#f8f5ee] p-2.5">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#645b4e]">Password strength</p>
                  <p className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e1d9cb]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: strength.width, backgroundColor: strength.color }}
                  />
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${form.role === "admin" ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="rounded-xl border border-[#d7b26a] bg-[#fbf3df] p-3">
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-[#8c5e11]">
                                    <ShieldCheck size={16} />
                                    Admin Code
                                  </label>
                  <input
                    value={adminCode}
                    onChange={(event) => {
                      setAdminCode(event.target.value);
                      if (errors.adminCode) setErrors((prev) => ({ ...prev, adminCode: "" }));
                      if (serverError) setServerError("");
                    }}
                    onKeyDown={onKeyDownSubmit}
                    className="w-full rounded-lg border border-[#d7b26a] bg-white px-3 py-2.5 text-sm text-[#2f2a22] outline-none transition hover:border-[#bc9855] focus:border-[#ad7c22]"
                      placeholder="Enter admin code"
                    disabled={loading}
                  />
                  {errors.adminCode ? <p className="mt-1 text-xs text-red-600">{errors.adminCode}</p> : null}

                  <div className="mt-2 inline-flex w-full items-start gap-2 rounded-lg border border-[#e6c78f] bg-[#fff8e8] p-2 text-xs text-[#7a5a1f]">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                        This code grants elevated access. Use only authorized value from
                        <code className="mx-1 rounded bg-[#f3e2bf] px-1.5 py-0.5">VITE_ADMIN_CODE</code>
                        configuration.
                    </span>
                  </div>
                </div>
              </div>

              {serverError ? <p className="text-sm text-red-600">{serverError}</p> : null}

              <button
                type="button"
                onClick={onSubmit}
                disabled={loading}
                className="relative w-full overflow-hidden rounded-xl bg-[#2f4a2f] px-4 py-2.5 text-sm font-semibold text-[#f5f0e8] transition hover:bg-[#284125] disabled:opacity-60"
              >
                <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/35" />
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p className="text-center text-sm text-[#6f6658]">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-[#4a6741] hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#ddd3c3] bg-[#f8f4ec] p-4">
            <h3 className="text-sm font-semibold text-[#3b352d]">Signup flow details</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-[#6f6658]">
              <li>
                • Stores only identity + role with empty
                <code className="mx-1 rounded bg-[#ede4d5] px-1.5 py-0.5">profile</code>
                object
              </li>
              <li>
                • Counsellor details are added later in
                <code className="mx-1 rounded bg-[#ede4d5] px-1.5 py-0.5">Profile.jsx</code>
              </li>
                <li>
                  • Admin path validated against
                  <code className="mx-1 rounded bg-[#ede4d5] px-1.5 py-0.5">VITE_ADMIN_CODE</code>
                </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
