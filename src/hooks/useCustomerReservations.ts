// src/hooks/useCustomerReservations.ts

import { useQuery } from "@tanstack/react-query";
import { getMyReservations } from "../api/customerApi";
import { useAuth } from "./useAuth"; // 1. Pastikan Anda mengimpor hook auth Anda

/**
 * Hook untuk mengambil daftar reservasi pelanggan.
 * @param status - Filter status ('upcoming', 'past', atau status spesifik).
 * @param limit - Batas jumlah data.
 */
export const useCustomerReservations = (
  status?: "upcoming" | "past" | string,
  limit?: number
) => {
  // 2. Ambil status autentikasi & token
  // Sesuaikan 'isAuthenticated' dan 'token' dengan apa yang dikembalikan useAuth() Anda
  const { isAuthenticated, token } = useAuth();

  return useQuery({
    queryKey: ["myReservations", status, limit],
    queryFn: () => getMyReservations(status, limit),

    // 3. PERBAIKAN UTAMA: 'enabled'
    // Query ini HANYA akan jalan jika:
    // - User sudah terautentikasi (isAuthenticated true)
    // - Token tidak null/undefined
    enabled: !!isAuthenticated && !!token,

    // Opsional: Jika token berubah (misal baru login), data lama dihapus agar bersih
    refetchOnMount: true,

    select: (response) => response.data,
  });
};
