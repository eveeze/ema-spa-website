// src/types/index.ts

// Tipe umum untuk respons API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

// Tipe untuk entitas dasar
export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface PriceTier {
  id: string;
  tierName: string;
  minBabyAge: number;
  maxBabyAge: number;
  price: number;
}

export interface Rating {
  id: string;
  rating: number;
  comment?: string;
  customerId: string;
  createdAt: string;
}

// --- Tipe Service (KEMBALI KE VERSI LENGKAP ASLI ANDA) ---
export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
  hasPriceTiers: boolean;
  price: number | null;
  minBabyAge: number | null;
  maxBabyAge: number | null;
  averageRating: number | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  category: Category;
  priceTiers: PriceTier[];
  ratings: Rating[];
}

// Tipe untuk jadwal dan sesi
export interface OperatingSchedule {
  id: string;
  date: string; // ISO date string
  isHoliday: boolean;
}

export interface TimeSlot {
  id: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  operatingSchedule: OperatingSchedule;
  sessions: Session[]; // Menambahkan sessions ke TimeSlot
}

export interface Session {
  id: string;
  isBooked: boolean;
  staff: Staff;
  timeSlot: TimeSlot;
  // Reservation bisa null jika session belum terhubung ke reservasi
  reservation: Reservation | null; // Tambahkan ini
}

// Tipe untuk Reservasi
export interface Reservation {
  id: string;
  babyName: string;
  babyAge: number;
  notes: string | null;
  parentNames?: string | null;
  reservationType: "ONLINE" | "MANUAL";
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "EXPIRED"
    | "IN_PROGRESS";
  totalPrice: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  service: Pick<Service, "id" | "name" | "duration" | "imageUrl">;
  staff: Staff; // DITAMBAHKAN: Tambahkan properti staff di sini
  session: Session;
  customer: Pick<Customer, "id" | "name">;
  payment?: Payment;
  rating?: Rating | null; // <-- TAMBAHKAN BARIS INI
}

// Tipe untuk Pembayaran
export interface Payment {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
  paymentMethod: string;
  paymentUrl: string | null;
  qrCode: string | null;
  instructions: Record<string, unknown>;
  expiryDate: string; // ISO date string
  paymentDate: string | null; // ISO date string
  paymentProof?: string | null; // DITAMBAHKAN
}

// Tipe untuk detail pembayaran lengkap (gabungan payment dan reservation)
export interface PaymentDetails {
  payment: Payment;
  reservation: Reservation;
}

// Tipe untuk metode pembayaran dari Tripay
export interface PaymentMethod {
  code: string;
  name: string;
  type: string;
  fee: {
    flat: number;
    percent: number;
  };
  iconUrl: string;
}

// Tipe untuk payload saat membuat reservasi baru
export interface ReservationPayload {
  serviceId: string;
  sessionId: string;
  babyName: string;
  babyAge: number;
  priceTierId?: string | null;
  notes?: string;
  paymentMethod: string;
}

// Tipe untuk respons API setelah berhasil membuat reservasi
export interface CreateReservationResponse {
  reservation: {
    id: string;
    status: string;
    serviceName: string;
  };
  payment: {
    id: string;
    status: string;
    expiryDate: string;
    tripayPaymentUrl: string;
    qrCode: string | null;
    instructions: Record<string, unknown>;
  };
}

// Tipe untuk payload saat mengupdate profil customer
export interface UpdateProfilePayload {
  id: string; // ID dibutuhkan untuk parameter route
  name: string;
  phoneNumber: string;
}

// BARU: Tipe untuk payload registrasi customer
export interface RegisterPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// BARU: Tipe untuk payload verifikasi OTP
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

// BARU: Tipe untuk payload kirim ulang OTP
export interface ResendOtpPayload {
  email: string;
}
export interface AvailableTimeSlotResponse {
  id: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  operatingSchedule: OperatingSchedule;
  sessions: {
    id: string;
    isBooked: boolean;
    staff: Staff;
    reservation: {
      id: string;
      status: string;
    } | null; // Hanya jika session sudah terhubung ke reservasi
  }[];
}

export interface Notification {
  id: string;
  recipientType: "customer" | "owner";
  recipientId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  referenceId: string | null;
  createdAt: string; // ISO date string
}

export interface OnlineRatingPayload {
  reservationId: string;
  rating: number;
  comment?: string;
}

export interface RatingSessionData {
  serviceName: string;
  staffName: string;
}
