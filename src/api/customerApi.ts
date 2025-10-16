// src/api/customerApi.ts
import apiClient from "./apiClient"; // Asumsi Anda punya instance Axios yang terkonfigurasi
import {
  ApiResponse,
  Customer,
  Reservation,
  UpdateProfilePayload,
  PaymentDetails,
  PaymentMethod,
  ReservationPayload,
  CreateReservationResponse,
  AvailableTimeSlotResponse, // Import tipe baru
  RegisterPayload,
  VerifyOtpPayload,
  ResendOtpPayload,
  OnlineRatingPayload,
  Rating,
} from "../types"; // Asumsi Anda punya file types yang sesuai

// --- BARU: Fungsi untuk registrasi customer ---
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

// --- BARU: Fungsi untuk verifikasi OTP ---
/**
 * Memverifikasi OTP yang dimasukkan oleh pengguna.
 * @param payload - Data verifikasi (email, otp).
 */
export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<ApiResponse<null>> => {
  // Backend hanya mengembalikan message, jadi data bisa null
  const response = await apiClient.post<ApiResponse<null>>(
    "/customer/verify-otp",
    payload
  );
  return response.data;
};

// --- BARU: Fungsi untuk mengirim ulang OTP ---
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
 * Fungsi ini menerjemahkan filter 'upcoming' dan 'past' menjadi
 * parameter query yang dapat dimengerti oleh backend.
 *
 * @param status - Filter berdasarkan status reservasi ("upcoming", "past", atau status spesifik).
 * @param limit - Batasi jumlah hasil (opsional).
 * @returns Promise yang berisi daftar reservasi beserta data paginasi.
 */
export const getMyReservations = async (
  status?: "upcoming" | "past" | string,
  limit?: number
): Promise<ApiResponse<Reservation[]>> => {
  // PERBAIKAN: Tipe data sekarang adalah array reservasi
  const params = new URLSearchParams();

  if (status) {
    // Memperbarui filter status agar lebih akurat dengan alur reservasi
    if (status === "upcoming") {
      const upcomingStatuses = ["PENDING", "CONFIRMED", "IN_PROGRESS"];
      upcomingStatuses.forEach((s) => params.append("status", s));
      params.append("orderBy", "sessionTime:asc"); // Urutkan berdasarkan waktu sesi untuk "upcoming"
    } else if (status === "past") {
      const pastStatuses = ["COMPLETED", "CANCELLED", "EXPIRED"];
      pastStatuses.forEach((s) => params.append("status", s));
      params.append("orderBy", "sessionTime:desc"); // Urutkan berdasarkan waktu sesi untuk "past"
    } else {
      params.append("status", status);
    }
  }

  if (limit) {
    params.append("limit", limit.toString());
  }

  // Tipe generic pada get() juga diperbarui
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
 * API langsung mengembalikan objek Customer.
 */
export const getMyProfile = async (): Promise<Customer> => {
  // Change the generic type to Customer directly if the API returns Customer object as top level
  const response = await apiClient.get<Customer>("/customer/profile");

  // Based on your example, `response.data` already IS the Customer object.
  // So, we return `response.data` instead of `response.data.data`.
  return response.data; // <--- This is the crucial change
};

/**
 * Memperbarui data profil pelanggan.
 * @param payload - Data baru untuk profil, HARUS menyertakan `id`.
 */
export const updateMyProfile = async (
  payload: UpdateProfilePayload
): Promise<ApiResponse<Customer>> => {
  // Menggunakan `payload.id` untuk membangun URL, sesuai dengan backend.
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
}): Promise<ApiResponse<any>> => {
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
 * BARU: Mengambil daftar time slots yang tersedia untuk tanggal tertentu.
 * Ini akan digunakan для menampilkan jadwal secara real-time.
 * @param dateString - Tanggal dalam format YYYY-MM-DD.
 * @returns Promise yang berisi daftar time slots beserta sesi yang tersedia.
 */
export const getAvailableTimeSlotsForDate = async (
  dateString: string
): Promise<ApiResponse<AvailableTimeSlotResponse[]>> => {
  // PERBAIKAN: Hapus query parameter `duration` karena tidak digunakan oleh endpoint ini
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
