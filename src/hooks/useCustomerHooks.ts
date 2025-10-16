// src/hooks/useCustomerHooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as customerApi from "../api/customerApi";
import {
  ReservationPayload,
  UpdateProfilePayload,
  AvailableTimeSlotResponse,
  OnlineRatingPayload,
} from "../types";

// Kunci query untuk manajemen cache yang konsisten
const QUERY_KEYS = {
  RESERVATIONS: "myReservations",
  RESERVATION_DETAIL: "reservationDetail",
  PROFILE: "customerProfile",
  PAYMENT_METHODS: "paymentMethods",
  PAYMENT_DETAILS: "paymentDetails",
  AVAILABLE_SCHEDULE: "availableSchedule", // Kunci baru untuk jadwal
  RATING_SESSION: "ratingSession", // BARU
};

/**
 * Hook untuk mengambil daftar reservasi pelanggan.
 * @param status - Filter status ('upcoming', 'past', atau status spesifik).
 * @param limit - Batas jumlah data.
 */
export const useCustomerReservations = (
  status?: "upcoming" | "past" | string,
  limit?: number
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RESERVATIONS, status, limit],
    queryFn: () => customerApi.getMyReservations(status, limit),
    // `response.data` sudah merupakan array reservasi dari ApiResponse.data
    select: (response) => response.data,
  });
};

/**
 * Hook untuk mengambil detail satu reservasi.
 * @param reservationId - ID reservasi.
 */
export const useCustomerReservationById = (reservationId: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.RESERVATION_DETAIL, reservationId],
    queryFn: () => customerApi.getReservationById(reservationId!),
    enabled: !!reservationId, // Query hanya akan berjalan jika reservationId tidak null
    select: (response) => response.data,
  });
};

/**
 * Hook untuk mengambil profil pelanggan yang sedang login.
 */
export const useCustomerProfile = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: customerApi.getMyProfile,
    // Fungsi `select` dihapus karena `getMyProfile` kini
    // langsung mengembalikan data profil yang dibutuhkan setelah perbaikan di api/customerApi.ts
  });
};

/**
 * Hook (Mutation) untuk memperbarui profil pelanggan.
 */
export const useUpdateCustomerProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      customerApi.updateMyProfile(payload),
    onSuccess: () => {
      // Setelah berhasil, batalkan (invalidate) cache profil
      // agar data baru di-fetch secara otomatis.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PROFILE] });
    },
  });
};

/**
 * Hook (Mutation) untuk membuat reservasi baru.
 */
export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReservationPayload) =>
      customerApi.createReservation(payload),
    onSuccess: () => {
      // Invalidate semua query reservasi agar daftar reservasi diperbarui.
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESERVATIONS] });
      // Mungkin juga invalidate jadwal yang terkait jika reservasi mempengaruhi ketersediaan
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AVAILABLE_SCHEDULE],
      });
    },
  });
};

/**
 * Hook untuk mengambil metode pembayaran yang tersedia.
 */
export const useAvailablePaymentMethods = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_METHODS],
    queryFn: customerApi.getAvailablePaymentMethods,
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5, // Cache selama 5 menit karena jarang berubah
  });
};

/**
 * Hook untuk mengambil detail pembayaran dari sebuah reservasi.
 * @param reservationId - ID Reservasi.
 */
export const usePaymentDetails = (reservationId: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_DETAILS, reservationId],
    queryFn: () => customerApi.getPaymentDetails(reservationId!),
    enabled: !!reservationId,
    select: (response) => response.data,
  });
};

/**
 * BARU: Hook untuk mengambil jadwal sesi yang tersedia untuk tanggal tertentu.
 * @param dateString - Tanggal yang dipilih (format YYYY-MM-DD).
 */
export const useAvailableSchedule = (dateString: string | null) => {
  return useQuery<AvailableTimeSlotResponse[]>({
    // PERBAIKAN: Hapus `duration` dari queryKey
    queryKey: [QUERY_KEYS.AVAILABLE_SCHEDULE, dateString],
    queryFn: async () => {
      if (!dateString) {
        // PERBAIKAN: Kondisi disederhanakan
        throw new Error("Date is required to fetch available schedule.");
      }
      // PERBAIKAN: Panggil API tanpa `duration`
      const response = await customerApi.getAvailableTimeSlotsForDate(
        dateString
      );
      return response.data;
    },
    // PERBAIKAN: `enabled` hanya bergantung pada `dateString`
    enabled: !!dateString,
    staleTime: 1000 * 60, // Cache selama 1 menit
    refetchInterval: 1000 * 60 * 5, // Otomatis refetch setiap 5 menit
  });
};

/**
 * Hook (Mutation) untuk membuat rating online oleh customer.
 */
export const useCreateOnlineRating = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OnlineRatingPayload) =>
      customerApi.createOnlineRating(payload),
    onSuccess: (_data, variables) => {
      // Setelah berhasil, invalidate query detail reservasi yang relevan
      // agar UI diperbarui (misalnya, tombol rating hilang).
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.RESERVATION_DETAIL, variables.reservationId],
      });
      // Invalidate juga daftar reservasi
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESERVATIONS] });
    },
  });
};
