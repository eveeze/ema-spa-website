// src/components/layout/PageTransition.tsx
import { motion } from "framer-motion";
import type React from "react";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const PageTransition: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  );
};

export default PageTransition;
