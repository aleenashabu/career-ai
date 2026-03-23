import { motion } from "framer-motion";
import { Sparkles, Loader2, Zap, Star } from "lucide-react";

// This loader features a pulsing gradient orb, rotating colorful rings, and orbiting sparkles for a modern, premium UI look.
const StunningLoader = ({
  loading = true,
  message = "Loading...",
  subMessage = "Please wait while we process your request",
}) => {
  if (!loading) return null;

  // Main orb pulse animation
  const orbVariants = {
    animate: {
      scale: [1, 1.18, 1.05, 1],
      boxShadow: [
        "0 0 24px 4px hsl(var(--primary) / 0.3)",
        "0 0 40px 8px hsl(var(--primary) / 0.7)",
        "0 0 32px 6px hsl(var(--primary) / 0.5)",
        "0 0 24px 4px hsl(var(--primary) / 0.3)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  // Rotating ring animation
  const ringVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Orbiting particles
  const orbitParticles = [
    { Icon: Sparkles, color: "text-yellow-400", angle: 0 },
    { Icon: Zap, color: "text-blue-400", angle: 120 },
    { Icon: Star, color: "text-pink-400", angle: 240 },
  ];

  // Loader dots
  const dotVariants = {
    animate: i => ({
      y: [0, -12, 0],
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1,
        repeat: Infinity,
        delay: i * 0.3,
      },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-lg"
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Premium Orb Loader */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Rotating gradient ring */}
          <motion.div
            variants={ringVariants}
            animate="animate"
            className="absolute inset-0 rounded-full"
            style={{
              border: "6px solid transparent",
              background: "conic-gradient(from 0deg, hsl(var(--primary)) 0deg, hsl(var(--secondary)) 90deg, hsl(var(--primary)) 180deg, hsl(var(--accent)) 270deg, hsl(var(--primary)) 360deg)",
              zIndex: 1,
            }}
          />
          {/* Pulsing orb */}
          <motion.div
            variants={orbVariants}
            animate="animate"
            className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-primary via-secondary to-accent shadow-2xl flex items-center justify-center"
            style={{ zIndex: 2 }}
          >
            <Loader2 className="w-10 h-10 animate-spin text-white" />
          </motion.div>
          {/* Orbiting sparkles/icons */}
          {orbitParticles.map(({ Icon, color, angle }, i) => (
            <motion.div
              key={i}
              animate={{
                rotate: [angle, angle + 360],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "28px",
                height: "28px",
                marginLeft: "-14px",
                marginTop: "-14px",
                transform: `rotate(${angle}deg) translateX(64px) rotate(-${angle}deg)`,
                zIndex: 3,
              }}
            >
              <Icon className={`w-full h-full ${color} drop-shadow-lg`} />
            </motion.div>
          ))}
        </div>

        {/* Loading Text + Animated Dots */}
        <div className="text-center space-y-3">
          <motion.h2
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [1, 1.06, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-2xl font-bold text-foreground"
          >
            {message}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground max-w-sm mx-auto"
          >
            {subMessage}
          </motion.p>
          <div className="flex justify-center gap-2 mt-2">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                custom={i}
                variants={dotVariants}
                animate="animate"
                className="w-3 h-3 bg-primary rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StunningLoader;