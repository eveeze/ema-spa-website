import { useState } from 'react';
import {
  Loader2,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Clock,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerReservations } from '../hooks/useCustomerHooks';
import type { Reservation } from '../types';

/**
 * Mapping status → label & style (lebih subtle, bukan blok warna besar)
 */
const STATUS_CONFIG: Record<
  Reservation['status'],
  {
    label: string;
    dotClass: string;
    chipClass: string;
  }
> = {
  PENDING: {
    label: 'Menunggu pembayaran',
    dotClass: 'bg-amber-400',
    chipClass: 'border-amber-300 text-amber-700 bg-amber-50/60',
  },
  CONFIRMED: {
    label: 'Terkonfirmasi',
    dotClass: 'bg-sky-500',
    chipClass: 'border-sky-300 text-sky-700 bg-sky-50/70',
  },
  IN_PROGRESS: {
    label: 'Sedang berlangsung',
    dotClass: 'bg-indigo-500',
    chipClass: 'border-indigo-300 text-indigo-700 bg-indigo-50/70',
  },
  COMPLETED: {
    label: 'Selesai',
    dotClass: 'bg-emerald-500',
    chipClass: 'border-emerald-300 text-emerald-700 bg-emerald-50/60',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    dotClass: 'bg-rose-500',
    chipClass: 'border-rose-300 text-rose-700 bg-rose-50/70',
  },
  EXPIRED: {
    label: 'Kedaluwarsa',
    dotClass: 'bg-slate-400',
    chipClass: 'border-slate-300 text-slate-600 bg-slate-50/80',
  },
};

/**
 * 1 kartu reservasi – fokus ke layout & micro-interaction
 */
const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[reservation.status];

  const startTime = reservation.session?.timeSlot?.startTime;
  const formattedDate = new Date(startTime || Date.now()).toLocaleString(
    'id-ID',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );

  const shortId = reservation.id.slice(0, 8) + '…';
  const isPending = reservation.status === 'PENDING';

  const goDetail = () => navigate(`/dashboard/reservations/${reservation.id}`);

  return (
    <motion.article
      layout
      onClick={goDetail}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      whileHover={{
        y: -2,
        boxShadow: '0 18px 40px rgba(15,23,42,0.12)',
      }}
      whileTap={{ scale: 0.99 }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white/95 px-4 py-4 shadow-sm ring-1 ring-slate-100 md:px-5 md:py-4"
    >
      {/* garis tipis sebagai aksen timeline */}
      <div className="pointer-events-none absolute inset-y-5 left-0 w-[2px] bg-gradient-to-b from-sky-400/40 via-sky-300/10 to-transparent" />

      <div className="ml-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Kiri: informasi utama */}
        <div className="space-y-3">
          {/* top row: nama layanan + status */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                Layanan
              </p>
              <h3 className="mt-0.5 text-sm font-semibold text-slate-900 md:text-base">
                {reservation.service?.name || 'Layanan tidak diketahui'}
              </h3>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium shadow-[0_0_0_1px_rgba(255,255,255,0.9)] backdrop-blur">
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
              <span className={cfg.chipClass + ' rounded-full px-1 py-0.5'}>
                {cfg.label}
              </span>
            </div>
          </div>

          {/* middle row: tanggal */}
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-sky-500" />
              <span>{formattedDate}</span>
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:inline-block" />
            <span className="inline-flex items-center gap-1 text-slate-500">
              <span className="text-[11px] uppercase tracking-[0.18em]">
                ID
              </span>
              <span className="font-medium text-slate-700">{shortId}</span>
            </span>
          </div>

          {/* bottom row: meta bayi + terapis */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-600 md:text-[13px]">
            <div className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Bayi:{' '}
                <span className="font-medium">
                  {reservation.babyName} ({reservation.babyAge} bln)
                </span>
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Terapis:{' '}
                <span className="font-medium">
                  {reservation.staff?.name || 'Belum ditentukan'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Kanan: CTA compact */}
        <div className="flex flex-col items-end gap-2 self-stretch md:items-end md:justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goDetail();
            }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-all md:text-xs ${
              isPending
                ? 'bg-sky-500 text-white shadow-sm hover:bg-sky-600'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{isPending ? 'Bayar & detail' : 'Lihat detail'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

/**
 * Halaman list reservasi
 */
const CustomerReservations = () => {
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  const {
    data: reservations,
    isLoading,
    isError,
    error,
  } = useCustomerReservations(filter);

  const activeTabClass =
    'bg-sky-500 text-white shadow-sm shadow-sky-300 scale-[1.02]';
  const inactiveTabClass =
    'bg-white/80 text-slate-600 hover:bg-sky-50 hover:text-sky-800';

  return (
    <div className="pb-8 pt-2 md:pt-4">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
            Riwayat Perawatan
          </p>
          <h1 className="mt-1 text-xl font-semibold text-slate-900 md:text-2xl">
            Reservasi Saya
          </h1>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            Pantau reservasi yang akan datang dan riwayat sesi Anda.
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex justify-between gap-3">
        <div className="inline-flex rounded-full bg-slate-100/80 p-1">
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition-all md:text-sm ${
              filter === 'upcoming' ? activeTabClass : inactiveTabClass
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Akan datang
          </button>
          <button
            type="button"
            onClick={() => setFilter('past')}
            className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-semibold transition-all md:text-sm ${
              filter === 'past' ? activeTabClass : inactiveTabClass
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            Riwayat
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-24 animate-pulse rounded-2xl bg-white/90 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex h-full items-center gap-4 px-5">
                <div className="h-9 w-9 rounded-full bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded-full bg-slate-100" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                  <div className="h-3 w-1/4 rounded-full bg-slate-100" />
                </div>
                <div className="h-7 w-24 rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
            Memuat data reservasi...
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && !isLoading && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-xs text-rose-700 md:text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-[2px] h-4 w-4" />
            <div>
              <p>Gagal memuat data reservasi. Coba lagi beberapa saat lagi.</p>
              {error && (
                <p className="mt-1 text-[11px] text-rose-500">
                  {error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {!isLoading && !isError && reservations && reservations.length > 0 && (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="space-y-4"
            transition={{ layout: { duration: 0.25, ease: 'easeOut' } }}
          >
            {reservations.map((res) => (
              <ReservationCard key={res.id} reservation={res} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Empty state */}
      {!isLoading && !isError && reservations && reservations.length === 0 && (
        <div className="mt-4 rounded-2xl bg-white/95 py-10 text-center shadow-sm ring-1 ring-slate-100">
          <Calendar className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">
            Belum ada reservasi
          </h3>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            Anda belum memiliki reservasi pada kategori ini.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerReservations;
