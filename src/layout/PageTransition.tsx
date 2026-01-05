// src/components/layout/PageTransition.tsx
import { motion } from "framer-motion";
import type React from "react";

// Variabel animasi dipisah agar lebih bersih
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10, // Jarak dikurangi (12 -> 10) agar gerakan lebih cepat sampai
    scale: 0.99, // Sedikit scaling memberikan efek "muncul" yang lebih dinamis
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    y: -10, // Gerakan keluar sedikit saja agar tidak mengganggu mata
    scale: 0.99,
    transition: {
      duration: 0.1, // EXIT SANGAT CEPAT: Ini kuncinya agar tidak menunggu lama
      ease: "easeIn",
    },
  },
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
        type: "tween",
        ease: "circOut", // Menggunakan circOut agar terasa cepat di awal, pelan di akhir
        duration: 0.25, // Dipercepat dari 0.35 ke 0.25
        staggerChildren: 0.1, // Jika ada animasi child, ini membantu
      }}
      // will-change membantu browser merender animasi menggunakan GPU (lebih mulus)
      style={{ willChange: "opacity, transform" }}
      className="min-h-screen w-full" // Pastikan width full
    >
      {children}
    </motion.main>
  );
};

export default PageTransition;
