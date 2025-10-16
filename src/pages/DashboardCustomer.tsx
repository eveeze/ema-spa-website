import { Link } from "react-router-dom";
import { CalendarPlus, Loader2, AlertTriangle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCustomerReservations } from "../hooks/useCustomerHooks"; // Pastikan impor ini benar

const CustomerDashboard = () => {
  const { user } = useAuth();

  // Mengambil data reservasi yang akan datang
  const {
    data: upcomingReservations,
    isLoading: isLoadingUpcoming,
    isError: isErrorUpcoming,
  } = useCustomerReservations("upcoming");

  // Mengambil SEMUA reservasi
  const {
    data: allReservations,
    isLoading: isLoadingAll,
    isError: isErrorAll,
  } = useCustomerReservations();

  // Gabungkan status loading dan error
  const isLoading = isLoadingUpcoming || isLoadingAll;
  const isError = isErrorUpcoming || isErrorAll;

  // --- Hitung data summary di frontend ---
  const upcomingReservationsCount = upcomingReservations?.length ?? 0;
  const totalReservationsCount = allReservations?.length ?? 0;
  const nextReservation = upcomingReservations?.[0]; // Mengambil reservasi terdekat

  const renderSummaryCards = () => {
    if (isLoading) {
      return Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="p-6 bg-white rounded-xl shadow animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      ));
    }

    if (isError) {
      return (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl shadow col-span-1 md:col-span-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <p>Gagal memuat ringkasan reservasi.</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="font-semibold text-gray-700">Reservasi Akan Datang</h3>
          <p className="text-4xl font-bold text-brand-primary mt-2">
            {upcomingReservationsCount}
          </p>
          <p className="text-sm text-gray-500">Sesi yang telah Anda pesan.</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow">
          <h3 className="font-semibold text-gray-700">Total Reservasi</h3>
          <p className="text-4xl font-bold text-brand-primary mt-2">
            {totalReservationsCount}
          </p>
          <Link
            to="/dashboard/reservations"
            className="text-sm text-brand-primary hover:underline"
          >
            Lihat riwayat reservasi Anda
          </Link>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Halo {user?.name || "Pelanggan"}, selamat datang kembali!
      </p>

      {/* Bagian Ringkasan */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderSummaryCards()}
        <Link
          to="/services"
          className="flex flex-col items-center justify-center p-6 bg-brand-primary text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          <CalendarPlus className="w-12 h-12 mb-2" />
          <p className="font-semibold text-lg">Buat Reservasi Baru</p>
        </Link>
      </div>

      {/* Bagian Reservasi Berikutnya */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Reservasi Berikutnya
        </h2>
        <div className="bg-white rounded-xl shadow p-6 min-h-[100px] flex flex-col justify-center">
          {isLoading && (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle size={20} />
              <p>Tidak dapat memuat detail reservasi berikutnya.</p>
            </div>
          )}
          {!isLoading &&
            !isError &&
            (nextReservation ? (
              <div className="space-y-2">
                <p className="font-bold text-lg text-gray-800">
                  {nextReservation.service?.name || "Layanan Tidak Diketahui"}
                </p>
                <p className="text-gray-600 flex items-center gap-2">
                  <CalendarPlus size={16} />
                  Jadwal:{" "}
                  {new Date(
                    nextReservation.session?.timeSlot?.startTime || Date.now()
                  ).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  Terapis:{" "}
                  {nextReservation.staff?.name || "Terapis Tidak Tersedia"}
                </p>
                <Link
                  to={`/dashboard/reservations/${nextReservation.id}`} // Perbaikan di sini
                  className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                >
                  Lihat Detail Reservasi
                </Link>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <CalendarPlus className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p>Anda tidak memiliki reservasi yang akan datang.</p>
                <Link
                  to="/services"
                  className="inline-block mt-3 text-blue-600 hover:underline text-sm"
                >
                  Buat Reservasi Sekarang
                </Link>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
