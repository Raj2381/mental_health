import { motion } from "framer-motion";

export default function RoleSelector({ selectedRole, onRoleChange, disabled }) {
  const roles = [
    {
      id: "student",
      label: "Student",
      description: "Wellness & wellness tools",
      icon: "🌱",
    },
    {
      id: "counsellor",
      label: "Counsellor",
      description: "Support & guide students",
      icon: "💚",
    },
    {
      id: "admin",
      label: "Admin",
      description: "System management",
      icon: "⚙️",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      <label className="block text-sm font-medium text-slate-300">
        Select Your Role
      </label>
      <div className="grid grid-cols-3 gap-3">
        {roles.map((role) => (
          <motion.button
            key={role.id}
            type="button"
            onClick={() => onRoleChange(role.id)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              selectedRole === role.id
                ? "border-teal-500 bg-teal-500/10 ring-2 ring-teal-500/30"
                : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-2xl mb-2">{role.icon}</div>
            <div className="text-sm font-semibold text-white">{role.label}</div>
            <div className="text-xs text-slate-400 mt-1">{role.description}</div>

            {selectedRole === role.id && (
              <motion.div
                layoutId="roleSelector"
                className="absolute inset-0 rounded-xl border-2 border-teal-500"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
