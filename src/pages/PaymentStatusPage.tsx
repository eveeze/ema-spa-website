// src/pages/PaymentStatusPage.tsx

import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import apiClient from "../api/apiClient";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";

// Definisikan tipe data untuk detail pembayaran
interface PaymentDetails {
  payment: {
    status: "PAID" | "PENDING" | "FAILED" | "EXPIRED" | "REFUNDED";
    amount: number;
    paymentMethod: string;
  };
  reservation: {
    id: string;
    status: string;
    serviceName: string;
    sessionDate: string;
    sessionTime: string;
  };
}

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reservationId = searchParams.get("reservation_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    if (!reservationId) {
      setError("ID Reservasi tidak ditemukan. Pengalihan tidak valid.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(
          `/reservations/payment/${reservationId}`
        );
        setDetails(response.data.data);
      } catch (err: unknown) {
        console.error("Gagal memverifikasi pembayaran:", err);

        let errorMessage =
          "Gagal memuat status pembayaran. Silakan cek halaman reservasi Anda.";

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

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Beri jeda sedikit untuk memastikan callback dari Tripay sudah diproses oleh backend
    const timer = setTimeout(() => {
      verifyPayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, [reservationId]);

  // --- PERBAIKAN DI SINI (FORMAT TANGGAL & WAKTU) ---

  const formatDate = (iso: string) => {
    // Memaksa zona waktu ke Asia/Jakarta (WIB)
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Jakarta",
    });
  };

  const formatTimeStr = (timeStr: string) => {
    // Jika format dari backend "14:00:00", kita ambil "14:00" saja
    // Jika formatnya sudah "14:00", biarkan saja
    const cleanTime = timeStr.split(":").slice(0, 2).join(":");
    return `${cleanTime} WIB`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  // ----------------------------------------------------

  const renderContent = () => {
    if (loading) {
      return (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-sky-100/60 blur-xl" />
              <Loader2 className="relative z-10 h-14 w-14 animate-spin text-sky-600" />
            </motion.div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Memverifikasi pembayaran Anda…
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Mohon tunggu sebentar, kami sedang mengecek status transaksi.
              </p>
            </div>
          </div>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-100/70 blur-xl" />
              <AlertTriangle className="relative z-10 h-16 w-16 text-amber-500" />
            </div>
            <h1 className="text-2xl font-semibold text-red-600">
              Terjadi kesalahan
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              {error}
            </p>
            <button
              onClick={() => navigate("/dashboard/reservations")}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 hover:shadow-md"
            >
              Lihat reservasi saya
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      );
    }

    if (!details) return null;

    const { payment, reservation } = details;
    const paymentStatus = payment.status.toUpperCase();

    if (paymentStatus === "PAID") {
      return (
        <motion.div
          key="paid"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-100/70 blur-xl" />
              <CheckCircle2 className="relative z-10 h-20 w-20 text-emerald-500" />
            </div>

            <div>
              <h1 className="text-3xl font-semibold text-slate-900">
                Pembayaran berhasil!
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                Reservasi Anda untuk{" "}
                <span className="font-semibold">{reservation.serviceName}</span>{" "}
                telah <span className="font-semibold">terkonfirmasi</span>.
              </p>
            </div>

            <div className="mt-4 w-full max-w-md rounded-2xl bg-slate-50/80 p-4 text-left text-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                  Detail reservasi
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {payment.paymentMethod}
                </span>
              </div>
              <p className="mb-1">
                <span className="font-medium text-slate-700">Layanan:</span>{" "}
                {reservation.serviceName}
              </p>
              <p className="mb-1">
                <span className="font-medium text-slate-700">Tanggal:</span>{" "}
                {formatDate(reservation.sessionDate)}
              </p>
              <p className="mb-1">
                <span className="font-medium text-slate-700">Waktu:</span>{" "}
                {/* Menggunakan helper formatTimeStr */}
                {formatTimeStr(reservation.sessionTime)}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Total: {formatCurrency(payment.amount)}
              </p>
            </div>

            <Link
              to="/dashboard/reservations"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-7 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-sky-600 hover:shadow-lg"
            >
              Lihat di dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      );
    }

    if (paymentStatus === "PENDING") {
      return (
        <motion.div
          key="pending"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-100/70 blur-xl" />
              <Clock className="relative z-10 h-18 w-18 text-amber-500" />
            </div>

            <h1 className="text-3xl font-semibold text-slate-900">
              Pembayaran tertunda
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Kami masih menunggu konfirmasi dari penyedia pembayaran. Status
              reservasi akan diperbarui secara otomatis.
            </p>

            <Link
              to="/dashboard/reservations"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-7 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-600 hover:shadow-lg"
            >
              Lihat status di dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      );
    }

    // FAILED / EXPIRED / REFUNDED / lainnya
    return (
      <motion.div
        key="failed"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-100/70 blur-xl" />
            <XCircle className="relative z-10 h-20 w-20 text-rose-500" />
          </div>

          <h1 className="text-3xl font-semibold text-slate-900">
            Pembayaran tidak berhasil
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Pembayaran untuk{" "}
            <span className="font-semibold">{reservation.serviceName}</span>{" "}
            tidak dapat diproses ({paymentStatus.toLowerCase()}).
          </p>

          <div className="mt-3 text-xs text-slate-500">
            Jika saldo terpotong namun status belum berubah, silakan hubungi
            admin kami.
          </div>

          <Link
            to={`/dashboard/reservations`}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-rose-500 px-7 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-rose-600 hover:shadow-lg"
          >
            Kembali ke reservasi
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-pink-50 px-4 overflow-x-hidden">
      {/* soft glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-56 w-56 rounded-full bg-pink-100/70 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="rounded-3xl bg-white/95 p-6 sm:p-8 md:p-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-sky-100">
          <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentStatusPage;
