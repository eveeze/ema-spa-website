// src/pages/Services.tsx
import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { Gem, AlertCircle, Sparkles } from "lucide-react";
import { Service } from "../types";
import ServiceCard from "../components/ServiceCard";
import { motion, AnimatePresence } from "framer-motion";

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchServices = async () => {
      try {
        const response = await apiClient.get("/service?isActive=true");

        if (response.data?.success && Array.isArray(response.data.data)) {
          if (isMounted) {
            setServices(response.data.data);
          }
        } else {
          if (isMounted) {
            setServices([]);
            setError("Format data tidak sesuai.");
          }
        }
      } catch (err: unknown) {
        let errorMessage = "Gagal memuat layanan. Silakan coba lagi nanti.";

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as Record<string, unknown>).response === "object"
        ) {
          const response = (
            err as { response?: { data?: { message?: string } } }
          ).response;
          if (response?.data?.message) {
            errorMessage = response.data.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        if (isMounted) {
          setError(errorMessage);
          setServices([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchServices();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasServices = services.length > 0;
  const isEmpty = !loading && !error && !hasServices;

  return (
    <main className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <header className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
            <Sparkles className="h-3.5 w-3.5" />
            Layanan Ema Mom Kids
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Pilih Perawatan yang Tepat untuk Keluarga
              </h1>
              <p className="mt-2 max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
                Rangkaian layanan spa bayi, anak, dan ibu yang dirancang untuk
                memberikan rasa nyaman, aman, dan momen bonding yang hangat.
              </p>
            </div>

            {hasServices && (
              <div className="mt-2 sm:mt-0 flex justify-start sm:justify-end">
                <div className="inline-flex items-center rounded-full border border-sky-100 bg-white px-4 py-2 text-xs sm:text-sm shadow-sm">
                  <Sparkles className="mr-2 h-4 w-4 text-sky-500" />
                  <span className="font-medium text-sky-700">
                    {services.length} layanan aktif tersedia
                  </span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* STATES */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* Skeleton grid biar layout gak lompat-lompat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-sky-100/70 bg-white/60 p-4 shadow-sm"
                  >
                    <div className="h-40 w-full rounded-xl bg-slate-100 animate-pulse" />
                    <div className="mt-4 h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
                    <div className="mt-2 h-3 w-full rounded bg-slate-100 animate-pulse" />
                    <div className="mt-2 h-3 w-5/6 rounded bg-slate-100 animate-pulse" />
                    <div className="mt-4 h-4 w-1/3 rounded bg-slate-100 animate-pulse" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex justify-center py-16 sm:py-20"
            >
              <div className="max-w-md rounded-2xl bg-white p-10 shadow-xl border border-slate-100 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
                  <AlertCircle className="h-10 w-10 text-rose-500" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                  Oops! Ada masalah
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mb-8 leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-7 py-2.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-sky-300/60 transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl"
                >
                  Coba lagi
                </button>
              </div>
            </motion.div>
          )}

          {!loading && !error && isEmpty && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex justify-center py-16 sm:py-20"
            >
              <div className="max-w-md rounded-2xl bg-white p-10 shadow-xl border border-slate-100 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-sky-50">
                  <Gem className="h-12 w-12 text-sky-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                  Layanan segera hadir
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8">
                  Kami sedang mempersiapkan rangkaian perawatan terbaik untuk
                  Anda. Silakan kembali lagi dalam waktu dekat.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-2.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-sky-300/60 transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl"
                >
                  Periksa kembali
                </button>
              </div>
            </motion.div>
          )}

          {!loading && !error && hasServices && (
            <motion.div
              key="grid"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  className="h-full"
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default ServicesPage;
