// /src/components/features/home/CtaSection.tsx
import React from "react";
import { motion } from "framer-motion";
import Button from "../../ui/Button";

const CtaSection: React.FC = () => {
  return (
    <section className="relative py-24">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{
            y: -6,
            scale: 1.01,
            transition: { duration: 0.4, ease: "easeOut" },
          }}
          className="relative overflow-hidden rounded-3xl bg-white/60 backdrop-blur-xl shadow-[0_18px_60px_rgba(30,64,110,0.16)] border border-white/50 text-center px-8 py-16 sm:px-12 sm:py-20"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-300/25 blur-3xl" />

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900"
          >
            Siap Manjakan Bunda &amp; Si Kecil?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
            className="mx-auto mt-4 max-w-xl text-base sm:text-lg md:text-xl leading-relaxed text-slate-600"
          >
            Hadirkan momen relaksasi penuh kehangatan, rasa aman, dan perhatian
            terbaik untuk keluarga Anda. Jadwalkan sesi spa dalam satu klik.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-10 flex justify-center"
          >
            <Button
              to="/booking"
              size="lg"
              variant="sky"
              className="shadow-xl shadow-sky-200/50 hover:shadow-2xl hover:shadow-sky-300/60 !px-10 !py-4 !text-lg"
            >
              Booking Sekarang
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
