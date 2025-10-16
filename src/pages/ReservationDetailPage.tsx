import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Wallet,
  QrCode,
  Star,
  X,
} from "lucide-react";
import {
  useCustomerReservationById,
  usePaymentDetails,
  useCreateOnlineRating,
} from "../hooks/useCustomerHooks";
import { Reservation, Payment } from "../types";

// Komponen Modal untuk Rating
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

const ReservationDetailPage = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const {
    mutate: submitRating,
    isPending: isSubmittingRating,
    error: ratingSubmitError,
  } = useCreateOnlineRating();

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

  const isLoading = isLoadingReservation || isLoadingPayment;
  const isError = isErrorReservation || isErrorPayment;

  const handleRatingSubmit = (rating: number, comment: string) => {
    if (!reservationId) return;
    submitRating(
      { reservationId, rating, comment },
      {
        onSuccess: () => {
          setIsRatingModalOpen(false);
        },
        onError: (err) => {
          console.error("Gagal mengirim rating:", err);
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

  if (!reservationId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center items-center">
        <p className="text-xl text-red-500">ID Reservasi tidak ditemukan.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="ml-3 text-lg text-gray-700">Memuat detail reservasi...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="rounded-md border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Gagal memuat detail reservasi atau pembayaran.
                {reservationError && (
                  <pre className="mt-2 text-xs">{reservationError.message}</pre>
                )}
                {paymentError && (
                  <pre className="mt-2 text-xs">{paymentError.message}</pre>
                )}
              </p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center items-center">
        <p className="text-xl text-gray-600">Reservasi tidak ditemukan.</p>
        <button
          onClick={() => navigate(-1)}
          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Kembali
        </button>
      </div>
    );
  }

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

  const formatDateOnly = (isoString: string | null | undefined) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "Rp. N/A";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const supportsQRCode = (paymentMethodCode: string | undefined | null) => {
    const qrMethods = [
      "QRIS",
      "QRISC",
      "QRISCVN",
      "GOPAY",
      "SHOPEEPAY",
      "DANA",
      "LINKAJA",
    ];
    return paymentMethodCode && qrMethods.includes(paymentMethodCode);
  };

  return (
    <>
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
        isSubmitting={isSubmittingRating}
      />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Detail Reservasi</h1>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Kembali
          </button>
        </div>

        {/* Ringkasan Reservasi */}
        <div
          className={`rounded-xl shadow-lg bg-white p-6 mb-8 border-l-4 ${currentReservationStatus.borderColor}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {reservation.service?.name || "Layanan Tidak Diketahui"}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${currentReservationStatus.color}`}
            >
              {currentReservationStatus.text}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p>
              <strong>ID Reservasi:</strong> {reservation.id}
            </p>
            <p>
              <strong>Nama Bayi:</strong> {reservation.babyName}
            </p>
            <p>
              <strong>Usia Bayi:</strong> {reservation.babyAge} bulan
            </p>
            <p>
              <strong>Nama Orang Tua:</strong>{" "}
              {reservation.parentNames || reservation.customer?.name || "N/A"}
            </p>
            <p>
              <strong>Tipe Reservasi:</strong>{" "}
              {reservation.reservationType === "ONLINE" ? "Online" : "Manual"}
            </p>
            <p>
              <strong>Harga Total:</strong>{" "}
              {formatCurrency(reservation.totalPrice)}
            </p>
            <p>
              <strong>Terapis:</strong>{" "}
              {reservation.staff?.name || "Terapis Tidak Tersedia"}
            </p>
            <p>
              <strong>Dibuat Pada:</strong>{" "}
              {formatDateTime(reservation.createdAt)}
            </p>
          </div>
          {reservation.notes && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-gray-800">Catatan:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {reservation.notes}
              </p>
            </div>
          )}
        </div>

        {/* Detail Sesi */}
        <div className="rounded-xl shadow-lg bg-white p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Detail Sesi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center gap-2">
              <Calendar size={18} />
              <strong>Tanggal Sesi:</strong>{" "}
              {formatDateOnly(
                reservation.session?.timeSlot?.operatingSchedule?.date
              )}
            </p>
            <p className="flex items-center gap-2">
              <Clock size={18} />
              <strong>Waktu Sesi:</strong>{" "}
              {formatDateTime(reservation.session?.timeSlot?.startTime)} -{" "}
              {formatDateTime(reservation.session?.timeSlot?.endTime)}
            </p>
            <p className="flex items-center gap-2">
              <User size={18} />
              <strong>Durasi Layanan:</strong>{" "}
              {reservation.service?.duration || "N/A"} menit
            </p>
          </div>
        </div>

        {/* Seksi Ulasan */}
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
                {reservation.rating.comment ? (
                  <p className="text-gray-600 italic">
                    "{reservation.rating.comment}"
                  </p>
                ) : (
                  <p className="text-gray-500">Tidak ada komentar.</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Diberikan pada {formatDateTime(reservation.rating.createdAt)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <p className="text-gray-600 mb-4 sm:mb-0">
                  Anda belum memberikan ulasan untuk layanan ini.
                </p>
                <button
                  onClick={() => setIsRatingModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <Star size={16} />
                  Beri Ulasan
                </button>
              </div>
            )}
            {ratingSubmitError && (
              <p className="text-sm text-red-600 mt-4">
                Terjadi kesalahan: {ratingSubmitError.message}
              </p>
            )}
          </div>
        )}

        {/* Detail Pembayaran */}
        <div className="rounded-xl shadow-lg bg-white p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Detail Pembayaran
          </h2>
          {paymentDetails?.payment ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <p className="flex items-center gap-2">
                <Wallet size={18} />
                <strong>Status Pembayaran:</strong>{" "}
                <span
                  className={`font-semibold ${currentPaymentStatus?.color}`}
                >
                  {currentPaymentStatus?.text || "N/A"}
                </span>
              </p>
              <p>
                <strong>Metode Pembayaran:</strong>{" "}
                {paymentDetails.payment.paymentMethod || "N/A"}
              </p>
              <p>
                <strong>Jumlah Dibayar:</strong>{" "}
                {formatCurrency(paymentDetails.payment.amount)}
              </p>
              <p>
                <strong>Tanggal Pembayaran:</strong>{" "}
                {formatDateTime(paymentDetails.payment.paymentDate)}
              </p>
              <p>
                <strong>Batas Waktu Pembayaran:</strong>{" "}
                {formatDateTime(paymentDetails.payment.expiryDate)}
              </p>
              {paymentDetails.payment.paymentProof && (
                <p>
                  <strong>Bukti Pembayaran:</strong>{" "}
                  <a
                    href={paymentDetails.payment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Lihat Bukti
                  </a>
                </p>
              )}
              {paymentDetails.payment.paymentUrl &&
                paymentDetails.payment.status === "PENDING" && (
                  <p>
                    <strong>URL Pembayaran:</strong>{" "}
                    <a
                      href={paymentDetails.payment.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Lanjutkan Pembayaran
                    </a>
                  </p>
                )}
              {paymentDetails.payment.qrCode &&
                supportsQRCode(paymentDetails.payment.paymentMethod) &&
                paymentDetails.payment.status === "PENDING" && (
                  <div className="col-span-1 md:col-span-2 flex flex-col items-start mt-4">
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      <QrCode size={18} /> QR Code Pembayaran:
                    </p>
                    <img
                      src={paymentDetails.payment.qrCode}
                      alt="QR Code Pembayaran"
                      className="w-40 h-40 border border-gray-300 rounded-md mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Scan QR Code ini untuk menyelesaikan pembayaran Anda.
                    </p>
                  </div>
                )}
              {paymentDetails.payment.instructions &&
                Object.keys(paymentDetails.payment.instructions).length > 0 && (
                  <div className="col-span-1 md:col-span-2 mt-4">
                    <h3 className="font-semibold text-gray-800">
                      Instruksi Pembayaran:
                    </h3>
                    {Array.isArray(paymentDetails.payment.instructions) ? (
                      paymentDetails.payment.instructions.map(
                        (
                          instructionGroup: { title: string; steps: string[] },
                          index: number
                        ) => (
                          <div key={index} className="mb-2">
                            <h4 className="font-medium text-gray-700">
                              {instructionGroup.title}
                            </h4>
                            <ol className="list-decimal list-inside text-gray-600">
                              {instructionGroup.steps.map(
                                (step: string, stepIndex: number) => (
                                  <li key={stepIndex}>{step}</li>
                                )
                              )}
                            </ol>
                          </div>
                        )
                      )
                    ) : (
                      <pre className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-wrap">
                        {JSON.stringify(
                          paymentDetails.payment.instructions,
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </div>
                )}
            </div>
          ) : (
            <p className="text-gray-600">
              Tidak ada detail pembayaran untuk reservasi ini.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ReservationDetailPage;
