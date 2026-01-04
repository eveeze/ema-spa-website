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
import { motion } from "framer-motion";

// =======================
// Helper: format umur (bulan → label)
// =======================
const formatMonthLabel = (months: number | null | undefined) => {
  if (months == null) return "";
  if (months < 12) return `${months} bln`;

  const years = Math.floor(months / 12);
  const remaining = months % 12;

  if (remaining === 0) return `${years} tahun`;
  return `${years} th ${remaining} bln`;
};

const formatAgeRange = (
  min: number | null | undefined,
  max: number | null | undefined
) => {
  const minLabel = formatMonthLabel(min);
  const maxLabel = formatMonthLabel(max);

  if (minLabel && maxLabel) return `${minLabel} – ${maxLabel}`;
  if (minLabel) return `≥ ${minLabel}`;
  if (maxLabel) return `≤ ${maxLabel}`;
  return null;
};

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

  // =======================
  // Helpers
  // =======================
  const filterFutureDates = (dates: string[]): string[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dates.filter((dateStr) => {
      const date = new Date(dateStr);
      date.setHours(0, 0, 0, 0);
      return date >= today;
    });
  };

  // =======================
  // Fetch initial data (service + operating dates)
  // =======================
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

  // =======================
  // Fetch sessions when date selected
  // =======================
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

  // =======================
  // Fetch payment methods (only on step 3)
  // =======================
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

  // =======================
  // Derived values
  // =======================
  const selectedSession = useMemo(
    () => availableSessions.find((s) => s.id === selectedSessionId),
    [availableSessions, selectedSessionId]
  );

  const selectedTier = useMemo(() => {
    if (!service || !service.hasPriceTiers || !selectedPriceTierId) return null;
    return service.priceTiers.find((tier) => tier.id === selectedPriceTierId);
  }, [service, selectedPriceTierId]);

  const finalPrice = useMemo(() => {
    if (!service) return 0;

    if (service.hasPriceTiers && selectedPriceTierId) {
      const tier = service.priceTiers.find((t) => t.id === selectedPriceTierId);
      return tier?.price ?? service.price ?? 0;
    }

    return service.price ?? 0;
  }, [service, selectedPriceTierId]);

  const { allowedMin, allowedMax } = useMemo(() => {
    if (selectedTier) {
      return {
        allowedMin:
          typeof selectedTier.minBabyAge === "number"
            ? selectedTier.minBabyAge
            : null,
        allowedMax:
          typeof selectedTier.maxBabyAge === "number"
            ? selectedTier.maxBabyAge
            : null,
      };
    }
    if (service) {
      return {
        allowedMin:
          typeof service.minBabyAge === "number" ? service.minBabyAge : null,
        allowedMax:
          typeof service.maxBabyAge === "number" ? service.maxBabyAge : null,
      };
    }
    return { allowedMin: null, allowedMax: null };
  }, [selectedTier, service]);

  const ageRangeText = useMemo(
    () => formatAgeRange(allowedMin, allowedMax),
    [allowedMin, allowedMax]
  );

  const isAgeValid = useMemo(() => {
    if (!babyInfo.age) return false;
    const age = Number(babyInfo.age);
    if (Number.isNaN(age)) return false;

    if (allowedMin != null && age < allowedMin) return false;
    if (allowedMax != null && age > allowedMax) return false;

    return true;
  }, [babyInfo.age, allowedMin, allowedMax]);

  // =======================
  // Submit
  // =======================
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

    if (!isAgeValid) {
      const rangeText = ageRangeText || "rentang usia yang diperbolehkan";
      setError(`Usia bayi harus berada dalam ${rangeText}.`);
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

  // =======================
  // Loading / error state awal
  // =======================
  if (loading.service || loading.dates) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-sky-600" />
          <p className="text-sm font-medium text-slate-600 md:text-base">
            Memuat informasi layanan dan jadwal...
          </p>
        </div>
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="mx-4 max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-red-100">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <Calendar className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="mb-2 text-center text-lg font-semibold text-slate-900">
            Terjadi Kesalahan
          </h2>
          <p className="mb-6 text-center text-sm text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  // =======================
  // Step config
  // =======================
  const stepConfig = [
    { icon: Calendar, title: "Pilih Jadwal", color: "bg-sky-500" },
    { icon: Baby, title: "Data Bayi", color: "bg-emerald-500" },
    {
      icon: CreditCard,
      title: "Pembayaran",
      color: "bg-purple-500",
    },
  ];

  // =======================
  // RENDER
  // =======================
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      <motion.div
        className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* HEADER CARD */}
        <motion.div
          className="mb-6 rounded-3xl bg-white/90 p-4 shadow-md ring-1 ring-sky-100/80 sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: title & breadcrumb */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>

              <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Reservasi Spa Bayi &amp; Bunda
              </div>

              <div className="space-y-3">
                <h1 className="text-balance text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl md:text-4xl">
                  Atur Jadwal Spa dengan
                  <span className="block bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 bg-clip-text text-transparent">
                    Mudah &amp; Terarah
                  </span>
                </h1>
                {service && (
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-600 md:text-[15px]">
                    Anda sedang melakukan reservasi untuk{" "}
                    <span className="font-semibold text-sky-700">
                      {service.name}
                    </span>
                    . Ikuti langkah di bawah untuk memilih jadwal, mengisi data
                    bayi, dan menyelesaikan pembayaran.
                  </p>
                )}
              </div>
            </div>

            {/* Right: duration & price badge */}
            {service && (
              <motion.div
                className="mt-2 flex w-full max-w-xs flex-col gap-3 rounded-2xl bg-sky-50/70 p-4 text-right shadow-inner ring-1 ring-sky-100/80 lg:mt-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-500">
                  Estimasi Sesi
                </p>
                <div className="flex items-end justify-between gap-4">
                  <div className="text-left">
                    <p className="text-[11px] font-medium text-slate-500">
                      Durasi
                    </p>
                    <p className="text-xl font-semibold text-slate-900 md:text-2xl">
                      {service.duration} menit
                    </p>
                    {ageRangeText && (
                      <p className="mt-1 text-[11px] text-slate-500">
                        Usia bayi:{" "}
                        <span className="font-semibold text-sky-700">
                          {ageRangeText}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium text-slate-500">
                      Harga mulai dari
                    </p>
                    <p className="text-lg font-semibold text-sky-700 md:text-xl">
                      Rp {finalPrice.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* STEPPER */}
        <div className="mb-8 rounded-3xl bg-white/95 px-6 py-7 shadow-sm ring-1 ring-sky-100/80">
          <div className="flex items-center justify-between">
            {stepConfig.map((step, index) => {
              const StepIcon = step.icon;
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;

              return (
                <div key={stepNumber} className="flex flex-1 flex-col">
                  {/* WRAPPER FIX: SET HEIGHT SAMA & CENTER */}
                  <div className="flex items-center justify-center h-[65px] relative">
                    {/* ICON */}
                    <motion.div
                      className={`flex h-12 w-12 items-center justify-center rounded-full border text-xs 
                ${
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isActive
                    ? `${step.color} border-transparent text-white`
                    : "border-slate-200 bg-slate-50 text-slate-400"
                }`}
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 22,
                      }}
                    >
                      <StepIcon className="h-5 w-5" />
                    </motion.div>

                    {/* CONNECTION LINE */}
                    {index < stepConfig.length - 1 && (
                      <div className="absolute left-[calc(50%+36px)] top-1/2 -translate-y-1/2 w-full pr-5">
                        <div
                          className={`h-[2px] rounded-full w-full 
                    ${
                      currentStep > stepNumber ? "bg-sky-400" : "bg-slate-200"
                    }`}
                        />
                      </div>
                    )}
                  </div>

                  {/* LABEL */}
                  <div className="mt-2 flex justify-center">
                    <span
                      className={`text-[12px] font-medium 
                ${isActive ? "text-slate-900" : "text-slate-500"}`}
                    >
                      {step.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CONTENT CARD */}
        <motion.div
          className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Header kecil di dalam card, berubah tiap step */}
          <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-5 py-4 text-white md:px-8">
            <div className="flex items-center">
              {currentStep > 1 && (
                <button
                  onClick={prevStep}
                  className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <p className="text-xs font-medium text-sky-100/90">
                  Langkah {currentStep} dari 3
                </p>
                <h2 className="text-base font-semibold sm:text-lg">
                  {currentStep === 1 && "Pilih Tanggal & Waktu"}
                  {currentStep === 2 && "Lengkapi Data Bayi"}
                  {currentStep === 3 && "Konfirmasi & Pembayaran"}
                </h2>
                {service?.name && (
                  <p className="mt-0.5 text-xs text-sky-100/80">
                    Layanan: {service.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-8 px-5 py-6 md:px-8 md:py-8">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-sky-500" />
                  <h3 className="mb-1 text-xl font-semibold text-slate-900">
                    Pilih Tanggal & Waktu
                  </h3>
                  <p className="text-sm text-slate-600">
                    Pilih tanggal dan waktu yang sesuai untuk kunjungan spa
                    Anda.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50/80 p-5 md:p-6">
                  <label className="mb-3 block text-sm font-semibold text-slate-800">
                    📅 Tanggal Tersedia
                  </label>
                  {availableDates.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {availableDates.map((date) => {
                        const dateObj = new Date(date);
                        const isSelected = selectedDate === date;

                        return (
                          <motion.button
                            key={date}
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center rounded-xl border-2 p-3 text-center text-xs font-medium sm:text-sm ${
                              isSelected
                                ? "border-sky-500 bg-sky-500 text-white shadow-lg"
                                : "border-slate-200 bg-white text-slate-700"
                            }`}
                            whileHover={{
                              y: isSelected ? 0 : -3,
                              boxShadow: isSelected
                                ? "0 14px 30px rgba(56,189,248,0.35)"
                                : "0 8px 20px rgba(148,163,184,0.25)",
                            }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.18 }}
                          >
                            <span className="text-[11px] uppercase tracking-wide text-slate-500">
                              {dateObj.toLocaleDateString("id-ID", {
                                weekday: "short",
                              })}
                            </span>
                            <span className="text-lg font-semibold">
                              {dateObj.getDate()}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {dateObj.toLocaleDateString("id-ID", {
                                month: "short",
                              })}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <Calendar className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                      <p className="text-sm text-slate-500">
                        Belum ada tanggal yang dapat dipilih untuk saat ini.
                      </p>
                    </div>
                  )}
                </div>

                {loading.sessions && (
                  <div className="flex justify-center py-8">
                    <div className="text-center">
                      <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-sky-500" />
                      <p className="text-sm text-slate-600">
                        Memuat jadwal sesi...
                      </p>
                    </div>
                  </div>
                )}

                {selectedDate && !loading.sessions && (
                  <div className="rounded-2xl bg-sky-50/80 p-5 md:p-6">
                    <label className="mb-3 block text-sm font-semibold text-slate-800">
                      🕐 Sesi Tersedia pada{" "}
                      <span className="text-sky-700">
                        {new Date(selectedDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    </label>

                    {availableSessions.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {availableSessions.map((session) => (
                          <motion.button
                            key={session.id}
                            type="button"
                            onClick={() => {
                              setSelectedSessionId(session.id);
                              nextStep();
                            }}
                            className="rounded-2xl border-2 border-transparent bg-white p-4 text-left shadow-sm"
                            whileHover={{
                              y: -3,
                              boxShadow: "0 18px 40px rgba(8,47,73,0.20)",
                              borderColor: "rgba(56,189,248,1)",
                            }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.18 }}
                          >
                            <div className="mb-2 flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-sky-500" />
                              <span className="text-base font-semibold text-slate-900">
                                {new Date(
                                  session.timeSlot.startTime
                                ).toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center text-xs text-slate-600">
                              <User className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                              dengan{" "}
                              <span className="ml-1 font-medium">
                                {session.staff.name}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <Clock className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-sm text-slate-500">
                          Tidak ada sesi tersedia pada tanggal ini.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <Baby className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
                  <h3 className="mb-1 text-xl font-semibold text-slate-900">
                    Informasi Bayi
                  </h3>
                  <p className="text-sm text-slate-600">
                    Lengkapi data singkat agar terapis dapat menyesuaikan
                    perawatan dengan nyaman.
                  </p>
                </div>

                <div className="space-y-6 rounded-2xl bg-slate-50/80 p-5 md:p-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      👤 Nama Orang Tua
                    </label>
                    <input
                      value={user?.name || ""}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      👶 Nama Bayi *
                    </label>
                    <input
                      value={babyInfo.name}
                      onChange={(e) =>
                        setBabyInfo((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Masukkan nama bayi"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    />
                  </div>

                  {/* ===== [UPDATE DI SINI: INPUT TAHUN DAN BULAN] ===== */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      📅 Usia Bayi *
                    </label>
                    <div className="flex gap-4">
                      {/* INPUT TAHUN */}
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-slate-500">
                          Tahun
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          // Hitung tahun dari total bulan
                          value={
                            babyInfo.age
                              ? Math.floor(parseInt(babyInfo.age) / 12)
                              : ""
                          }
                          onChange={(e) => {
                            const newYear = parseInt(e.target.value) || 0;
                            const currentTotalMonths =
                              parseInt(babyInfo.age) || 0;
                            const currentMonthsPart = currentTotalMonths % 12;

                            // Kalkulasi ulang total bulan: (Tahun Baru * 12) + Bulan Saat Ini
                            const newTotalMonths =
                              newYear * 12 + currentMonthsPart;

                            setBabyInfo((prev) => ({
                              ...prev,
                              age:
                                newTotalMonths === 0
                                  ? ""
                                  : newTotalMonths.toString(),
                            }));
                          }}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>

                      {/* INPUT BULAN */}
                      <div className="flex-1">
                        <label className="mb-1 block text-xs text-slate-500">
                          Bulan
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={11} // Biasanya max 11 kalau sudah ada tahun, tapi optional
                          placeholder="0"
                          // Hitung sisa bulan dari total bulan
                          value={
                            babyInfo.age ? parseInt(babyInfo.age) % 12 : ""
                          }
                          onChange={(e) => {
                            const newMonth = parseInt(e.target.value) || 0;
                            const currentTotalMonths =
                              parseInt(babyInfo.age) || 0;
                            const currentYearPart = Math.floor(
                              currentTotalMonths / 12
                            );

                            // Kalkulasi ulang total bulan: (Tahun Saat Ini * 12) + Bulan Baru
                            const newTotalMonths =
                              currentYearPart * 12 + newMonth;

                            setBabyInfo((prev) => ({
                              ...prev,
                              age:
                                newTotalMonths === 0
                                  ? ""
                                  : newTotalMonths.toString(),
                            }));
                          }}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>

                    {/* Helper text rentang usia */}
                    {ageRangeText && (
                      <p className="mt-2 text-xs text-slate-500">
                        Layanan ini direkomendasikan untuk usia{" "}
                        <span className="font-medium text-sky-700">
                          {ageRangeText}
                        </span>
                        . (Total: {babyInfo.age || 0} bulan)
                      </p>
                    )}

                    {/* Error validation */}
                    {babyInfo.age && !isAgeValid && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        Usia bayi di luar rentang yang diperbolehkan untuk
                        layanan ini.
                      </p>
                    )}
                  </div>
                  {/* ===== [AKHIR UPDATE] ===== */}
                </div>

                <motion.button
                  type="button"
                  onClick={nextStep}
                  disabled={!babyInfo.name || !babyInfo.age || !isAgeValid}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
                  whileHover={
                    !(!babyInfo.name || !babyInfo.age || !isAgeValid)
                      ? {
                          y: -2,
                          boxShadow: "0 18px 40px rgba(16,185,129,0.35)",
                        }
                      : {}
                  }
                  whileTap={
                    !(!babyInfo.name || !babyInfo.age || !isAgeValid)
                      ? { scale: 0.97 }
                      : {}
                  }
                  transition={{ duration: 0.18 }}
                >
                  Lanjutkan ke Pembayaran
                </motion.button>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && selectedSession && (
              <div className="space-y-8">
                <div className="text-center">
                  <CreditCard className="mx-auto mb-4 h-12 w-12 text-purple-500" />
                  <h3 className="mb-1 text-xl font-semibold text-slate-900">
                    Konfirmasi & Pembayaran
                  </h3>
                  <p className="text-sm text-slate-600">
                    Periksa kembali detail reservasi dan pilih metode pembayaran
                    yang Anda inginkan.
                  </p>
                </div>

                <div className="space-y-4 rounded-2xl bg-sky-50/80 p-5 md:p-6">
                  <h4 className="mb-2 text-sm font-semibold text-slate-900">
                    📋 Ringkasan Reservasi
                  </h4>
                  <div className="grid gap-4 text-sm md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Layanan:</span>
                        <span className="font-medium text-slate-900">
                          {service?.name}
                        </span>
                      </div>
                      {service?.hasPriceTiers && selectedPriceTierId && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Kategori usia:</span>
                          <span className="font-medium text-slate-900">
                            {
                              service.priceTiers.find(
                                (t) => t.id === selectedPriceTierId
                              )?.tierName
                            }
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Tanggal:</span>
                        <span className="font-medium text-slate-900">
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
                        <span className="text-slate-600">Waktu:</span>
                        <span className="font-medium text-slate-900">
                          {new Date(
                            selectedSession.timeSlot.startTime
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Terapis:</span>
                        <span className="font-medium text-slate-900">
                          {selectedSession.staff.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Pasien:</span>
                        <span className="font-medium text-slate-900">
                          {babyInfo.name} ({babyInfo.age} bln)
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between border-t border-slate-200 pt-2">
                        <span className="text-sm font-semibold text-slate-700">
                          Total Harga:
                        </span>
                        <span className="text-lg font-bold text-emerald-600">
                          Rp {finalPrice.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl bg-purple-50/70 p-5 md:p-6">
                  <h4 className="mb-2 flex items-center text-sm font-semibold text-slate-900">
                    <Wallet className="mr-2 h-4 w-4 text-purple-500" />
                    Pilih Metode Pembayaran
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    {paymentMethods.map((method) => (
                      <motion.button
                        key={method.code}
                        type="button"
                        onClick={() => setSelectedPayment(method.code)}
                        className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-4 text-left text-sm ${
                          selectedPayment === method.code
                            ? "border-purple-500 shadow-lg ring-2 ring-purple-200"
                            : "border-slate-200"
                        }`}
                        whileHover={{
                          y: selectedPayment === method.code ? -1 : -3,
                          boxShadow:
                            selectedPayment === method.code
                              ? "0 18px 40px rgba(126,34,206,0.35)"
                              : "0 14px 30px rgba(148,163,184,0.25)",
                        }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                      >
                        <img
                          src={method.iconUrl}
                          alt={method.name}
                          className="h-10 w-16 object-contain"
                        />
                        <span className="font-medium text-slate-900">
                          {method.name}
                        </span>
                        {selectedPayment === method.code && (
                          <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
                            <span className="h-2 w-2 rounded-full bg-white" />
                          </span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-xs text-red-600">
                    {error}
                  </div>
                )}

                <motion.button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={!selectedPayment || loading.submit}
                  className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
                  whileHover={
                    !(!selectedPayment || loading.submit)
                      ? {
                          y: -2,
                          boxShadow: "0 20px 44px rgba(88,28,135,0.45)",
                        }
                      : {}
                  }
                  whileTap={
                    !(!selectedPayment || loading.submit) ? { scale: 0.97 } : {}
                  }
                  transition={{ duration: 0.18 }}
                >
                  {loading.submit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses Pembayaran...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Konfirmasi &amp; Bayar
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookingPage;
