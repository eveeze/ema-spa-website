// src/pages/BookingPage.tsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import apiClient from "../api/apiClient";
import {
  Service,
  Session,
  PaymentMethod,
  ReservationPayload,
  ApiResponse,
} from "../types";
import { useAuth } from "../hooks/useAuth";
import {
  Calendar,
  Baby,
  Wallet,
  Loader2,
  ArrowLeft,
  Clock,
  User,
  CreditCard,
} from "lucide-react";

const BookingPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const priceTierIdFromUrl = queryParams.get("priceTierId");

  const [service, setService] = useState<Service | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [babyInfo, setBabyInfo] = useState({ name: "", age: "" });
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [selectedPriceTierId] = useState<string | null>(priceTierIdFromUrl);

  const [loading, setLoading] = useState({
    service: true,
    dates: true,
    sessions: false,
    submit: false,
  });
  const [error, setError] = useState<string | null>(null);

  const filterFutureDates = (dates: string[]): string[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const filtered = dates.filter((dateStr) => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      return date >= today;
    });
    return filtered;
  };

  useEffect(() => {
    if (!serviceId) return;

    const fetchInitialData = async () => {
      try {
        const serviceRes = await apiClient.get<ApiResponse<Service>>(
          `/service/${serviceId}`
        );
        setService(serviceRes.data.data);

        interface OperatingSchedule {
          date: string;
        }

        const scheduleRes = await apiClient.get<
          ApiResponse<OperatingSchedule[]>
        >("/operating-schedule?isHoliday=false");

        if (Array.isArray(scheduleRes.data.data)) {
          const allDates = scheduleRes.data.data.map(
            (s: OperatingSchedule) => s.date.split("T")[0]
          );
          const futureDates = filterFutureDates(allDates);
          setAvailableDates(futureDates);
        }
      } catch (err) {
        setError("Gagal memuat detail layanan atau jadwal.");
        console.error(err);
      } finally {
        setLoading((prev) => ({ ...prev, service: false, dates: false }));
      }
    };
    fetchInitialData();
  }, [serviceId]);

  useEffect(() => {
    if (!selectedDate || !service) return;

    const fetchSessions = async () => {
      setLoading((prev) => ({ ...prev, sessions: true }));
      setAvailableSessions([]);
      try {
        const response = await apiClient.get<ApiResponse<Session[]>>(
          `/session/available`,
          {
            params: { date: selectedDate, duration: service.duration },
          }
        );
        if (Array.isArray(response.data.data)) {
          setAvailableSessions(response.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat sesi:", err);
      } finally {
        setLoading((prev) => ({ ...prev, sessions: false }));
      }
    };
    fetchSessions();
  }, [selectedDate, service]);

  useEffect(() => {
    if (currentStep !== 3) return;

    const fetchPaymentMethods = async () => {
      try {
        const response = await apiClient.get<ApiResponse<PaymentMethod[]>>(
          "/reservations/payment-methods"
        );
        if (Array.isArray(response.data.data)) {
          setPaymentMethods(response.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat metode pembayaran:", err);
      }
    };
    fetchPaymentMethods();
  }, [currentStep]);

  const selectedSession = useMemo(
    () => availableSessions.find((s) => s.id === selectedSessionId),
    [availableSessions, selectedSessionId]
  );

  const finalPrice = useMemo(() => {
    if (!service) return 0;

    if (service.hasPriceTiers && selectedPriceTierId) {
      const tier = service.priceTiers.find((t) => t.id === selectedPriceTierId);
      return tier?.price ?? service.price ?? 0;
    }

    return service.price ?? 0;
  }, [service, selectedPriceTierId]);

  // BARU: Dapatkan detail tier yang dipilih untuk validasi
  const selectedTier = useMemo(() => {
    if (!service || !service.hasPriceTiers || !selectedPriceTierId) {
      return null;
    }
    return service.priceTiers.find((tier) => tier.id === selectedPriceTierId);
  }, [service, selectedPriceTierId]);

  // BARU: Logika untuk memvalidasi usia bayi terhadap tier yang dipilih
  const isAgeValid = useMemo(() => {
    // Jika tidak ada tier yang dipilih (misal untuk layanan non-tiered), anggap valid.
    if (!selectedTier) return true;

    const age = parseInt(babyInfo.age, 10);
    // Jika input kosong atau bukan angka, anggap tidak valid untuk disubmit.
    if (isNaN(age)) return false;

    // Periksa apakah usia berada dalam rentang min dan max tier.
    return age >= selectedTier.minBabyAge && age <= selectedTier.maxBabyAge;
  }, [babyInfo.age, selectedTier]);

  const handleFinalSubmit = async () => {
    if (
      !serviceId ||
      !selectedSessionId ||
      !babyInfo.name ||
      !babyInfo.age ||
      !selectedPayment
    ) {
      setError("Harap lengkapi semua informasi sebelum melanjutkan.");
      return;
    }

    if (service?.hasPriceTiers && !selectedPriceTierId) {
      setError(
        "Terjadi kesalahan, tingkatan harga tidak terpilih. Silakan kembali ke halaman detail layanan."
      );
      return;
    }

    // DIUBAH: Tambahkan validasi usia sebelum submit
    if (!isAgeValid) {
      setError(
        `Usia bayi harus antara ${selectedTier?.minBabyAge} dan ${selectedTier?.maxBabyAge} bulan.`
      );
      return;
    }

    setError(null);
    setLoading((prev) => ({ ...prev, submit: true }));

    const payload: ReservationPayload = {
      serviceId,
      sessionId: selectedSessionId,
      babyName: babyInfo.name,
      babyAge: parseInt(babyInfo.age, 10),
      paymentMethod: selectedPayment,
      priceTierId: selectedPriceTierId,
    };

    try {
      const response = await apiClient.post("/reservations", payload);

      const paymentUrl = response.data?.data?.payment?.tripayPaymentUrl;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        console.warn(
          "Payment URL not found in response, navigating to dashboard."
        );
        setError(
          "Gagal mengalihkan ke halaman pembayaran. Silakan cek status reservasi Anda di dashboard."
        );
        navigate("/dashboard/reservations?status=pending");
      }
    } catch (err: unknown) {
      console.error("Reservation failed. Response data:", err);

      let errorMessage = "Terjadi kesalahan saat membuat reservasi.";

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as Record<string, unknown>).response === "object"
      ) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  if (loading.service || loading.dates) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-sky-50 to-sky-100">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Memuat informasi layanan...</p>
        </div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Terjadi Kesalahan
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepConfig = [
    { icon: Calendar, title: "Pilih Tanggal & Waktu", color: "bg-sky-500" },
    { icon: Baby, title: "Informasi Pasien", color: "bg-green-500" },
    {
      icon: CreditCard,
      title: "Konfirmasi & Pembayaran",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50 p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            {stepConfig.map((step, index) => {
              const StepIcon = step.icon;
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;

              return (
                <div key={stepNumber} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? `${step.color} border-transparent text-white shadow-lg`
                          : "bg-gray-100 border-gray-300 text-gray-400"
                      }`}
                    >
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm mt-2 font-medium ${
                        isActive ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < stepConfig.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6">
            <div className="flex items-center">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="mr-4 p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}
              <div>
                <p className="text-sky-100 font-medium">
                  Langkah {currentStep} dari 3
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Reservasi: {service?.name}
                </h1>
                {service?.description && (
                  <p className="text-sky-100 mt-1 text-sm">
                    {service.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {currentStep === 1 && (
              // ... Kode Step 1 tidak berubah ...
              <div className="space-y-8">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-sky-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Pilih Tanggal & Waktu
                  </h2>
                  <p className="text-gray-600">
                    Pilih tanggal dan waktu yang sesuai untuk reservasi Anda
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <label className="block font-semibold text-gray-700 mb-4">
                    📅 Tanggal Tersedia:
                  </label>
                  {availableDates.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {availableDates.map((date) => {
                        const dateObj = new Date(date);
                        const isSelected = selectedDate === date;

                        return (
                          <button
                            key={date}
                            onClick={() => setSelectedDate(date)}
                            className={`p-4 rounded-xl border-2 text-center font-medium transition-all duration-300 transform hover:scale-105 ${
                              isSelected
                                ? "bg-sky-500 text-white border-sky-500 shadow-lg"
                                : "bg-white hover:border-sky-500 hover:shadow-md border-gray-200"
                            }`}
                          >
                            <div className="text-sm">
                              {dateObj.toLocaleDateString("id-ID", {
                                weekday: "short",
                              })}
                            </div>
                            <div className="text-lg font-bold">
                              {dateObj.getDate()}
                            </div>
                            <div className="text-xs">
                              {dateObj.toLocaleDateString("id-ID", {
                                month: "short",
                              })}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Tidak ada tanggal tersedia untuk saat ini. Semua jadwal
                        mungkin sudah terlewat atau belum ada jadwal yang
                        dibuka.
                      </p>
                    </div>
                  )}
                </div>

                {loading.sessions && (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-sky-500 mx-auto mb-4" />
                      <p className="text-gray-600">Memuat jadwal sesi...</p>
                    </div>
                  </div>
                )}

                {selectedDate && !loading.sessions && (
                  <div className="bg-sky-50 rounded-xl p-6">
                    <label className="block font-semibold text-gray-700 mb-4">
                      🕐 Sesi Tersedia pada{" "}
                      <span className="text-sky-600">
                        {new Date(selectedDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                      :
                    </label>

                    {availableSessions.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableSessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => {
                              setSelectedSessionId(session.id);
                              nextStep();
                            }}
                            className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-sky-500 hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-left"
                          >
                            <div className="flex items-center mb-3">
                              <Clock className="w-5 h-5 text-sky-500 mr-2" />
                              <span className="font-bold text-xl text-gray-800">
                                {new Date(
                                  session.timeSlot.startTime
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <User className="w-4 h-4 text-gray-500 mr-2" />
                              <span className="text-gray-600 text-sm">
                                dengan {session.staff.name}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          Tidak ada sesi tersedia pada tanggal ini.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Baby className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Informasi Pasien
                  </h2>
                  <p className="text-gray-600">
                    Lengkapi informasi pasien untuk reservasi Anda
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 space-y-6">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      👤 Nama Orang Tua
                    </label>
                    <input
                      value={user?.name || ""}
                      readOnly
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      👶 Nama Bayi *
                    </label>
                    <input
                      value={babyInfo.name}
                      onChange={(e) =>
                        setBabyInfo({ ...babyInfo, name: e.target.value })
                      }
                      placeholder="Masukkan nama bayi"
                      required
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">
                      📅 Usia Bayi (dalam bulan) *
                    </label>
                    <input
                      type="number"
                      value={babyInfo.age}
                      onChange={(e) =>
                        setBabyInfo({ ...babyInfo, age: e.target.value })
                      }
                      placeholder="Contoh: 6"
                      required
                      min="0"
                      max="120"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                    {/* BARU: Pesan error untuk validasi usia */}
                    {selectedTier && babyInfo.age && !isAgeValid && (
                      <p className="text-red-600 text-sm mt-2">
                        Usia bayi harus antara {selectedTier.minBabyAge} dan{" "}
                        {selectedTier.maxBabyAge} bulan untuk kategori yang
                        dipilih.
                      </p>
                    )}
                  </div>
                </div>

                {/* DIUBAH: Logika disabled pada tombol */}
                <button
                  onClick={nextStep}
                  disabled={!babyInfo.name || !babyInfo.age || !isAgeValid}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                >
                  Lanjutkan ke Pembayaran
                </button>
              </div>
            )}

            {currentStep === 3 && selectedSession && (
              // ... Kode Step 3 tidak berubah, karena validasi sudah dilakukan di step 2 ...
              <div className="space-y-8">
                <div className="text-center">
                  <CreditCard className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Konfirmasi & Pembayaran
                  </h2>
                  <p className="text-gray-600">
                    Periksa kembali detail reservasi dan pilih metode pembayaran
                  </p>
                </div>

                <div className="bg-gradient-to-r from-sky-50 to-sky-50 border border-sky-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg">
                    📋 Ringkasan Reservasi
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Layanan:</span>
                        <span className="font-semibold">{service?.name}</span>
                      </div>
                      {service?.hasPriceTiers && selectedPriceTierId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kategori Usia:</span>
                          <span className="font-semibold">
                            {
                              service.priceTiers.find(
                                (t) => t.id === selectedPriceTierId
                              )?.tierName
                            }
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span className="font-semibold">
                          {new Date(
                            selectedSession.timeSlot.startTime
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Waktu:</span>
                        <span className="font-semibold">
                          {new Date(
                            selectedSession.timeSlot.startTime
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terapis:</span>
                        <span className="font-semibold">
                          {selectedSession.staff.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pasien:</span>
                        <span className="font-semibold">
                          {babyInfo.name} ({babyInfo.age} bulan)
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-3">
                        <span className="text-gray-600 font-semibold">
                          Total Harga:
                        </span>
                        <span className="font-bold text-xl text-green-600">
                          Rp {finalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center">
                    <Wallet className="text-purple-500 mr-2" />
                    Pilih Metode Pembayaran
                  </h3>
                  <div className="grid gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.code}
                        onClick={() => setSelectedPayment(method.code)}
                        className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all duration-300 ${
                          selectedPayment === method.code
                            ? "border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-200"
                            : "border-gray-200 hover:border-purple-300 hover:shadow-md bg-white"
                        }`}
                      >
                        <img
                          src={method.iconUrl}
                          alt={method.name}
                          className="w-16 h-12 object-contain"
                        />
                        <span className="font-medium text-gray-800">
                          {method.name}
                        </span>
                        {selectedPayment === method.code && (
                          <div className="ml-auto w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-red-600 text-sm flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      {error}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleFinalSubmit}
                  disabled={!selectedPayment || loading.submit}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex justify-center items-center shadow-lg transform hover:scale-105"
                >
                  {loading.submit ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2" />
                      Konfirmasi & Bayar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
