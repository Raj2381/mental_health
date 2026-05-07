import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { motion as Motion } from "framer-motion";
import { Heart, Eye, EyeOff, CheckCircle, ArrowRight, Sparkles, Shield, BookOpen, Stethoscope, Lock } from "lucide-react";

// Simple admin code for signup elevation. In production, don't hardcode secrets.
const ADMIN_CODE = "RAJ123";

/* ─── DESIGN TOKENS (matching Landing.jsx) ───────────────────── */
const C = {
  sage: "#6B8F71",
  sageMid: "#4A6E50",
  sagePale: "#EFF5F0",
  sageLight: "#D6E8D9",
  sand: "#F5F0E8",
  sandDark: "#E8DFD0",
  cream: "#FDFAF6",
  stone: "#7A6F63",
  stoneMid: "#5A5048",
  ink: "#2C2418",
  inkSoft: "#4A3F35",
  muted: "#8A7F74",
  blush: "#C9847E",
  blushPale: "#F5ECEA",
  skyBlue: "#7BA7BC",
  skyPale: "#EAF2F6",
  lavender: "#9B8DB5",
  lavPale: "#F0EDF6",
  gold: "#C4A35A",
  goldPale: "#F7F0E0",
  error: "#D94C4C",
  errorLight: "#FADEDE",
};

export default function Signup() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("student"); // "student", "counsellor", "admin"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function validate() {
    if (!name.trim()) return "Name is required";
    if (!email.trim() || !email.includes("@")) return "Valid email is required";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (selectedRole === "admin" && adminCode && adminCode !== ADMIN_CODE) return "Invalid admin code";
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      // Keep Firebase auth as-is
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // Determine role only from the admin code check. Do NOT trust any role value
      // that may come from the UI - we derive the role here.
      const roleToSave = adminCode === ADMIN_CODE ? "admin" : "student";

      // Store user record in Firestore with the computed role
      await setDoc(doc(db, "users", userCred.user.uid), {
        name: name.trim(),
        email: email.trim(),
        role: roleToSave,
        profile: {},
        createdAt: serverTimestamp(),
      });

      // Save minimal local state and navigate
      localStorage.setItem("user", JSON.stringify({ id: userCred.user.uid, name, email, role: roleToSave }));
      localStorage.setItem("auth_token", userCred.user.uid);

      setSuccessMessage("Welcome! Redirecting to your dashboard...");
      setTimeout(() => {
        if (roleToSave === "admin") navigate("/dashboard/admin", { replace: true });
        else navigate("/dashboard/student", { replace: true });
      }, 1500);
    } catch (err) {
      setError(err?.message || "Signup failed");
      setLoading(false);
    }
  };

  // Auto-clear error after 5 seconds
  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", display: "flex" }}>
      {/* ── LEFT SIDE: Inspirational Content (Hidden on mobile) ─── */}
      <Motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          flex: 1,
          background: `linear-gradient(135deg, ${C.sagePale} 0%, ${C.skyPale} 100%)`,
          padding: "60px 50px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 40,
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden lg:flex"
      >
        {/* Decorative blob elements */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.sageLight}40 0%, transparent 70%)`,
            top: "-100px",
            right: "-100px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.lavPale}30 0%, transparent 70%)`,
            bottom: "-50px",
            left: "-50px",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10 }}>
          <Motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: C.sage,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Heart size={20} color="#fff" />
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: C.ink, fontFamily: "'Lora', serif" }}>
                Wellness Hub
              </span>
            </div>
          </Motion.div>

          <Motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: C.ink,
              margin: "0 0 16px",
              lineHeight: 1.3,
              fontFamily: "'Lora', serif",
            }}
          >
            Start your wellness
            <br />
            <span style={{ color: C.sage }}>journey today.</span>
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, marginBottom: 32, maxWidth: 420 }}
          >
            A calm space for students to track their wellbeing, connect with counsellors, and build healthier habits — at their own pace.
          </Motion.p>

          {/* Trust indicators */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {[
              "Anonymous & fully private",
              "Real counsellors, real support",
              "No fees, no subscriptions",
            ].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.stone }}>
                <CheckCircle size={16} color={C.sage} strokeWidth={2.5} />
                <span>{t}</span>
              </div>
            ))}
          </Motion.div>
        </div>

        {/* Stats card */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(10px)",
            borderRadius: 16,
            padding: 24,
            border: `1px solid rgba(255,255,255,0.8)`,
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 500 }}>
                TRUSTED BY
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.sageMid, fontFamily: "'Lora', serif" }}>
                12,000+
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Students</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontWeight: 500 }}>
                FEEL BETTER
              </div>
              <div style={{ fontSize: 26, fontWeight: 700, color: C.sage, fontFamily: "'Lora', serif" }}>
                98%
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Report improvement</div>
            </div>
          </div>
        </Motion.div>
      </Motion.div>

      {/* ── RIGHT SIDE: Signup Form ────────────────────────────── */}
      <Motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          minHeight: "100vh",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                background: C.sagePale,
                borderRadius: 20,
                border: `1px solid ${C.sageLight}`,
                fontSize: 12,
                color: C.sageMid,
                fontWeight: 500,
                marginBottom: 16,
              }}
            >
              <Sparkles size={13} /> Welcome to your wellness space
            </Motion.div>

            <Motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              style={{
                fontSize: "clamp(28px, 6vw, 36px)",
                fontWeight: 600,
                color: C.ink,
                margin: 0,
                lineHeight: 1.3,
                fontFamily: "'Lora', serif",
              }}
            >
              Create your free account
            </Motion.h2>
          </div>

          {/* Error message */}
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: error ? 1 : 0, y: error ? 0 : -10 }}
            transition={{ duration: 0.3 }}
            style={{
              marginBottom: error ? 20 : 0,
              height: error ? "auto" : 0,
              overflow: "hidden",
            }}
          >
            {error && (
              <div
                style={{
                  background: C.errorLight,
                  border: `1px solid ${C.error}`,
                  color: C.error,
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}
          </Motion.div>

          {/* Success message */}
          {successMessage && (
            <Motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                marginBottom: 20,
                background: C.sagePale,
                border: `1px solid ${C.sageLight}`,
                color: C.sageMid,
                padding: "12px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {successMessage}
            </Motion.div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit}>
            {/* ROLE SELECTOR SECTION */}
            <Motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ marginBottom: 28 }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.ink,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Select your role
              </label>

              {/* Role cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { id: "student", icon: BookOpen, label: "Student", desc: "Track wellness & access support" },
                  { id: "counsellor", icon: Stethoscope, label: "Counsellor", desc: "Help students & manage sessions" },
                  { id: "admin", icon: Lock, label: "Admin", desc: "Manage platform & users" },
                ].map(({ id, icon: Icon, label, desc }) => (
                  <Motion.button
                    key={id}
                    type="button"
                    onClick={() => setSelectedRole(id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      padding: "14px 12px",
                      borderRadius: 12,
                      border: `2px solid ${selectedRole === id ? C.sage : C.sandDark}`,
                      background: selectedRole === id ? C.sagePale : "#fff",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedRole !== id) {
                        e.currentTarget.style.borderColor = C.sageLight;
                        e.currentTarget.style.background = C.cream;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedRole !== id) {
                        e.currentTarget.style.borderColor = C.sandDark;
                        e.currentTarget.style.background = "#fff";
                      }
                    }}
                  >
                    {/* Glow effect for selected */}
                    {selectedRole === id && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `radial-gradient(circle, ${C.sage}20 0%, transparent 70%)`,
                          pointerEvents: "none",
                        }}
                      />
                    )}

                    <Icon size={20} color={selectedRole === id ? C.sage : C.muted} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, textAlign: "center" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, textAlign: "center", lineHeight: 1.4 }}>
                      {desc}
                    </div>
                  </Motion.button>
                ))}
              </div>
            </Motion.div>

            {/* Role-specific helper text */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              style={{
                padding: "12px 14px",
                background: selectedRole === "student" ? C.sagePale : selectedRole === "counsellor" ? C.skyPale : C.lavPale,
                border: `1px solid ${selectedRole === "student" ? C.sageLight : selectedRole === "counsellor" ? "#D6E8D9" : "#E8E0F0"}`,
                borderRadius: 10,
                fontSize: 12,
                color: selectedRole === "student" ? C.sageMid : selectedRole === "counsellor" ? C.skyBlue : C.lavender,
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Sparkles size={14} />
              <span>
                {selectedRole === "student"
                  ? "Track your mental wellness journey safely and privately."
                  : selectedRole === "counsellor"
                    ? "Create a professional counsellor account to support students. Verified professionals only."
                    : "Admin access requires verification. Enter your access code below."}
              </span>
            </Motion.div>

            {/* Name field */}
            <Motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ marginBottom: 18 }}
            >
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.ink,
                  marginBottom: 8,
                }}
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === "counsellor" ? "Dr. Sarah Johnson" : "Priya Sharma"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 14,
                  border: `1.5px solid ${C.sandDark}`,
                  borderRadius: 12,
                  fontFamily: "inherit",
                  background: "#fff",
                  color: C.ink,
                  transition: "all 0.3s ease",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.sage)}
                onBlur={(e) => (e.target.style.borderColor = C.sandDark)}
              />
            </Motion.div>

            {/* Email field */}
            <Motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
              style={{ marginBottom: 18 }}
            >
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.ink,
                  marginBottom: 8,
                }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === "counsellor" ? "sarah@counselling.org" : "priya@university.edu"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  fontSize: 14,
                  border: `1.5px solid ${C.sandDark}`,
                  borderRadius: 12,
                  fontFamily: "inherit",
                  background: "#fff",
                  color: C.ink,
                  transition: "all 0.3s ease",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = C.sage)}
                onBlur={(e) => (e.target.style.borderColor = C.sandDark)}
              />
            </Motion.div>

            {/* Password field */}
            <Motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{ marginBottom: 18 }}
            >
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.ink,
                  marginBottom: 8,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 14px",
                    fontSize: 14,
                    border: `1.5px solid ${C.sandDark}`,
                    borderRadius: 12,
                    fontFamily: "inherit",
                    background: "#fff",
                    color: C.ink,
                    transition: "all 0.3s ease",
                    outline: "none",
                    paddingRight: "40px",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.sage)}
                  onBlur={(e) => (e.target.style.borderColor = C.sandDark)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.muted,
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.sage)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Motion.div>

            {/* Confirm password field */}
            <Motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              style={{ marginBottom: 18 }}
            >
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: C.ink,
                  marginBottom: 8,
                }}
              >
                Confirm password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 14px",
                    fontSize: 14,
                    border: `1.5px solid ${C.sandDark}`,
                    borderRadius: 12,
                    fontFamily: "inherit",
                    background: "#fff",
                    color: C.ink,
                    transition: "all 0.3s ease",
                    outline: "none",
                    paddingRight: "40px",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.sage)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = C.sandDark)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.muted,
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.sage)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Motion.div>

            {/* Admin code field - ONLY visible when admin role selected */}
            {selectedRole === "admin" && (
              <Motion.div
                initial={{ opacity: 0, y: 15, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -15, height: 0 }}
                transition={{ duration: 0.4 }}
                style={{ marginBottom: 18, overflow: "hidden" }}
              >
                <label
                  htmlFor="adminCode"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 500,
                    color: C.ink,
                    marginBottom: 8,
                  }}
                >
                  Admin Access Code{" "}
                  <span style={{ color: C.error, fontWeight: 600 }}>*</span>
                </label>
                <input
                  id="adminCode"
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Enter your admin access code"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    fontSize: 14,
                    border: `1.5px solid ${C.sandDark}`,
                    borderRadius: 12,
                    fontFamily: "inherit",
                    background: "#fff",
                    color: C.ink,
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = C.sage)}
                  onBlur={(e) => (e.target.style.borderColor = C.sandDark)}
                />
                <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                  Required to create an admin account. Contact system administrator if you don't have one.
                </div>
              </Motion.div>
            )}

            {/* Submit button */}
            <Motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: selectedRole === "admin" ? 0.75 : 0.7, duration: 0.5 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 16px",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                background: loading ? C.muted : C.sage,
                border: "none",
                borderRadius: 12,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? `Creating your ${selectedRole} account...` : <>Create free account <ArrowRight size={16} /></>}
            </Motion.button>

            {/* Security notice */}
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                color: C.muted,
                marginTop: 14,
                justifyContent: "center",
              }}
            >
              <Shield size={13} color={C.sage} />
              Your data is encrypted and secure
            </Motion.div>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "28px 0",
              color: C.muted,
              fontSize: 13,
            }}
          >
            <div style={{ flex: 1, height: 1, background: C.sandDark }} />
            or
            <div style={{ flex: 1, height: 1, background: C.sandDark }} />
          </div>

          {/* Login link */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            style={{
              textAlign: "center",
              fontSize: 14,
              color: C.muted,
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: C.sage,
                fontWeight: 600,
                textDecoration: "none",
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.sageMid)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.sage)}
            >
              Sign in
            </Link>
          </Motion.div>

          {/* Terms notice */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{
              fontSize: 11,
              color: C.muted,
              textAlign: "center",
              marginTop: 14,
              lineHeight: 1.6,
            }}
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
          </Motion.div>
        </div>
      </Motion.div>
    </div>
  );
}
