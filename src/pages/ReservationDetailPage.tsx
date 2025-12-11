// src/pages/ReservationDetailPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Loader2,
  AlertTriangle,
  Clock,
  User,
  Wallet,
  Star,
  X,
  Edit,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useCustomerReservationById,
  usePaymentDetails,
  useCreateOnlineRating,
  useRescheduleReservation,
  useAvailableSchedule,
} from '../hooks/useCustomerHooks';
import { Reservation, Payment } from '../types';

/* -------------------------------------------------------------------------- */
/*                             RATING MODAL (UI)                              */
/* -------------------------------------------------------------------------- */

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting: boolean;
}

const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: RatingModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      setError('Rating bintang wajib diisi.');
      return;
    }
    setError('');
    onSubmit(rating, comment);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mx-4 w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-xl shadow-amber-100/70 ring-1 ring-slate-100"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-500">
                  Ulasan Layanan
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  Bagaimana pengalaman Anda?
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Beri penilaian jujur agar kami dapat terus memperbaiki
                  kualitas perawatan untuk si kecil.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    className="group"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className="transition-transform duration-150 group-hover:scale-110"
                      size={34}
                      color={active ? '#f59e0b' : '#e5e7eb'}
                      fill={active ? '#f59e0b' : 'none'}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <label
                htmlFor="comment"
                className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                Komentar (opsional)
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 shadow-inner focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ceritakan bagaimana pengalaman bayi dan Anda saat sesi spa..."
              />
            </div>

            {error && (
              <p className="mb-3 text-xs font-medium text-red-600">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-amber-200 hover:from-amber-600 hover:to-amber-700 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                )}
                Kirim Ulasan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------------------- */
/*                          RESCHEDULE MODAL (UI)                             */
/* -------------------------------------------------------------------------- */

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newSessionId: string) => void;
  isSubmitting: boolean;
  currentServiceDuration: number;
}

const RescheduleModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  currentServiceDuration, // disiapkan kalau nanti mau dipakai filter durasi
}: RescheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const {
    data: timeSlots,
    isLoading: isLoadingSlots,
    isError: isErrorSlots,
  } = useAvailableSchedule(selectedDate || null);

  // Reset ketika modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate('');
      setSelectedSessionId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedSessionId) {
      onSubmit(selectedSessionId);
    }
  };

  const availableSessions =
    timeSlots?.flatMap((slot) =>
      slot.sessions
        .filter((session) => !session.isBooked)
        .map((session) => ({
          ...session,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
    ) || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mx-4 flex w-full max-w-lg max-h-[90vh] flex-col overflow-hidden rounded-3xl bg-white/95 shadow-xl shadow-sky-100/80 ring-1 ring-slate-100"
          >
            <div className="border-b border-slate-100 bg-gradient-to-r from-sky-500 to-sky-600 px  -5 px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100">
                    Jadwalkan Ulang
                  </p>
                  <h3 className="text-sm font-semibold sm:text-base">
                    Atur ulang jadwal kunjungan Anda
                  </h3>
                  <p className="mt-0.5 text-[11px] text-sky-100/80">
                    Pilih tanggal dan sesi baru yang masih tersedia.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sky-50 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-4">
              {/* Tanggal */}
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Pilih tanggal baru
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSessionId(null);
                  }}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Pilih tanggal minimal hari ini dan seterusnya.
                </p>
              </div>

              {/* Sesi */}
              {selectedDate && (
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Sesi tersedia
                  </label>

                  {isLoadingSlots ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                    </div>
                  ) : isErrorSlots ? (
                    <p className="text-xs text-red-600">
                      Gagal memuat jadwal untuk tanggal ini.
                    </p>
                  ) : availableSessions.length === 0 ? (
                    <p className="text-xs italic text-slate-500">
                      Tidak ada sesi tersedia pada tanggal ini.
                    </p>
                  ) : (
                    <div className="max-h-60 space-y-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
                      {availableSessions.map((session) => (
                        <button
                          key={session.id}
                          type="button"
                          onClick={() => setSelectedSessionId(session.id)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left text-xs shadow-sm transition-all ${
                            selectedSessionId === session.id
                              ? 'border-sky-500 bg-white text-sky-800 shadow-md'
                              : 'border-transparent bg-white/80 text-slate-700 hover:border-sky-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-sky-500" />
                            <span className="font-semibold">
                              {new Date(session.startTime).toLocaleTimeString(
                                'id-ID',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Asia/Jakarta',
                                },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <User className="h-3.5 w-3.5" />
                            <span>{session.staff.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-1 rounded-2xl bg-amber-50/80 p-3 text-[11px] text-amber-800 ring-1 ring-amber-100">
                <p className="flex items-center gap-1 font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Perhatian
                </p>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>
                    Perubahan jadwal hanya dapat dilakukan maksimal{' '}
                    <span className="font-semibold">24 jam</span> sebelum waktu
                    reservasi.
                  </li>
                  <li>
                    Maksimal perubahan jadwal adalah{' '}
                    <span className="font-semibold">2 kali</span>.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-full px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedSessionId}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-200 hover:from-sky-600 hover:to-sky-700 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none"
              >
                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                )}
                Konfirmasi Perubahan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------------------- */
/*                           HALAMAN DETAIL RESERVASI                         */
/* -------------------------------------------------------------------------- */

const ReservationDetailPage = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [, setRescheduleError] = useState<string | null>(null);

  const {
    data: reservation,
    isLoading: isLoadingReservation,
    isError: isErrorReservation,
    error: reservationError,
  } = useCustomerReservationById(reservationId || null);

  const {
    data: paymentDetails,
    isLoading: isLoadingPayment,
    isError: isErrorPayment,
    error: paymentError,
  } = usePaymentDetails(reservationId || null);

  const { mutate: submitRating, isPending: isSubmittingRating } =
    useCreateOnlineRating();

  const { mutate: submitReschedule, isPending: isRescheduling } =
    useRescheduleReservation();

  const isLoading = isLoadingReservation || isLoadingPayment;
  const isError = isErrorReservation || isErrorPayment;

  const handleRatingSubmit = (rating: number, comment: string) => {
    if (!reservationId) return;
    submitRating(
      { reservationId, rating, comment },
      {
        onSuccess: () => setIsRatingModalOpen(false),
        onError: (err) => console.error('Gagal mengirim rating:', err),
      },
    );
  };

  const handleRescheduleSubmit = (newSessionId: string) => {
    if (!reservationId) return;
    setRescheduleError(null);

    submitReschedule(
      { reservationId, newSessionId },
      {
        onSuccess: () => {
          setIsRescheduleModalOpen(false);
          alert('Jadwal berhasil diubah!');
        },
        onError: (err: unknown) => {
          console.error('Gagal reschedule:', err);
          const errorMessage =
            typeof err === 'object' &&
            err !== null &&
            'response' in err &&
            (err as any).response?.data?.message
              ? (err as any).response.data.message
              : 'Gagal mengubah jadwal. Silakan coba lagi.';
          setRescheduleError(errorMessage);
          alert(errorMessage);
        },
      },
    );
  };

  const reservationStatusInfo: Record<
    Reservation['status'],
    { text: string; color: string; borderColor: string; chipBg: string }
  > = {
    PENDING: {
      text: 'Menunggu Konfirmasi',
      color: 'text-amber-800',
      borderColor: 'border-amber-300',
      chipBg: 'bg-amber-50',
    },
    CONFIRMED: {
      text: 'Terkonfirmasi',
      color: 'text-sky-800',
      borderColor: 'border-sky-300',
      chipBg: 'bg-sky-50',
    },
    IN_PROGRESS: {
      text: 'Sedang Berlangsung',
      color: 'text-indigo-800',
      borderColor: 'border-indigo-300',
      chipBg: 'bg-indigo-50',
    },
    COMPLETED: {
      text: 'Selesai',
      color: 'text-emerald-800',
      borderColor: 'border-emerald-300',
      chipBg: 'bg-emerald-50',
    },
    CANCELLED: {
      text: 'Dibatalkan',
      color: 'text-red-800',
      borderColor: 'border-red-300',
      chipBg: 'bg-red-50',
    },
    EXPIRED: {
      text: 'Kadaluwarsa',
      color: 'text-slate-700',
      borderColor: 'border-slate-300',
      chipBg: 'bg-slate-50',
    },
  };

  const paymentStatusInfo: Record<
    Payment['status'],
    { text: string; color: string }
  > = {
    PENDING: { text: 'Menunggu Pembayaran', color: 'text-amber-600' },
    PAID: { text: 'Sudah Dibayar', color: 'text-emerald-600' },
    FAILED: { text: 'Gagal', color: 'text-red-600' },
    EXPIRED: { text: 'Kadaluwarsa', color: 'text-slate-600' },
    REFUNDED: { text: 'Dikembalikan', color: 'text-indigo-600' },
  };

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return 'Rp N/A';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canReschedule =
    ['PENDING', 'CONFIRMED'].includes(reservation?.status ?? '') &&
    (reservation?.rescheduleCount ?? 0) < 2;

  /* ----------------------------- LOADING / ERROR ---------------------------- */

  if (!reservationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-50 px-4">
        <div className="rounded-2xl bg-white/95 p-6 text-sm text-red-600 shadow-md shadow-red-100/70 ring-1 ring-red-100">
          ID Reservasi tidak ditemukan.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-sky-500" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            Memuat detail reservasi Anda...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-sky-50 px-4 py-8">
        <div className="mx-auto max-w-xl rounded-3xl bg-white/95 p-6 shadow-xl shadow-red-100/70 ring-1 ring-red-100">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Gagal memuat data reservasi
            </h2>
          </div>
          <p className="text-sm text-red-600">
            {reservationError?.message ||
              paymentError?.message ||
              '' ||
              'Terjadi kesalahan saat mengambil data.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-600"
          >
            Kembali ke halaman sebelumnya
          </button>
        </div>
      </div>
    );
  }

  const currentReservationStatus = reservationStatusInfo[reservation.status];
  const currentPaymentStatus = paymentDetails?.payment?.status
    ? paymentStatusInfo[paymentDetails.payment.status]
    : null;

  return (
    <>
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        isSubmitting={isSubmittingRating}
      />

      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        onSubmit={handleRescheduleSubmit}
        isSubmitting={isRescheduling}
        currentServiceDuration={reservation.service?.duration || 60}
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50 px-4 pb-10 pt-6 sm:px-6 lg:px-8"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
              Detail Reservasi
            </p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
              Ringkasan kunjungan spa Anda
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Cek informasi jadwal, status pembayaran, dan ulasan untuk sesi
              ini.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-100 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
          >
            Kembali
          </button>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
          {/* KOLOM KIRI: Ringkasan + Jadwal + Ulasan */}
          <div className="flex-1 space-y-6">
            {/* CARD RINGKASAN */}
            <motion.div
              className={`rounded-3xl bg-white/95 p-6 shadow-xl shadow-sky-100/70 ring-1 ${currentReservationStatus.borderColor}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {reservation.service?.name || 'Layanan Tidak Diketahui'}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    ID Reservasi:{' '}
                    <span className="font-mono text-[11px]">
                      {reservation.id}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${currentReservationStatus.chipBg} ${currentReservationStatus.color}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {currentReservationStatus.text}
                  </span>

                  {canReschedule && (
                    <button
                      onClick={() => setIsRescheduleModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100 hover:bg-sky-100"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Jadwalkan ulang
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 text-xs text-slate-700 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Data bayi
                  </p>
                  <p>
                    <span className="font-medium">Nama:</span>{' '}
                    {reservation.babyName}
                  </p>
                  <p>
                    <span className="font-medium">Usia:</span>{' '}
                    {reservation.babyAge} bulan
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Orang tua & terapis
                  </p>
                  <p>
                    <span className="font-medium">Orang tua:</span>{' '}
                    {reservation.parentNames ||
                      reservation.customer?.name ||
                      'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Terapis:</span>{' '}
                    {reservation.staff?.name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Harga
                  </p>
                  <p className="text-sm font-semibold text-emerald-700">
                    {formatCurrency(reservation.totalPrice)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Termasuk semua layanan dalam sesi ini.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Reschedule
                  </p>
                  <p>
                    Sudah diubah{' '}
                    <span className="font-semibold">
                      {reservation.rescheduleCount}x
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CARD JADWAL */}
            <motion.div
              className="rounded-3xl bg-white/95 p-6 shadow-xl shadow-slate-100/70 ring-1 ring-slate-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.3 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Detail Jadwal
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Periksa waktu mulai dan selesai sesi spa.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 text-xs text-slate-700 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Tanggal & waktu
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {formatDateTime(reservation.session?.timeSlot?.startTime)}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Berakhir pada{' '}
                    {formatDateTime(reservation.session?.timeSlot?.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Durasi layanan
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {reservation.service?.duration || '-'} menit
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Estimasi bisa sedikit berbeda tergantung kondisi bayi.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* ULASAN */}
            {reservation.status === 'COMPLETED' && (
              <motion.div
                className="rounded-3xl bg-white/95 p-6 shadow-xl shadow-amber-50/80 ring-1 ring-amber-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.3 }}
              >
                <h2 className="mb-3 text-sm font-semibold text-slate-900">
                  Ulasan Anda
                </h2>
                {reservation.rating ? (
                  <div>
                    <div className="mb-2 flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={22}
                          className={
                            reservation.rating!.rating >= star
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                      <span className="ml-2 text-xs font-semibold text-slate-700">
                        ({reservation.rating.rating} / 5)
                      </span>
                    </div>
                    <p className="text-xs italic text-slate-600">
                      “{reservation.rating.comment || 'Tidak ada komentar.'}”
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-slate-600">
                      Anda belum memberikan ulasan untuk layanan ini.
                    </p>
                    <button
                      onClick={() => setIsRatingModalOpen(true)}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-600"
                    >
                      <Star className="h-3.5 w-3.5" />
                      Beri ulasan
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* KOLOM KANAN: Pembayaran */}
          <motion.div
            className="w-full max-w-md space-y-4 lg:w-80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="rounded-3xl bg-white/95 p-6 shadow-xl shadow-emerald-50/80 ring-1 ring-slate-100">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Status Pembayaran
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Detail transaksi untuk reservasi ini.
                  </p>
                </div>
              </div>

              {paymentDetails?.payment ? (
                <div className="space-y-4 text-xs text-slate-700">
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Status
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        currentPaymentStatus?.color || ''
                      }`}
                    >
                      {currentPaymentStatus?.text || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Metode:</span>{' '}
                      {paymentDetails.payment.paymentMethod}
                    </p>
                    <p>
                      <span className="font-medium">Batas waktu bayar:</span>{' '}
                      {formatDateTime(paymentDetails.payment.expiryDate)}
                    </p>
                  </div>

                  {paymentDetails.payment.status === 'PENDING' &&
                    paymentDetails.payment.paymentUrl && (
                      <div className="pt-2">
                        <a
                          href={paymentDetails.payment.paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-200 hover:from-emerald-600 hover:to-emerald-700"
                        >
                          Lanjutkan Pembayaran
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                </div>
              ) : (
                <p className="text-xs italic text-slate-500">
                  Data pembayaran tidak tersedia.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default ReservationDetailPage;
