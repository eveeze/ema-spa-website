// src/hooks/useCustomerHooks.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as customerApi from "../api/customerApi";
import { useAuth } from "./useAuth"; // ✅ Pastikan import ini ada
import {
  ReservationPayload,
  UpdateProfilePayload,
  AvailableTimeSlotResponse,
  OnlineRatingPayload,
  ReschedulePayload,
} from "../types";

// Kunci query untuk manajemen cache yang konsisten
const QUERY_KEYS = {
  RESERVATIONS: "myReservations",
  RESERVATION_DETAIL: "reservationDetail",
  PROFILE: "customerProfile",
  PAYMENT_METHODS: "paymentMethods",
  PAYMENT_DETAILS: "paymentDetails",
  AVAILABLE_SCHEDULE: "availableSchedule",
  RATING_SESSION: "ratingSession",
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
  // ✅ Mengambil token untuk mencegah request sebelum token siap
  const { token } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEYS.RESERVATIONS, status, limit],
    queryFn: () => customerApi.getMyReservations(status, limit),
    // ✅ PERBAIKAN: Fetch jika token ada
    enabled: !!token,
    select: (response) => response.data,
  });
};

/**
 * Hook untuk mengambil detail satu reservasi.
 * @param reservationId - ID reservasi.
 */
export const useCustomerReservationById = (reservationId: string | null) => {
  const { token } = useAuth(); // ✅ Ambil token
  return useQuery({
    queryKey: [QUERY_KEYS.RESERVATION_DETAIL, reservationId],
    queryFn: () => customerApi.getReservationById(reservationId!),
    // ✅ PERBAIKAN: Fetch jika ID ada DAN token ada
    enabled: !!reservationId && !!token,
    select: (response) => response.data,
  });
};

/**
 * Hook untuk mengambil profil pelanggan yang sedang login.
 */
export const useCustomerProfile = () => {
  const { token } = useAuth(); // ✅ Ambil token
  return useQuery({
    queryKey: [QUERY_KEYS.PROFILE],
    queryFn: customerApi.getMyProfile,
    // ✅ PERBAIKAN: Fetch profil hanya jika token ada
    enabled: !!token,
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESERVATIONS] });
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
  // Metode pembayaran biasanya public atau tidak butuh token spesifik user (opsional)
  // Tapi jika butuh token, tambahkan enabled: !!token
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_METHODS],
    queryFn: customerApi.getAvailablePaymentMethods,
    select: (response) => response.data,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook untuk mengambil detail pembayaran dari sebuah reservasi.
 * @param reservationId - ID Reservasi.
 */
export const usePaymentDetails = (reservationId: string | null) => {
  const { token } = useAuth(); // ✅ Ambil token
  return useQuery({
    queryKey: [QUERY_KEYS.PAYMENT_DETAILS, reservationId],
    queryFn: () => customerApi.getPaymentDetails(reservationId!),
    // ✅ PERBAIKAN: Fetch jika ID ada DAN token ada
    enabled: !!reservationId && !!token,
    select: (response) => response.data,
  });
};

/**
 * Hook untuk mengambil jadwal sesi yang tersedia untuk tanggal tertentu.
 * @param dateString - Tanggal yang dipilih (format YYYY-MM-DD).
 */
export const useAvailableSchedule = (dateString: string | null) => {
  // Jadwal biasanya public, tapi jika butuh token, tambahkan di sini
  return useQuery<AvailableTimeSlotResponse[]>({
    queryKey: [QUERY_KEYS.AVAILABLE_SCHEDULE, dateString],
    queryFn: async () => {
      if (!dateString) {
        throw new Error("Date is required to fetch available schedule.");
      }
      const response = await customerApi.getAvailableTimeSlotsForDate(
        dateString
      );
      return response.data;
    },
    enabled: !!dateString,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5,
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
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.RESERVATION_DETAIL, variables.reservationId],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESERVATIONS] });
    },
  });
};

/**
 * Hook (Mutation) untuk melakukan reschedule reservasi.
 */
export const useRescheduleReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReschedulePayload) =>
      customerApi.rescheduleReservation(payload),
    onSuccess: (_data, variables) => {
      // 1. Perbarui data detail reservasi yang sedang dilihat
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.RESERVATION_DETAIL, variables.reservationId],
      });
      // 2. Perbarui daftar reservasi di dashboard
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.RESERVATIONS] });
      // 3. Perbarui ketersediaan jadwal (karena slot berubah)
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.AVAILABLE_SCHEDULE],
      });
    },
  });
};
