import { motion, AnimatePresence } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";

const LoadingOverlay = ({ 
  loading = false, 
  message = "Analyzing your skills… Please wait.",
  showBlur = true 
}) => {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 ${
            showBlur ? 'backdrop-blur-sm' : ''
          }`}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-card border border-border rounded-lg p-8 shadow-lg max-w-sm w-full mx-4"
          >
            <div className="flex flex-col items-center space-y-6">
              {/* Animated Loader */}
              <div className="relative">
                {/* Rotating gradient ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="w-16 h-16 rounded-full border-4 border-muted"
                  style={{
                    borderTopColor: 'hsl(var(--primary))',
                    borderRightColor: 'hsl(var(--primary) / 0.6)',
                    borderBottomColor: 'transparent',
                    borderLeftColor: 'transparent'
                  }}
                />
                
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Brain className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>
              </div>

              {/* Pulsing dots */}
              <div className="flex space-x-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: index * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                ))}
              </div>

              {/* Loading message */}
              <div className="text-center space-y-2">
                <motion.h3
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-lg font-semibold text-foreground"
                >
                  Processing...
                </motion.h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  {message}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;