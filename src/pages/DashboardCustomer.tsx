// src/pages/CustomerDashboard.tsx
import { Link } from 'react-router-dom';
import { CalendarPlus, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useCustomerReservations } from '../hooks/useCustomerHooks';

const fadeInUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.35,
      ease: 'easeOut',
    },
  }),
};

const CustomerDashboard = () => {
  const { user } = useAuth();

  // upcoming only
  const {
    data: upcomingReservations,
    isLoading: isLoadingUpcoming,
    isError: isErrorUpcoming,
  } = useCustomerReservations('upcoming');

  // all reservations
  const {
    data: allReservations,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useCustomerReservations();

  const isLoading = isLoadingUpcoming || isLoadingAll;
  const isError = isErrorUpcoming || isErrorAll;

  const upcomingReservationsCount = upcomingReservations?.length ?? 0;
  const totalReservationsCount = allReservations?.length ?? 0;
  const nextReservation = upcomingReservations?.[0];

  const displayName = user?.name?.split(' ')[0] ?? user?.name ?? 'Bunda';

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  const renderSummaryCards = () => {
    if (isLoading) {
      return (
        <>
          {Array.from({ length: 2 }).map((_, index) => (
            <motion.div
              key={index}
              className="rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100"
              variants={fadeInUp}
              custom={index + 1}
            >
              <div className="mb-4 h-4 w-2/3 rounded-full bg-slate-100" />
              <div className="mb-3 h-8 w-1/3 rounded-full bg-slate-100" />
              <div className="h-3 w-full rounded-full bg-slate-100" />
            </motion.div>
          ))}
        </>
      );
    }

    if (isError) {
      return (
        <motion.div
          className="col-span-1 rounded-2xl bg-red-50 p-6 text-red-700 shadow-sm ring-1 ring-red-100 md:col-span-2 lg:col-span-2"
          variants={fadeInUp}
          custom={1}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-red-100 p-2">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Gagal memuat ringkasan reservasi.
              </p>
              <p className="mt-1 text-xs text-red-500">
                Silakan muat ulang halaman atau coba beberapa saat lagi.
              </p>
            </div>
          </div>
        </motion.div>
      );
    }

    return (
      <>
        {/* Upcoming count */}
        <motion.div
          className="rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-sky-100"
          variants={fadeInUp}
          custom={1}
          whileHover={{
            y: -3,
            boxShadow: '0 18px 45px rgba(56,189,248,0.20)',
          }}
          transition={{ duration: 0.22 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">
            Reservasi akan datang
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-slate-900">
              {upcomingReservationsCount}
            </span>
            <span className="text-sm text-slate-500">sesi terjadwal</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Sesi yang sudah Anda booking dan belum terlaksana.
          </p>
        </motion.div>

        {/* Total reservations */}
        <motion.div
          className="rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-sky-100"
          variants={fadeInUp}
          custom={2}
          whileHover={{
            y: -3,
            boxShadow: '0 18px 45px rgba(56,189,248,0.20)',
          }}
          transition={{ duration: 0.22 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">
            Total reservasi
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-semibold text-slate-900">
              {totalReservationsCount}
            </span>
            <span className="text-sm text-slate-500">kali kunjungan</span>
          </div>
          <Link
            to="/dashboard/reservations"
            className="mt-3 inline-flex items-center text-xs font-medium text-sky-600 hover:text-sky-700"
          >
            Lihat riwayat reservasi
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      <motion.div
        className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* HEADER */}
        <motion.header
          className="mb-8 flex flex-col gap-4 rounded-3xl bg-white/90 p-5 shadow-sm ring-1 ring-sky-100 md:flex-row md:items-center md:justify-between md:p-6"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
              Dashboard pelanggan
            </p>
            <h1 className="mt-2 text-balance text-2xl font-semibold text-slate-900 sm:text-3xl">
              Selamat datang kembali,{' '}
              <span className="bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                {displayName}
              </span>
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Pantau jadwal spa, lihat riwayat kunjungan, dan mulai reservasi
              baru untuk buah hati Anda.
            </p>
          </div>

          <div className="mt-2 inline-flex items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-xs text-slate-700 shadow-inner ring-1 ring-sky-100 md:mt-0">
            <div className="flex flex-col">
              <span className="font-semibold text-sky-700">
                {upcomingReservationsCount > 0
                  ? 'Anda punya jadwal yang akan datang'
                  : 'Belum ada jadwal spa berikutnya'}
              </span>
              <span className="text-[11px] text-slate-500">
                {upcomingReservationsCount > 0
                  ? 'Pastikan datang tepat waktu untuk pengalaman terbaik.'
                  : 'Yuk mulai reservasi pertama hari ini.'}
              </span>
            </div>
          </div>
        </motion.header>

        {/* SUMMARY GRID */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {renderSummaryCards()}

          {/* CTA – Buat reservasi */}
          <motion.div
            variants={fadeInUp}
            custom={3}
            initial="hidden"
            animate="visible"
          >
            <Link
              to="/services"
              className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 p-6 text-white shadow-lg"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-400/40 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-cyan-300/40 blur-3xl" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 shadow-inner">
                  <CalendarPlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100/90">
                    Reservasi baru
                  </p>
                  <h3 className="text-lg font-semibold leading-snug">
                    Buat Reservasi Spa
                  </h3>
                </div>
              </div>

              <p className="relative mt-4 text-sm text-sky-50/90">
                Pilih layanan favorit dan atur jadwal spa bayi & bunda hanya
                dalam beberapa langkah.
              </p>

              <div className="relative mt-4 inline-flex items-center text-xs font-semibold text-sky-50">
                Mulai reservasi
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </motion.div>
        </section>

        {/* NEXT RESERVATION */}
        <section className="mt-10">
          <motion.h2
            className="text-xl font-semibold text-slate-900 sm:text-2xl"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            Reservasi Berikutnya
          </motion.h2>

          <motion.div
            className="mt-4 rounded-3xl bg-white/95 p-5 shadow-md ring-1 ring-slate-100"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.5}
          >
            {isLoading && (
              <div className="flex h-24 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-sky-600" />
              </div>
            )}

            {!isLoading && isError && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <p>Tidak dapat memuat detail reservasi berikutnya.</p>
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {nextReservation ? (
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">
                        Sesi terdekat
                      </p>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {nextReservation.service?.name ||
                          'Layanan Tidak Diketahui'}
                      </h3>
                      <p className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarPlus className="h-4 w-4 text-sky-500" />
                        <span>
                          {formatDateTime(
                            nextReservation.session?.timeSlot?.startTime,
                          )}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Terapis:{' '}
                        <span className="font-medium text-slate-700">
                          {nextReservation.staff?.name ||
                            'Terapis belum ditentukan'}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <Link
                        to={`/dashboard/reservations/${nextReservation.id}`}
                        className="inline-flex items-center rounded-full border border-sky-200 px-4 py-2 text-xs font-medium text-sky-700 transition hover:border-sky-400 hover:bg-sky-50"
                      >
                        Lihat detail reservasi
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                      <Link
                        to="/services"
                        className="inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600"
                      >
                        Tambah reservasi lain
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                      <CalendarPlus className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      Belum ada reservasi berikutnya.
                    </p>
                    <p className="max-w-md text-xs text-slate-500">
                      Jadwalkan sesi spa baru untuk bayi dan bunda agar tubuh
                      lebih rileks dan nyaman.
                    </p>
                    <Link
                      to="/services"
                      className="mt-1 inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-600"
                    >
                      Buat reservasi sekarang
                    </Link>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
};

export default CustomerDashboard;
