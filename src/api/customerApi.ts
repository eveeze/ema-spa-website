// src/api/customerApi.ts
import apiClient from "./apiClient";
import {
  ApiResponse,
  Customer,
  Reservation,
  UpdateProfilePayload,
  PaymentDetails,
  PaymentMethod,
  ReservationPayload,
  CreateReservationResponse,
  AvailableTimeSlotResponse,
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  OnlineRatingPayload,
  Rating,
  ReschedulePayload, // BARU: Import tipe ini
} from "../types";

/**
 * Mendaftarkan customer baru.
 * @param payload - Data registrasi (nama, email, no. telp, password).
 */
export const registerCustomer = async (
  payload: RegisterPayload
): Promise<ApiResponse<{ customer: Customer }>> => {
  const response = await apiClient.post<ApiResponse<{ customer: Customer }>>(
    "/customer/register",
    payload
  );
  return response.data;
};

/**
 * Memverifikasi OTP yang dimasukkan oleh pengguna.
 * @param payload - Data verifikasi (email, otp).
 */
export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(
    "/customer/verify-otp",
    payload
  );
  return response.data;
};

/**
 * Meminta server untuk mengirim ulang OTP ke email pengguna.
 * @param payload - Data (email).
 */
export const resendOtp = async (
  payload: ResendOtpPayload
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(
    "/customer/resend-otp",
    payload
  );
  return response.data;
};

/**
 * Mengambil daftar reservasi milik pelanggan yang sedang login.
 */
export const getMyReservations = async (
  status?: "upcoming" | "past" | string,
  limit?: number
): Promise<ApiResponse<Reservation[]>> => {
  const params = new URLSearchParams();

  if (status) {
    if (status === "upcoming") {
      const upcomingStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS"];
      upcomingStatuses.forEach((s) => params.append("status", s));
      params.append("orderBy", "sessionTime:asc");
    } else if (status === "past") {
      const pastStatuses = ["COMPLETED", "CANCELLED", "EXPIRED"];
      pastStatuses.forEach((s) => params.append("status", s));
      params.append("orderBy", "sessionTime:desc");
    } else {
      params.append("status", status);
    }
  }

  if (limit) {
    params.append("limit", limit.toString());
  }

  const response = await apiClient.get<ApiResponse<Reservation[]>>(
    `/reservations/customer?${params.toString()}`
  );

  return response.data;
};

/**
 * Mengambil detail satu reservasi berdasarkan ID-nya.
 * @param reservationId - ID dari reservasi yang ingin dilihat.
 */
export const getReservationById = async (
  reservationId: string
): Promise<ApiResponse<Reservation>> => {
  const response = await apiClient.get<ApiResponse<Reservation>>(
    `/reservations/customer/${reservationId}`
  );
  return response.data;
};

/**
 * Mengambil data profil pelanggan yang sedang login.
 */
export const getMyProfile = async (): Promise<Customer> => {
  const response = await apiClient.get<Customer>("/customer/profile");
  return response.data;
};

/**
 * Memperbarui data profil pelanggan.
 * @param payload - Data baru untuk profil, HARUS menyertakan `id`.
 */
export const updateMyProfile = async (
  payload: UpdateProfilePayload
): Promise<ApiResponse<Customer>> => {
  const response = await apiClient.put<ApiResponse<Customer>>(
    `/customer/update/${payload.id}`,
    {
      name: payload.name,
      phoneNumber: payload.phoneNumber,
    }
  );
  return response.data;
};

/**
 * Membuat reservasi baru.
 * @param payload - Data yang diperlukan untuk membuat reservasi.
 */
export const createReservation = async (
  payload: ReservationPayload
): Promise<ApiResponse<CreateReservationResponse>> => {
  const response = await apiClient.post<ApiResponse<CreateReservationResponse>>(
    "/reservations",
    payload
  );
  return response.data;
};

/**
 * Mengambil daftar metode pembayaran yang tersedia dari Tripay.
 */
export const getAvailablePaymentMethods = async (): Promise<
  ApiResponse<PaymentMethod[]>
> => {
  const response = await apiClient.get<ApiResponse<PaymentMethod[]>>(
    "/reservations/payment-methods"
  );
  return response.data;
};

/**
 * Mengambil detail pembayaran untuk sebuah reservasi.
 * @param reservationId - ID reservasi.
 */
export const getPaymentDetails = async (
  reservationId: string
): Promise<ApiResponse<PaymentDetails>> => {
  const response = await apiClient.get<ApiResponse<PaymentDetails>>(
    `/reservations/payment/${reservationId}`
  );
  return response.data;
};

/**
 * Mengunggah bukti pembayaran manual (transfer bank).
 * @param reservationId - ID reservasi terkait.
 * @param file - File bukti pembayaran.
 */
export const uploadPaymentProof = async ({
  reservationId,
  file,
}: {
  reservationId: string;
  file: File;
}): Promise<ApiResponse<unknown>> => {
  const formData = new FormData();
  formData.append("paymentProof", file);

  const response = await apiClient.post(
    `/reservations/payment/${reservationId}/proof`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

/**
 * Mengambil daftar time slots yang tersedia untuk tanggal tertentu.
 * @param dateString - Tanggal dalam format YYYY-MM-DD.
 */
export const getAvailableTimeSlotsForDate = async (
  dateString: string
): Promise<ApiResponse<AvailableTimeSlotResponse[]>> => {
  const response = await apiClient.get<
    ApiResponse<AvailableTimeSlotResponse[]>
  >(`/time-slot/available/${dateString}`);
  return response.data;
};

/**
 * Mengirim rating untuk sebuah reservasi oleh customer yang login.
 * @param payload - Data rating (reservationId, rating, comment).
 */
export const createOnlineRating = async (
  payload: OnlineRatingPayload
): Promise<ApiResponse<Rating>> => {
  const response = await apiClient.post<ApiResponse<Rating>>(
    "/ratings",
    payload
  );
  return response.data;
};

/**
 * BARU: Melakukan penjadwalan ulang (reschedule) reservasi.
 * @param payload - Data reschedule (reservationId, newSessionId).
 */
export const rescheduleReservation = async (
  payload: ReschedulePayload
): Promise<ApiResponse<Reservation>> => {
  // Endpoint sesuai backend: PUT /api/reservations/customer/:id/reschedule
  const response = await apiClient.put<ApiResponse<Reservation>>(
    `/reservations/customer/${payload.reservationId}/reschedule`,
    {
      newSessionId: payload.newSessionId,
    }
  );
  return response.data;
};
