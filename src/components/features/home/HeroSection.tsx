// /src/components/features/home/HeroSection.tsx
import React from "react";
import { motion } from "framer-motion";
import Button from "../../ui/Button";

const HeroSection: React.FC = () => {
  return (
    <section
      className="relative bg-cover bg-center h-screen flex items-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100"
      style={{ backgroundImage: "url('/src/assets/images/hero-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-white bg-opacity-80"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-slate-800 leading-tight mb-6"
        >
          Perawatan Penuh Cinta <br />
          <span className="text-blue-600">untuk Si Kecil & Bunda</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
        >
          Rasakan pengalaman spa yang menenangkan dan bermanfaat bagi tumbuh
          kembang buah hati Anda, ditangani oleh terapis profesional dan
          berpengalaman.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row justify-center gap-6"
        >
          <Button
            to="/booking"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Booking Jadwal
          </Button>
          <Button
            to="/services"
            className="bg-white text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Lihat Layanan
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
