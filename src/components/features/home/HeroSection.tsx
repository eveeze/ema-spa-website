// /src/components/features/home/HeroSection.tsx
import React from "react";
import { motion } from "framer-motion";
import Button from "../../ui/Button";

const containerVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Soft gradients khusus hero (tipis & fade, tidak ubah warna dasar) */}
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-64 bg-gradient-to-b from-sky-100/80 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 md:py-24 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
        {/* LEFT: copy + CTA */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[52%]"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-sky-200/70 bg-white/80 px-4 py-1.5 text-xs font-semibold text-sky-700 shadow-sm backdrop-blur"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Ema Mom Kids · Spa Bayi &amp; Ibu</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mt-6 text-balance font-bold tracking-tight text-slate-900 text-3xl sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.05]"
          >
            Perjalanan Spa Nyaman
            <span className="block bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              di Ruang yang Hangat &amp; Tenang
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 max-w-xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-600"
          >
            Fasilitas yang bersih, tim terapis berpengalaman, dan suasana
            menenangkan untuk mendukung bonding Bunda dan si kecil. Pesan jadwal
            secara online dan tiba tanpa perlu menunggu lama.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Button
              to="/services"
              size="lg"
              variant="sky"
              className="shadow-lg shadow-sky-200/70 hover:shadow-xl hover:shadow-sky-300/70 transition-all"
            >
              Booking Spa Sekarang
            </Button>

            <a
              href="https://maps.app.goo.gl/QmbiCAzg4RXp95NZA"
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Lihat lokasi di Maps
              <span className="ml-1.5 inline-block translate-y-[1px] transition-transform group-hover:translate-x-1 group-hover:-translate-y-[1px]">
                ↗
              </span>
              <span className="sr-only">Buka lokasi di Google Maps</span>
            </a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500"
          >
            <span>✓ Ruang tunggu nyaman untuk keluarga</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
            <span>✓ Reservasi fleksibel &amp; terkonfirmasi otomatis</span>
          </motion.div>
        </motion.div>

        {/* RIGHT: real photo card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-full lg:w-[48%]"
        >
          <motion.div
            whileHover={{
              y: -8,
              rotate: -0.7,
              transition: { duration: 0.4, ease: "easeOut" },
            }}
            className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/70 bg-slate-900/80 shadow-[0_28px_80px_rgba(15,23,42,0.45)]"
          >
            <img
              src="/ema-facade.jpg"
              alt="Fasad Ema Mom Kids Baby Spa"
              className="h-80 w-full object-cover sm:h-96"
            />

            <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center rounded-full bg-sky-50/90 px-3 py-1 text-[11px] font-semibold text-sky-800 shadow-sm backdrop-blur">
              Fasad Ema Mom Kids Baby Spa
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent px-4 pb-4 pt-16 text-slate-50">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-200">
                      Lokasi Spa
                    </p>
                    <p className="text-sm font-semibold">
                      Sawit, Boyolali, Jawa Tengah
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-semibold text-emerald-50">
                    ● Buka hari ini
                  </span>
                </div>
                <p className="text-[11px] text-slate-200/90">
                  Jalan Pengging Sanggung, Dusun Kebatan RT.06/RW.02, Jenengan. Area nyaman dengan ruang tunggu luas untuk keluarga.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
