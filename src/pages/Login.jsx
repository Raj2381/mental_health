import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { loginUser, signInWithGoogle, handleGoogleRedirectResult, resetPassword } from "../services/auth.js";
import { Heart, Brain, Target, MessageCircle, BarChart2, CheckCircle, Eye, EyeOff } from "lucide-react";

const C = {
  sage: "#6B8F71",
  sagePale: "#EFF5F0",
  sageLight: "#D6E8D9",
  sand: "#F5F0E8",
  sandDark: "#E8DFD0",
  cream: "#FDFAF6",
  ink: "#2C2418",
  inkSoft: "#4A3F35",
  muted: "#8A7F74",
  stone: "#7A6F63",
  skyBlue: "#7BA7BC",
  skyPale: "#EAF2F6",
  lavender: "#9B8DB5",
  lavPale: "#F0EDF6",
};

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "11px 14px",
  borderRadius: 10,
  border: `1px solid ${hasError ? "#C9847E" : C.sandDark}`,
  background: "#fff",
  fontSize: 14,
  color: C.ink,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
});

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const rememberEmail = localStorage.getItem("rememberEmail");
    if (rememberEmail) {
      setEmail(rememberEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const handleRedirect = async () => {
      const result = await handleGoogleRedirectResult();
      if (!mounted || !result?.success || !result?.user) return;
      setSuccessMessage("Google sign-in successful! Redirecting...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 500);
    };
    handleRedirect();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!serverError) return undefined;
    const timer = setTimeout(() => setServerError(""), 5000);
    return () => clearTimeout(timer);
  }, [serverError]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = setTimeout(() => setSuccessMessage(""), 2000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const validateForm = () => {
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Invalid email format";
    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field, value) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setServerError("");
    setSuccessMessage("");
    if (!validateForm() || loading) return;
    setLoading(true);
    try {
      const result = await loginUser(email, password);
      if (!result.success) {
        setServerError(result.message || "Login failed. Please try again.");
        return;
      }
      if (rememberMe) localStorage.setItem("rememberEmail", email);
      else localStorage.removeItem("rememberEmail");
      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 500);
    } catch (error) {
      setServerError(error.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading && email && password) handleSubmit(e);
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setServerError("Enter your email");
      return;
    }
    setForgotLoading(true);
    setServerError("");
    setSuccessMessage("");
    const result = await resetPassword(email.trim());
    if (result.success) setSuccessMessage("Reset link sent to your email");
    else setServerError(result.message || "Failed to send reset email");
    setForgotLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);
    setServerError("");
    setSuccessMessage("");
    const result = await signInWithGoogle();
    if (result.redirected) {
      setGoogleLoading(false);
      return;
    }
    if (!result.success) {
      setServerError(result.message || "Google sign-in failed");
      setGoogleLoading(false);
      return;
    }
    setSuccessMessage("Google sign-in successful! Redirecting...");
    setTimeout(() => navigate("/dashboard", { replace: true }), 500);
    setGoogleLoading(false);
  };

  const features = [
    { icon: <Brain size={18} color={C.lavender} />, bg: C.lavPale, title: "Mental clarity", desc: "Track your emotional wellbeing daily" },
    { icon: <Target size={18} color={C.sage} />, bg: C.sagePale, title: "Goal tracking", desc: "Set and achieve your wellness goals" },
    { icon: <MessageCircle size={18} color={C.skyBlue} />, bg: C.skyPale, title: "Expert support", desc: "Connect with professional counsellors" },
    { icon: <BarChart2 size={18} color={C.sage} />, bg: C.sagePale, title: "Progress insights", desc: "Visualise your growth over time" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.cream, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 5%" }}>
      <div style={{ width: "100%", maxWidth: 1000 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.sage, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Heart size={18} color="#fff" />
              </div>
              <span style={{ fontFamily: "'Lora', serif", fontSize: 18, fontWeight: 600, color: C.ink }}>Wellness Hub</span>
            </div>
            <h1 style={{ fontFamily: "'Lora', serif", fontSize: 38, fontWeight: 600, color: C.ink, lineHeight: 1.25, margin: "0 0 14px" }}>
              Your wellness<br />
              <span style={{ color: C.sage }}>journey starts here.</span>
            </h1>
            <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.7, margin: "0 0 32px", maxWidth: 380 }}>
              Join thousands of students taking control of their mental health and personal growth.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {features.map(({ icon, bg, title, desc }) => (
                <motion.div key={title} whileHover={{ x: 4 }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: bg, borderRadius: 12, border: `1px solid ${C.sandDark}` }}>
                  <div style={{ flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{title}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ padding: "16px 20px", background: C.sagePale, borderRadius: 14, border: `1px solid ${C.sageLight}` }}>
              <p style={{ fontSize: 14, fontStyle: "italic", color: C.inkSoft, margin: "0 0 6px", lineHeight: 1.6 }}>
                "The greatest wealth is health." — Virgil
              </p>
              <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Start your wellness transformation today</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <div style={{ background: "#fff", borderRadius: 20, border: `1px solid ${C.sandDark}`, padding: "36px 32px", boxShadow: `0 4px 32px rgba(44,36,24,0.07)` }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: 26, fontWeight: 600, color: C.ink, margin: "0 0 6px" }}>Welcome back</h2>
                <p style={{ fontSize: 14, color: C.muted, margin: 0 }}>Sign in to access your wellness dashboard</p>
              </div>

              {serverError && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA", fontSize: 13, color: "#B91C1C" }}>
                  {serverError}
                </motion.div>
              )}

              {successMessage && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #86EFAC", fontSize: 13, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle size={16} />
                  {successMessage}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} onKeyPress={handleKeyPress} style={{ display: "flex", flexDirection: "column", gap: 16 }} noValidate>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.inkSoft, marginBottom: 6 }}>Email address</label>
                  <input type="email" placeholder="you@example.com" value={email} onChange={(e) => handleChange("email", e.target.value)} disabled={loading} autoComplete="email" style={inputStyle(errors.email)} onFocus={(e) => (e.target.style.borderColor = C.sage)} onBlur={(e) => (e.target.style.borderColor = errors.email ? "#C9847E" : C.sandDark)} />
                  {errors.email && <p style={{ fontSize: 12, color: "#C9847E", marginTop: 4 }}>{errors.email}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.inkSoft, marginBottom: 6 }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => handleChange("password", e.target.value)} onKeyPress={handleKeyPress} disabled={loading} autoComplete="current-password" style={inputStyle(errors.password)} onFocus={(e) => (e.target.style.borderColor = C.sage)} onBlur={(e) => (e.target.style.borderColor = errors.password ? "#C9847E" : C.sandDark)} />
                    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }} disabled={loading} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer", color: "#94857F", display: "flex", alignItems: "center", justifyContent: "center", padding: 4, opacity: loading ? 0.5 : 1, transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = C.sage)} onMouseLeave={(e) => (e.currentTarget.style.color = "#94857F")}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                  {errors.password && <p style={{ fontSize: 12, color: "#C9847E", marginTop: 4 }}>{errors.password}</p>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.stone, cursor: "pointer" }}>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} disabled={loading} style={{ accentColor: C.sage, width: 15, height: 15 }} />
                    Remember me
                  </label>
                  <button type="button" onClick={handleForgotPassword} disabled={forgotLoading} style={{ fontSize: 13, color: C.sage, textDecoration: "none", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif" }}>
                    {forgotLoading ? "Sending..." : "Forgot password?"}
                  </button>
                </div>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} style={{ width: "100%", padding: "12px", borderRadius: 10, background: C.sage, color: "#fff", border: "none", fontSize: 15, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
                  {loading ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} /> Signing in...</> : "Sign in"}
                </motion.button>
              </form>

              <button type="button" onClick={handleGoogleLogin} disabled={loading || googleLoading} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 10, background: "#fff", color: C.ink, border: `1px solid ${C.sandDark}`, fontSize: 14, fontWeight: 500, cursor: loading || googleLoading ? "not-allowed" : "pointer", opacity: loading || googleLoading ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}>
                {googleLoading ? "Connecting..." : "Continue with Google"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
                <div style={{ flex: 1, height: 1, background: C.sandDark }} />
                <span style={{ fontSize: 12, color: C.muted }}>New to Wellness Hub?</span>
                <div style={{ flex: 1, height: 1, background: C.sandDark }} />
              </div>

              <Link to="/signup" style={{ display: "block", width: "100%", padding: "11px", borderRadius: 10, border: `1px solid ${C.sandDark}`, background: C.sand, textAlign: "center", fontSize: 14, fontWeight: 500, color: C.inkSoft, textDecoration: "none" }}>
                Create an account
              </Link>
            </div>

            <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 16 }}>
              By signing in, you agree to our{" "}
              <button type="button" onClick={(e) => e.preventDefault()} style={{ color: C.sage, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                Terms of Service
              </button>{" "}and{" "}
              <button type="button" onClick={(e) => e.preventDefault()} style={{ color: C.sage, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
                Privacy Policy
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
