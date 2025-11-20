// src/pages/ReservationDetailPage.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import {
  useCustomerReservationById,
  usePaymentDetails,
  useCreateOnlineRating,
  useRescheduleReservation,
  useAvailableSchedule,
} from "../hooks/useCustomerHooks";
import { Reservation, Payment } from "../types";

// --- KOMPONEN MODAL RATING ---
const RatingModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting: boolean;
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Rating bintang wajib diisi.");
      return;
    }
    setError("");
    onSubmit(rating, comment);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Bagaimana Pengalaman Anda?
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          Beri penilaian Anda untuk layanan ini.
        </p>
        <div className="flex justify-center items-center mb-4 space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`cursor-pointer transition-colors duration-200`}
              size={36}
              color={(hoverRating || rating) >= star ? "#f59e0b" : "#d1d5db"}
              fill={(hoverRating || rating) >= star ? "#f59e0b" : "none"}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Komentar (Opsional)
          </label>
          <textarea
            id="comment"
            rows={4}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Bagikan pengalaman Anda di sini..."
          />
        </div>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kirim Ulasan
          </button>
        </div>
      </div>
    </div>
  );
};

// --- KOMPONEN MODAL RESCHEDULE (BARU) ---
const RescheduleModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newSessionId: string) => void;
  isSubmitting: boolean;
  currentServiceDuration: number;
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  // Gunakan hook useAvailableSchedule untuk mengambil slot
  const {
    data: timeSlots,
    isLoading: isLoadingSlots,
    isError: isErrorSlots,
  } = useAvailableSchedule(selectedDate || null);

  // Reset state ketika modal ditutup
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate("");
      setSelectedSessionId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedSessionId) {
      onSubmit(selectedSessionId);
    }
  };

  // Filter slot yang memiliki sesi tersedia (tidak dibooking)
  // Dan durasinya cukup (logika sederhana, bisa disesuaikan)
  const availableSessions =
    timeSlots?.flatMap((slot) =>
      slot.sessions
        .filter((session) => !session.isBooked)
        .map((session) => ({
          ...session,
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
    ) || [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Jadwalkan Ulang Reservasi
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Pilih Tanggal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Tanggal Baru
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSessionId(null); // Reset sesi jika tanggal berubah
              }}
            />
          </div>

          {/* Daftar Sesi */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Sesi Tersedia
              </label>

              {isLoadingSlots ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                </div>
              ) : isErrorSlots ? (
                <p className="text-red-500 text-sm">Gagal memuat jadwal.</p>
              ) : availableSessions.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  Tidak ada sesi tersedia pada tanggal ini.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-md p-2">
                  {availableSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`flex items-center justify-between p-3 rounded-md border transition-all ${
                        selectedSessionId === session.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span className="font-medium">
                          {new Date(session.startTime).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "Asia/Jakarta",
                            }
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <User size={14} />
                        {session.staff.name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-xs text-yellow-800 mt-4">
            <p className="font-semibold flex items-center gap-1">
              <AlertTriangle size={14} /> Perhatian:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>
                Perubahan jadwal hanya dapat dilakukan maksimal 24 jam sebelum
                waktu reservasi.
              </li>
              <li>Maksimal perubahan jadwal adalah 2 kali.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
            disabled={isSubmitting || !selectedSessionId}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Konfirmasi Perubahan
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HALAMAN UTAMA ---
const ReservationDetailPage = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();

  // State Modal
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [, setRescheduleError] = useState<string | null>(null);

  // Hooks Data
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

  // Hooks Mutasi
  const { mutate: submitRating, isPending: isSubmittingRating } =
    useCreateOnlineRating();

  const { mutate: submitReschedule, isPending: isRescheduling } =
    useRescheduleReservation();

  const isLoading = isLoadingReservation || isLoadingPayment;
  const isError = isErrorReservation || isErrorPayment;

  // Handler Rating
  const handleRatingSubmit = (rating: number, comment: string) => {
    if (!reservationId) return;
    submitRating(
      { reservationId, rating, comment },
      {
        onSuccess: () => setIsRatingModalOpen(false),
        onError: (err) => console.error("Gagal mengirim rating:", err),
      }
    );
  };

  // Handler Reschedule
  const handleRescheduleSubmit = (newSessionId: string) => {
    if (!reservationId) return;
    setRescheduleError(null);

    submitReschedule(
      { reservationId, newSessionId },
      {
        onSuccess: () => {
          setIsRescheduleModalOpen(false);
          alert("Jadwal berhasil diubah!");
        },
        onError: (err: unknown) => {
          console.error("Gagal reschedule:", err);
          // Ekstrak pesan error dari API
          const errorMessage =
            typeof err === "object" &&
            err !== null &&
            "response" in err &&
            (err as any).response?.data?.message
              ? (err as any).response.data.message
              : "Gagal mengubah jadwal. Silakan coba lagi.";
          setRescheduleError(errorMessage);
          // Tutup modal setelah alert (opsional, bisa biarkan terbuka untuk retry)
          alert(errorMessage);
        },
      }
    );
  };

  const reservationStatusInfo: Record<
    Reservation["status"],
    { text: string; color: string; borderColor: string }
  > = {
    PENDING: {
      text: "Menunggu Konfirmasi",
      color: "bg-yellow-100 text-yellow-800",
      borderColor: "border-yellow-400",
    },
    CONFIRMED: {
      text: "Terkonfirmasi",
      color: "bg-blue-100 text-blue-800",
      borderColor: "border-blue-400",
    },
    IN_PROGRESS: {
      text: "Sedang Berlangsung",
      color: "bg-indigo-100 text-indigo-800",
      borderColor: "border-indigo-400",
    },
    COMPLETED: {
      text: "Selesai",
      color: "bg-green-100 text-green-800",
      borderColor: "border-green-400",
    },
    CANCELLED: {
      text: "Dibatalkan",
      color: "bg-red-100 text-red-800",
      borderColor: "border-red-400",
    },
    EXPIRED: {
      text: "Kadaluwarsa",
      color: "bg-gray-100 text-gray-800",
      borderColor: "border-gray-400",
    },
  };

  const paymentStatusInfo: Record<
    Payment["status"],
    { text: string; color: string }
  > = {
    PENDING: { text: "Menunggu Pembayaran", color: "text-yellow-600" },
    PAID: { text: "Sudah Dibayar", color: "text-green-600" },
    FAILED: { text: "Gagal", color: "text-red-600" },
    EXPIRED: { text: "Kadaluwarsa", color: "text-gray-600" },
    REFUNDED: { text: "Dikembalikan", color: "text-indigo-600" },
  };

  // --- RENDER ERROR & LOADING ---
  if (!reservationId)
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center text-red-500">
        ID Reservasi tidak ditemukan.
      </div>
    );

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mr-3" />
        Memuat data...
      </div>
    );

  if (isError || !reservation)
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
          Gagal memuat data.{" "}
          {reservationError?.message || paymentError?.message}
          <button
            onClick={() => navigate(-1)}
            className="block mt-2 underline font-bold"
          >
            Kembali
          </button>
        </div>
      </div>
    );

  const currentReservationStatus = reservationStatusInfo[reservation.status];
  const currentPaymentStatus = paymentDetails?.payment?.status
    ? paymentStatusInfo[paymentDetails.payment.status]
    : null;

  const formatDateTime = (isoString: string | null | undefined) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null) return "Rp. N/A";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const canReschedule =
    ["PENDING", "CONFIRMED"].includes(reservation.status) &&
    reservation.rescheduleCount < 2; // Validasi di frontend (juga divalidasi di backend)

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

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Detail Reservasi</h1>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Kembali
          </button>
        </div>

        {/* Ringkasan Reservasi */}
        <div
          className={`rounded-xl shadow-lg bg-white p-6 mb-8 border-l-4 ${currentReservationStatus.borderColor}`}
        >
          <div className="flex justify-between items-start mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {reservation.service?.name || "Layanan Tidak Diketahui"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">ID: {reservation.id}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${currentReservationStatus.color}`}
              >
                {currentReservationStatus.text}
              </span>
              {canReschedule && (
                <button
                  onClick={() => setIsRescheduleModalOpen(true)}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Edit size={16} /> Jadwalkan Ulang
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <strong>Nama Bayi:</strong> {reservation.babyName} (
              {reservation.babyAge} bln)
            </p>
            <p>
              <strong>Nama Orang Tua:</strong>{" "}
              {reservation.parentNames || reservation.customer?.name || "N/A"}
            </p>
            <p>
              <strong>Terapis:</strong> {reservation.staff?.name || "N/A"}
            </p>
            <p>
              <strong>Total Biaya:</strong>{" "}
              {formatCurrency(reservation.totalPrice)}
            </p>
            <p>
              <strong>Riwayat Reschedule:</strong> {reservation.rescheduleCount}{" "}
              kali
            </p>
          </div>
        </div>

        {/* Detail Sesi */}
        <div className="rounded-xl shadow-lg bg-white p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-blue-500" /> Detail Jadwal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <p className="text-sm text-gray-500 mb-1">Tanggal & Waktu</p>
              <p className="text-lg font-medium">
                {formatDateTime(reservation.session?.timeSlot?.startTime)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                sampai {formatDateTime(reservation.session?.timeSlot?.endTime)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Durasi Layanan</p>
              <p className="text-lg font-medium">
                {reservation.service?.duration || "-"} menit
              </p>
            </div>
          </div>
        </div>

        {/* Seksi Ulasan (Jika Completed) */}
        {reservation.status === "COMPLETED" && (
          <div className="rounded-xl shadow-lg bg-white p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Ulasan Anda
            </h2>
            {reservation.rating ? (
              <div>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className={
                        reservation.rating!.rating >= star
                          ? "text-amber-500 fill-amber-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="ml-2 text-gray-700 font-bold">
                    ({reservation.rating.rating} / 5)
                  </span>
                </div>
                <p className="text-gray-600 italic">
                  "{reservation.rating.comment || "Tidak ada komentar."}"
                </p>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Anda belum memberikan ulasan untuk layanan ini.
                </p>
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                >
                  <Star size={16} /> Beri Ulasan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Detail Pembayaran */}
        <div className="rounded-xl shadow-lg bg-white p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Wallet className="text-green-600" /> Detail Pembayaran
          </h2>
          {paymentDetails?.payment ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="font-medium text-gray-600">Status</span>
                <span
                  className={`font-bold ${currentPaymentStatus?.color || ""}`}
                >
                  {currentPaymentStatus?.text || "N/A"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p>
                  <strong>Metode:</strong>{" "}
                  {paymentDetails.payment.paymentMethod}
                </p>
                <p>
                  <strong>Batas Waktu:</strong>{" "}
                  {formatDateTime(paymentDetails.payment.expiryDate)}
                </p>
                {paymentDetails.payment.status === "PENDING" &&
                  paymentDetails.payment.paymentUrl && (
                    <div className="col-span-1 md:col-span-2 mt-2">
                      <a
                        href={paymentDetails.payment.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                      >
                        Lanjutkan Pembayaran <ArrowRight size={16} />
                      </a>
                    </div>
                  )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Data pembayaran tidak tersedia.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ReservationDetailPage;
