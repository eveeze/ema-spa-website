// src/hooks/useCustomerReservations.ts

import { useQuery } from "@tanstack/react-query";
import { getMyReservations } from "../api/customerApi";

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
    queryKey: ["myReservations", status, limit],
    queryFn: () => getMyReservations(status, limit),
    // PERBAIKAN FINAL: 'response.data' sudah merupakan array reservasi yang kita inginkan.
    // Struktur respons dari API adalah { success, message, data: [...] }.
    // Jadi, kita hanya perlu mengambil properti 'data' tersebut.
    select: (response) => response.data,
  });
};
