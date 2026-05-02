import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await signOut(auth);
      // clear any stored session data
      try { localStorage.removeItem("token"); } catch (e) {}
      try { localStorage.removeItem("user"); } catch (e) {}
      try { localStorage.removeItem("auth_token"); } catch (e) {}
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="w-64 bg-white h-screen p-4 shadow border-r border-slate-200 sticky top-0">
      <h2 className="text-xl font-bold mb-1">Counsellor</h2>
      <p className="text-xs text-slate-500 mb-6">Wellness Console</p>

      <div className="space-y-2">
        <button className="w-full text-left px-3 py-2 rounded-lg bg-slate-900 text-white">Dashboard</button>
      </div>

      <button
        onClick={logout}
        className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
}
