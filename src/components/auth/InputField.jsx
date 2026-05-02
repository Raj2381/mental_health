import { motion } from "framer-motion";

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  autoComplete,
  name,
}) {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div variants={containerVariants} className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-300 ml-1">
          {label}
        </label>
      )}
      <motion.input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        name={name}
        whileFocus={{
          boxShadow: "0 0 20px rgba(20, 184, 166, 0.25)",
          scale: 1.02,
        }}
        className={`w-full px-4 py-3 rounded-lg bg-slate-700/30 border transition-all duration-300 placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? "border-red-500/50 focus:ring-red-500"
            : "border-slate-600 hover:border-slate-500"
        }`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 ml-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
