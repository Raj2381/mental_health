import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase";
import { db } from "../firebase";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("student");

  useEffect(() => {
    let mounted = true;

    const loadRole = async () => {
      if (!auth.currentUser?.uid) return;
      try {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (mounted && userSnap.exists()) {
          setRole((userSnap.data()?.role || "student").toLowerCase());
        }
      } catch (error) {
        console.error("Failed to load user role", error);
      }
    };

    loadRole();
    return () => {
      mounted = false;
    };
  }, []);

  const studentMenu = [
    { name: "Dashboard", path: "/dashboard/student" },
    { name: "Assessment", path: "/assessment" },
    { name: "Attendance", path: "/attendance" },
    { name: "Progress", path: "/progress" },
    { name: "Progress & Rewards", path: "/progress-and-rewards" }
  ];
  const counsellorMenu = [
    { name: "Counsellor Dashboard", path: "/dashboard/counsellor" },
  ];
  const menu = role === "counsellor" ? counsellorMenu : studentMenu;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear stored session data
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
    <div className="h-screen w-64 bg-gradient-to-b from-blue-600 to-purple-700 text-white flex flex-col p-5">

      {/* Logo */}
      <h1 className="text-2xl font-bold mb-8">Wellness Hub</h1>

      {/* Menu */}
      <nav className="space-y-3">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-white text-blue-600 font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold"
        >
          Logout
        </button>

        <p className="text-sm text-white/70 mt-3 text-center">
          Stay consistent 💪
        </p>
      </div>
    </div>
  );
}
