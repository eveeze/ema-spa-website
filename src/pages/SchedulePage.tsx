// src/pages/SchedulePage.tsx

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  ChangeEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO,
} from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useAvailableSchedule } from "../hooks/useCustomerHooks";

const SchedulePage: React.FC = () => {
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(today, { weekStartsOn: 1 })
  );

  const [selectedDate, setSelectedDate] = useState<string>(
    format(today, "yyyy-MM-dd")
  );

  const {
    data: availableTimeSlots,
    isLoading,
    isError,
    error,
    refetch,
  } = useAvailableSchedule(selectedDate);

  useEffect(() => {
    if (selectedDate) {
      refetch();
    }
  }, [selectedDate, refetch]);

  const selectedDateObj = useMemo(
    () => parseISO(selectedDate),
    [selectedDate]
  );

  const daysInWeek = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);

    const newDateObj = parseISO(newDate);
    const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    const isWithinCurrentWeek =
      !isSameDay(newDateObj, selectedDateObj) &&
      newDateObj >= currentWeekStart &&
      newDateObj <= currentWeekEnd;

    if (!isWithinCurrentWeek) {
      setCurrentWeekStart(startOfWeek(newDateObj, { weekStartsOn: 1 }));
    }
  };

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(format(date, "yyyy-MM-dd"));
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  }, []);

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  }, []);

  const handleGoToday = useCallback(() => {
    const start = startOfWeek(today, { weekStartsOn: 1 });
    setCurrentWeekStart(start);
    setSelectedDate(format(today, "yyyy-MM-dd"));
  }, [today]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  };

  const timeSlotsForSelectedDate = useMemo(
    () => availableTimeSlots || [],
    [availableTimeSlots]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-50">
      {/* Soft background blobs + noise */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-16 h-64 w-64 rounded-full bg-sky-100/80 blur-3xl" />
        <div className="absolute top-10 right-[-10%] h-72 w-72 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[5%] h-72 w-72 rounded-full bg-amber-50/80 blur-3xl" />
        <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-[0.04] mix-blend-soft-light" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-[11px] font-semibold text-sky-700 shadow-sm">
              <CalendarDays className="h-3.5 w-3.5" />
              Ema Mom Kids · Jadwal
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-[2rem]">
                Pilih Jadwal yang Nyaman untuk Bunda & Si Kecil
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Lihat ketersediaan sesi spa harian. Pilih hari dan jam yang
                paling cocok, lalu lanjutkan memilih layanan favorit.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGoToday}
              className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/90 px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-sm transition-all hover:-translate-y-[1px] hover:border-sky-200 hover:shadow-md"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Hari ini ·{" "}
              {format(today, "dd MMM yyyy", {
                locale: id,
              })}
            </button>
          </div>
        </header>

        {/* WEEK NAV & DATE PICKER CARD */}
        <section className="mb-10 rounded-3xl border border-sky-100 bg-white/90 p-5 shadow-xl backdrop-blur-sm sm:p-6 lg:p-7">
          {/* WEEK CONTROLS */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <button
                onClick={goToPreviousWeek}
                className="inline-flex items-center justify-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-sky-100 hover:shadow-md"
              >
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Minggu sebelumnya
              </button>

              <button
                onClick={goToNextWeek}
                className="inline-flex items-center justify-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 shadow-sm transition-all hover:-translate-y-[1px] hover:bg-sky-100 hover:shadow-md"
              >
                Minggu berikutnya
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </button>
            </div>

            <div className="text-xs font-medium text-slate-500 sm:text-right">
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Rentang minggu
              </span>
              <p className="text-sm text-slate-800">
                {format(currentWeekStart, "dd MMM", { locale: id })} –{" "}
                {format(
                  endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
                  "dd MMM yyyy",
                  { locale: id }
                )}
              </p>
            </div>
          </div>

          {/* WEEK DAY STRIP */}
          <div className="mt-5 grid grid-cols-7 gap-1.5 sm:gap-2">
            {daysInWeek.map((date) => {
              const isSelected = isSameDay(date, selectedDateObj);
              const isToday = isSameDay(date, today);
              const key = format(date, "yyyy-MM-dd");

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={[
                    "flex flex-col items-center gap-0.5 rounded-2xl px-1.5 py-2 text-center text-[11px] transition-all duration-200 sm:px-2 sm:py-3 sm:text-xs",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                    isSelected
                      ? "bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-md shadow-sky-300/70"
                      : "bg-white/80 text-slate-700 hover:bg-sky-50 border border-sky-100",
                    isToday && !isSelected
                      ? "ring-1 ring-sky-300"
                      : "",
                  ].join(" ")}
                >
                  <span className="font-semibold">
                    {format(date, "EEE", { locale: id })}
                  </span>
                  <span className="text-sm sm:text-base">
                    {format(date, "dd")}
                  </span>
                  {isToday && (
                    <span className="mt-0.5 rounded-full bg-emerald-400/90 px-2 py-[1px] text-[10px] font-semibold text-white">
                      Hari ini
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* DATE PICKER ROW */}
          <div className="mt-6 flex flex-col gap-3 border-t border-sky-50 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Tanggal terpilih
              </p>
              <p className="text-sm font-medium text-slate-800">
                {format(selectedDateObj, "EEEE, dd MMMM yyyy", {
                  locale: id,
                })}
              </p>
            </div>

            <div className="w-full max-w-xs">
              <label
                htmlFor="date-picker"
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Pilih tanggal lain
              </label>
              <input
                type="date"
                id="date-picker"
                value={selectedDate}
                onChange={handleDateChange}
                className="block w-full rounded-full border border-sky-100 bg-white px-3 py-2 text-xs shadow-sm focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
          </div>
        </section>

        {/* CONTENT: LOADING / ERROR / TIMESLOTS */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-4 h-12 w-12">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
              <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-sky-500" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Memuat jadwal yang tersedia...
            </p>
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-white/90 p-6 text-center shadow-xl">
            <p className="text-sm font-semibold text-red-600">
              Terjadi kesalahan saat mengambil jadwal.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {error?.message || "Silakan coba lagi beberapa saat lagi."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Coba muat ulang
            </button>
          </div>
        ) : timeSlotsForSelectedDate.length === 0 ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-sky-100 bg-white/90 p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
              <CalendarDays className="h-6 w-6 text-sky-500" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Tidak ada jadwal yang tersedia untuk tanggal
            </p>
            <p className="mt-1 text-sm font-semibold text-sky-600">
              {format(selectedDateObj, "dd MMMM yyyy", { locale: id })}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Coba pilih hari lain atau minggu berikutnya untuk melihat
              ketersediaan jadwal.
            </p>
          </div>
        ) : (
          <section className="space-y-4">
            {/* ⬅ microcopy flow booking */}
            <div className="flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-xs text-slate-600 shadow-sm sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-2">
                <div className="mt-[3px] flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                  <Sparkles className="h-3 w-3 text-sky-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    Cara melakukan reservasi:
                  </p>
                  <ol className="mt-1 list-decimal pl-4 space-y-0.5">
                    <li>Pilih hari di atas dan lihat jam yang masih tersedia.</li>
                    <li>
                      Tekan tombol <span className="font-semibold">“Booking”</span>{" "}
                      di jam yang diinginkan.
                    </li>
                    <li>
                      Anda akan diarahkan ke halaman{" "}
                      <span className="font-semibold">Layanan</span> untuk
                      memilih jenis perawatan & menyelesaikan reservasi.
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Jadwal tersedia
              </p>
              <p className="text-xs text-slate-500">
                {timeSlotsForSelectedDate.length} blok waktu dengan sesi
                tersedia
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {timeSlotsForSelectedDate.map((timeSlot) => {
                const availableSessions = timeSlot.sessions.filter(
                  (session) => !session.isBooked
                );

                const hasAvailable = availableSessions.length > 0;

                return (
                  <div
                    key={timeSlot.id}
                    className={[
                      "group flex flex-col rounded-2xl border bg-white/95 p-4 shadow-md transition-all duration-200",
                      "border-sky-100/70 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl",
                    ].join(" ")}
                  >
                    {/* Time header */}
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                          Jam sesi
                        </p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatTime(timeSlot.startTime)} –{" "}
                          {formatTime(timeSlot.endTime)}
                        </p>
                      </div>
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          hasAvailable
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-50 text-slate-500 border border-slate-100",
                        ].join(" ")}
                      >
                        {hasAvailable
                          ? `${availableSessions.length} sesi tersedia`
                          : "Penuh"}
                      </span>
                    </div>

                    <div className="h-px w-full bg-gradient-to-r from-sky-100 via-slate-100 to-sky-100" />

                    <div className="mt-3 space-y-2">
                      {hasAvailable ? (
                        availableSessions.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between rounded-xl border border-sky-50 bg-sky-50/50 px-3 py-2 text-xs shadow-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-400" />
                              <span className="font-medium text-slate-800">
                                {session.staff.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => navigate("/services")}
                              className="rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
                            >
                              Booking
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="py-2 text-[11px] italic text-slate-500">
                          Tidak ada sesi kosong pada jam ini.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
