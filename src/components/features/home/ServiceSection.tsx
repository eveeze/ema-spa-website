// /src/components/features/home/ServicesSection.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import SectionTitle from "../../ui/SectionTitle";
import apiClient from "../../../api/apiClient";
import { Service } from "../../../types";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get("/service?isActive=true");

        if (response.data?.success && Array.isArray(response.data.data)) {
          // Limit to first 3 services for home page
          setServices(response.data.data.slice(0, 3));
        } else {
          setServices([]);
          setError("Format data tidak sesuai");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : typeof err === "object" &&
              err !== null &&
              "response" in err &&
              typeof (err as { response?: { data?: { message?: string } } })
                .response?.data?.message === "string"
            ? (err as { response: { data: { message: string } } }).response.data
                .message
            : "Gagal memuat layanan";
        setError(errorMessage);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Jangan render section kalau sudah selesai loading dan error / kosong
  if (!loading && (error || services.length === 0)) {
    return null;
  }

  const featured = services[0];
  const others = services.slice(1);

  return (
    <section className="relative overflow-hidden py-24">
      {/* Background selaras dengan hero */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-sky-50/70 to-sky-100/40" />
      <div className="pointer-events-none absolute -top-40 right-0 h-72 w-72 rounded-full bg-sky-100/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-pink-100/50 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-[url('/textures/noise.png')] mix-blend-soft-light" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* TITLE ZONE */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionTitle
            subtitle="Layanan Ema Mom Kids"
            title="Rangkaian Perawatan untuk Bunda & Si Kecil"
          />

          <p className="max-w-sm text-xs sm:text-sm text-slate-600 md:text-right leading-relaxed">
            Setiap layanan dirancang dengan fokus pada kenyamanan, keamanan,
            dan momen bonding yang hangat. Pilih perawatan yang paling sesuai
            dengan kebutuhan keluarga Anda.
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-200 border-t-sky-500" />
              <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-sky-500" />
            </div>
          </div>
        ) : (
          <>
            {featured && (
              <motion.div
                className="mt-14 grid gap-10 lg:grid-cols-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
              >
                {/* FEATURED SERVICE */}
                <motion.article
                  variants={cardVariants}
                  className="group relative overflow-hidden rounded-3xl bg-white shadow-xl border border-sky-100/60"
                >
                  <div className="absolute inset-0">
                    {featured.imageUrl ? (
                      <img
                        src={featured.imageUrl}
                        alt={featured.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400" />
                    )}
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/25 to-transparent" />

                  <div className="relative flex min-h-[360px] flex-col justify-end p-8 sm:p-9 lg:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/18 backdrop-blur px-3 py-1 text-[11px] font-semibold text-white uppercase tracking-[0.18em]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Layanan unggulan
                    </div>

                    <h3 className="mt-4 text-2xl sm:text-3xl lg:text-[2.1rem] font-semibold tracking-tight text-white">
                      {featured.name}
                    </h3>

                    <p className="mt-3 max-w-md text-sm sm:text-base text-slate-50/90 leading-relaxed">
                      {featured.description ||
                        "Perawatan premium yang dirancang untuk memberikan relaksasi lembut dan rasa aman bagi bayi dan Bunda."}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                      {featured.price && (
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-200">
                            Mulai dari
                          </p>
                          <p className="text-2xl sm:text-3xl font-semibold text-sky-200">
                            Rp {featured.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                      )}

                      <Link
                        to="/services"
                        className="inline-flex items-center rounded-full bg-white/95 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-md shadow-sky-200/40 transition-all duration-300 hover:bg-white hover:shadow-lg"
                      >
                        Jelajahi semua layanan
                        <span className="ml-2 translate-y-[1px] transition-transform group-hover:translate-x-1">
                          ↗
                        </span>
                      </Link>
                    </div>
                  </div>
                </motion.article>

                {/* OTHER SERVICES */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
                  {others.map((service, index) => (
                    <motion.article
                      key={service.id}
                      variants={cardVariants}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: 0.1 * (index + 1),
                      }}
                      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sky-100/70 bg-white shadow-md shadow-sky-100/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                    >
                      <div className="relative h-40 w-full overflow-hidden">
                        {service.imageUrl ? (
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100">
                            <Sparkles className="h-8 w-8 text-sky-400" />
                          </div>
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/15 to-transparent" />
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="mb-2 text-lg font-semibold text-slate-900">
                          {service.name}
                        </h3>
                        <p className="mb-4 text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {service.description ||
                            "Layanan berkualitas tinggi untuk mendukung kenyamanan dan relaksasi keluarga Anda."}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-4">
                          {service.price && (
                            <p className="text-sm font-semibold text-sky-700">
                              Rp {service.price.toLocaleString("id-ID")}
                            </p>
                          )}
                          <Link
                            to="/services"
                            className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors group"
                          >
                            Detail layanan
                            <span className="ml-1 translate-y-[1px] transition-transform group-hover:translate-x-1">
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}

                  {/* Kalau cuma ada 1 layanan */}
                  {others.length === 0 && (
                    <motion.div
                      variants={cardVariants}
                      className="flex flex-col justify-center rounded-2xl border border-dashed border-sky-200 bg-sky-50/40 p-6 text-sm text-sky-700"
                    >
                      Layanan lain sedang disiapkan. Nantikan paket perawatan
                      baru untuk Bunda &amp; si kecil.
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Kalau somehow tidak ada featured tapi services ada (edge case) */}
            {!featured && services.length > 0 && (
              <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <motion.article
                    key={service.id}
                    variants={cardVariants}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sky-100/70 bg-white shadow-md shadow-sky-100/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100">
                          <Sparkles className="h-8 w-8 text-sky-400" />
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/15 to-transparent" />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="mb-2 text-lg font-semibold text-slate-900">
                        {service.name}
                      </h3>
                      <p className="mb-4 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {service.description ||
                          "Layanan berkualitas tinggi untuk mendukung kenyamanan dan relaksasi keluarga Anda."}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-4">
                        {service.price && (
                          <p className="text-sm font-semibold text-sky-700">
                            Rp {service.price.toLocaleString("id-ID")}
                          </p>
                        )}
                        <Link
                          to="/services"
                          className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors group"
                        >
                          Detail layanan
                          <span className="ml-1 translate-y-[1px] transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </>
        )}

        {/* View All Services Button */}
        {!loading && services.length > 0 && (
          <div className="mt-14 text-center">
            <Link
              to="/services"
              className="inline-flex items-center rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-sky-300/60 transition-all duration-300 hover:shadow-xl hover:brightness-110"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Lihat Semua Layanan
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
