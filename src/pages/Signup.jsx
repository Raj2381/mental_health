import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

// Simple admin code for signup elevation. In production, don't hardcode secrets.
const ADMIN_CODE = "RAJ123";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    if (!name.trim()) return "Name is required";
    if (!email.trim() || !email.includes("@")) return "Valid email is required";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password !== confirmPassword) return "Passwords do not match";
    if (adminCode && adminCode !== ADMIN_CODE) return "Invalid admin code";
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
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

      if (roleToSave === "admin") navigate("/dashboard/admin", { replace: true });
      else navigate("/dashboard/student", { replace: true });
    } catch (err) {
      setError(err?.message || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Create an account</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={onSubmit}>
          <label className="block text-sm">Full name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" />

          <label className="block text-sm">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" type="email" />

          <label className="block text-sm">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" type="password" />

          <label className="block text-sm">Confirm password</label>
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full border rounded px-3 py-2 mb-3" type="password" />

          <label className="block text-sm">Admin code (optional)</label>
          <input value={adminCode} onChange={(e) => setAdminCode(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" placeholder="Enter admin code if you have one" />

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-sm mt-4">
          Already have an account? <Link to="/login" className="text-green-600">Login</Link>
        </p>
      </div>
    </div>
  );
}
