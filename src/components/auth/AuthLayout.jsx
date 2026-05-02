import { motion } from "framer-motion";

export default function AuthLayout({ children, variant = "login" }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-wellness-cream via-nature-sand to-wellness-stone flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* LEFT SIDE - Branding */}
          <motion.div
            variants={itemVariants}
            className="hidden lg:block text-wellness-moss"
          >
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-wellness-olive via-nature-warm to-wellness-sage bg-clip-text text-transparent mb-3">
                  Student Wellness Hub
                </h1>
                <p className="text-xl text-wellness-earth font-light">
                  Balance your mind. Fuel your life.
                </p>
              </div>

              <div className="space-y-6 mt-12">
                {[
                  { icon: "🌿", text: "Real-time wellness tracking" },
                  { icon: "💚", text: "Personalized guidance" },
                  { icon: "🤝", text: "Secure counselor support" },
                  { icon: "📈", text: "Progress & growth insights" },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 text-wellness-sage"
                    whileHover={{ x: 8 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-wellness-olive to-nature-warm flex items-center justify-center text-white font-bold flex-shrink-0">
                      {feature.icon}
                    </div>
                    <span className="text-base">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Decorative gradient blob */}
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-r from-wellness-olive/20 to-nature-warm/20 rounded-full blur-3xl opacity-20 pointer-events-none" />
            </div>
          </motion.div>

          {/* RIGHT SIDE - Form */}
          <motion.div
            variants={itemVariants}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
