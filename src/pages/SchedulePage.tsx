// src/pages/SchedulePage.tsx

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // BARU: Impor useNavigate
import { useAvailableSchedule } from "../hooks/useCustomerHooks";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { id } from "date-fns/locale";

function SchedulePage() {
  const navigate = useNavigate(); // BARU: Inisialisasi useNavigate
  const today = new Date();
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

  const daysInWeek = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  }, [currentWeekStart]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    const newDateObj = new Date(newDate);
    if (
      !isSameDay(newDateObj, new Date(selectedDate)) &&
      (newDateObj < currentWeekStart ||
        newDateObj > endOfWeek(currentWeekStart, { weekStartsOn: 1 }))
    ) {
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

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    });
  };

  const timeSlotsForSelectedDate = availableTimeSlots || [];

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Jadwal Sesi Tersedia
      </h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousWeek}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            &lt; Sebelumnya
          </button>
          <h2 className="text-xl font-semibold text-gray-700 text-center">
            {format(currentWeekStart, "dd MMMM", { locale: id })} -{" "}
            {format(
              endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
              "dd MMMM yyyy",
              { locale: id }
            )}
          </h2>
          <button
            onClick={goToNextWeek}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
          >
            Berikutnya &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm mb-6">
          {daysInWeek.map((date) => (
            <div
              key={format(date, "yyyy-MM-dd")}
              onClick={() => handleDayClick(date)}
              className={`p-2 rounded-md cursor-pointer transition
                ${
                  isSameDay(date, new Date(selectedDate))
                    ? "bg-blue-600 text-white font-bold shadow-md"
                    : "hover:bg-gray-100"
                }
                ${
                  isSameDay(date, today) &&
                  !isSameDay(date, new Date(selectedDate))
                    ? "border-2 border-blue-500"
                    : ""
                }`}
            >
              <p className="font-semibold">
                {format(date, "EEE", { locale: id })}
              </p>
              <p>{format(date, "dd")}</p>
            </div>
          ))}
        </div>

        <div className="w-full">
          <label
            htmlFor="date-picker"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Atau Pilih Tanggal Lain:
          </label>
          <input
            type="date"
            id="date-picker"
            value={selectedDate}
            onChange={handleDateChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Memuat jadwal yang tersedia...</p>
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-red-600">
          <p>
            Terjadi kesalahan saat mengambil jadwal:{" "}
            {error?.message || "Unknown error"}
          </p>
        </div>
      ) : (
        <>
          {timeSlotsForSelectedDate.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timeSlotsForSelectedDate.map((timeSlot) => (
                <div
                  key={timeSlot.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {formatTime(timeSlot.startTime)} -{" "}
                      {formatTime(timeSlot.endTime)}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <p className="font-medium text-gray-800">Sesi Tersedia:</p>
                    {timeSlot.sessions.filter((session) => !session.isBooked)
                      .length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {timeSlot.sessions
                          .filter((session) => !session.isBooked)
                          .map((session) => (
                            <li
                              key={session.id}
                              className="py-2 flex justify-between items-center"
                            >
                              <span className="text-gray-700">
                                {session.staff.name}
                              </span>
                              {/* DIUBAH: Fungsi onClick pada tombol ini */}
                              <button
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                onClick={() => navigate("/services")}
                              >
                                Booking
                              </button>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-red-500 text-sm italic">
                        Tidak ada sesi yang tersedia.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">
                Tidak ada jadwal yang tersedia untuk tanggal{" "}
                <span className="font-semibold text-blue-600">
                  {format(
                    new Date(selectedDate + "T00:00:00"),
                    "dd MMMM yyyy",
                    {
                      locale: id,
                    }
                  )}
                </span>
                .
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SchedulePage;
