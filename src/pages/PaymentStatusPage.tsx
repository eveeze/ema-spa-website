// src/pages/PaymentStatusPage.tsx
import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
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
    status: "PAID" | "PENDING" | "FAILED" | "EXPIRED";
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
        // Panggil endpoint yang sudah ada untuk mendapatkan detail pembayaran & reservasi
        const response = await apiClient.get(
          `/reservations/payment/${reservationId}`
        );
        setDetails(response.data.data);
      } catch (err: any) {
        console.error("Gagal memverifikasi pembayaran:", err);
        setError(
          err.response?.data?.message ||
            "Gagal memuat status pembayaran. Silakan cek halaman reservasi Anda."
        );
      } finally {
        setLoading(false);
      }
    };

    // Beri jeda sedikit untuk memastikan callback dari Tripay sudah diproses oleh backend
    const timer = setTimeout(() => {
      verifyPayment();
    }, 2000); // Jeda 2 detik

    return () => clearTimeout(timer);
  }, [reservationId]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-sky-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">
            Memverifikasi Pembayaran Anda...
          </h1>
          <p className="text-gray-600 mt-2">Mohon tunggu sebentar.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600">Terjadi Kesalahan</h1>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => navigate("/dashboard/reservations")}
            className="mt-6 bg-sky-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-sky-600 transition-all flex items-center justify-center mx-auto gap-2"
          >
            Lihat Reservasi Saya <ArrowRight size={20} />
          </button>
        </div>
      );
    }

    if (!details) return null;

    const paymentStatus = details.payment.status.toUpperCase();
    const reservation = details.reservation;

    switch (paymentStatus) {
      case "PAID":
        return (
          <div className="text-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">
              Pembayaran Berhasil!
            </h1>
            <p className="text-gray-600 mt-2 mb-6">
              Reservasi Anda untuk{" "}
              <span className="font-semibold">{reservation.serviceName}</span>{" "}
              telah dikonfirmasi.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left text-sm max-w-sm mx-auto">
              <p>
                <strong>Layanan:</strong> {reservation.serviceName}
              </p>
              <p>
                <strong>Tanggal:</strong>{" "}
                {new Date(reservation.sessionDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <strong>Waktu:</strong> {reservation.sessionTime}
              </p>
            </div>
            <Link
              to="/dashboard/reservations?status=confirmed"
              className="mt-8 inline-flex items-center gap-2 bg-sky-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-700 transition-transform transform hover:scale-105"
            >
              Lihat Detail Reservasi <ArrowRight size={20} />
            </Link>
          </div>
        );

      case "PENDING":
        return (
          <div className="text-center">
            <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">
              Pembayaran Tertunda
            </h1>
            <p className="text-gray-600 mt-2 mb-6">
              Kami sedang menunggu konfirmasi pembayaran Anda. Status reservasi
              akan diperbarui secara otomatis.
            </p>
            <Link
              to="/dashboard/reservations?status=pending"
              className="mt-8 inline-flex items-center gap-2 bg-yellow-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-transform transform hover:scale-105"
            >
              Lihat Status di Dashboard <ArrowRight size={20} />
            </Link>
          </div>
        );

      default: // FAILED, EXPIRED
        return (
          <div className="text-center">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">
              Pembayaran Gagal
            </h1>
            <p className="text-gray-600 mt-2 mb-6">
              Pembayaran untuk reservasi{" "}
              <span className="font-semibold">{reservation.serviceName}</span>{" "}
              tidak berhasil ({paymentStatus.toLowerCase()}).
            </p>
            <Link
              to={`/booking/${reservation.id}`} // Asumsi ID service bisa didapat atau link kembali ke dashboard
              className="mt-8 inline-flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
            >
              Coba Lagi <ArrowRight size={20} />
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-2xl w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default PaymentStatusPage;
