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
  ReschedulePayload,
} from "../types";

// --- Tipe Data untuk Forgot Password ---
export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

/**
 * Mendaftarkan customer baru.
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
 * Memverifikasi OTP registrasi.
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
 * Mengirim ulang OTP registrasi.
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

// --- IMPLEMENTASI FORGOT PASSWORD BARU ---

/**
 * Langkah 1: Request OTP untuk reset password
 */
export const forgotPassword = async (
  payload: ForgotPasswordPayload
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post("/customer/forgot-password", payload);
  return response.data;
};

/**
 * Langkah 2: Verifikasi OTP Reset Password
 */
export const verifyResetOtp = async (
  payload: VerifyResetOtpPayload
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post("/customer/verify-reset-otp", payload);
  return response.data;
};

/**
 * Langkah 3: Set Password Baru
 */
export const resetPassword = async (
  payload: ResetPasswordPayload
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post("/customer/reset-password", payload);
  return response.data;
};

// --- END IMPLEMENTASI BARU ---

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
 * Mengambil daftar metode pembayaran yang tersedia.
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
 * Mengunggah bukti pembayaran manual.
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
 * Mengambil daftar time slots yang tersedia.
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
 * Mengirim rating online.
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
 * Melakukan penjadwalan ulang (reschedule) reservasi.
 */
export const rescheduleReservation = async (
  payload: ReschedulePayload
): Promise<ApiResponse<Reservation>> => {
  const response = await apiClient.put<ApiResponse<Reservation>>(
    `/reservations/customer/${payload.reservationId}/reschedule`,
    {
      newSessionId: payload.newSessionId,
    }
  );
  return response.data;
};
