import { useState } from "react";
import { Loader2, AlertTriangle, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
// 1. Impor hook dari file 'useCustomerHooks.ts' yang terpusat.
import { useCustomerReservations } from "../hooks/useCustomerHooks";
import { Reservation } from "../types";

/**
 * ReservationCard: Komponen untuk menampilkan detail satu reservasi.
 * Komponen ini menerima data reservasi dan tidak memiliki logikanya sendiri.
 */
const ReservationCard = ({ reservation }: { reservation: Reservation }) => {
  const navigate = useNavigate();

  // Pemetaan status ke tampilan (style & teks)
  const statusInfo: Record<
    Reservation["status"],
    { text: string; color: string; borderColor: string }
  > = {
    PENDING: {
      text: "Menunggu Pembayaran",
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
  const currentStatus = statusInfo[reservation.status];

  return (
    <div
      className={`rounded-lg border-l-4 bg-white p-5 shadow-sm ${currentStatus.borderColor}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            {/* Menggunakan optional chaining untuk service.name */}
            {reservation.service?.name || "Layanan Tidak Diketahui"}
          </h3>
          <p className="text-sm text-gray-500">
            ID: {reservation.id.substring(0, 8)}...
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            {/* Menggunakan optional chaining untuk session.timeSlot.startTime */}
            {new Date(
              reservation.session?.timeSlot?.startTime || Date.now()
            ).toLocaleString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${currentStatus.color}`}
        >
          {currentStatus.text}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-sm">
            <strong>Nama Bayi:</strong> {reservation.babyName}
          </p>
          <p className="text-sm">
            {/* Menggunakan optional chaining untuk session.staff.name */}
            <strong>Terapis:</strong>{" "}
            {reservation.staff?.name || "Terapis Tidak Tersedia"}
          </p>
        </div>
        <div>
          {/* Tombol akan mengarahkan ke halaman pembayaran atau detail */}
          <button
            onClick={() =>
              navigate(`/dashboard/reservations/${reservation.id}`)
            } // Perbaikan di sini
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {reservation.status === "PENDING"
              ? "Bayar & Detail"
              : "Lihat Detail"}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * CustomerReservations: Komponen halaman utama yang menampilkan daftar reservasi pelanggan.
 */
const CustomerReservations = () => {
  // 2. State lokal untuk mengontrol filter UI ('upcoming' atau 'past').
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  // 3. Menggunakan hook untuk fetching data. React Query akan menangani caching,
  //    re-fetching, dan state (isLoading, isError, data).
  const {
    data: reservations,
    isLoading,
    isError,
    error,
  } = useCustomerReservations(filter);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Reservasi Saya</h1>

      {/* Kontrol Filter UI */}
      <div className="mb-6 flex space-x-2 border-b">
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            filter === "upcoming"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Akan Datang
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            filter === "past"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Riwayat
        </button>
      </div>

      {/* 4. Menampilkan UI berdasarkan state dari React Query */}
      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {isError && (
        <div className="rounded-md border-l-4 border-red-400 bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Gagal memuat data reservasi. Coba lagi nanti.
                {error && <pre className="mt-2 text-xs">{error.message}</pre>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Merender daftar reservasi jika data berhasil diambil dan tidak kosong */}
      {reservations && reservations.length > 0 && (
        <div className="space-y-4">
          {reservations.map((res: Reservation) => (
            <ReservationCard key={res.id} reservation={res} />
          ))}
        </div>
      )}

      {/* 6. Menampilkan pesan jika data kosong setelah selesai loading */}
      {reservations && reservations.length === 0 && !isLoading && (
        <div className="rounded-lg bg-white py-10 text-center shadow">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Tidak ada reservasi
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Anda belum memiliki reservasi pada kategori ini.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerReservations;
