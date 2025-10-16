// src/services/oneSignalService.ts
import OneSignal from "react-onesignal";
import apiClient from "../api/apiClient";

let isInitialized = false;

// Fungsi untuk inisialisasi OneSignal
export const initOneSignal = async (): Promise<void> => {
  if (isInitialized) {
    console.log("OneSignal sudah diinisialisasi sebelumnya");
    return;
  }

  try {
    await OneSignal.init({
      appId: "adb63973-e191-4d84-8454-2f5e168ffad0",
      allowLocalhostAsSecureOrigin: true,
      // Konfigurasi tambahan untuk ngrok
      serviceWorkerParam: {
        scope: "/push/onesignal/",
      },
      serviceWorkerPath: "OneSignalSDKWorker.js",
      // Tambahkan delay untuk memastikan service worker ready
      serviceWorkerUpdaterTimeoutMs: 120000,
    });

    isInitialized = true;
    console.log("OneSignal berhasil diinisialisasi dari service");
  } catch (error) {
    console.error("Gagal menginisialisasi OneSignal:", error);
    isInitialized = false;
    throw error;
  }
};

// Fungsi untuk mengirim playerId ke backend
export const sendPlayerIdToBackend = async (
  playerId: string
): Promise<void> => {
  if (!playerId) {
    console.warn("Player ID tidak ditemukan, pengiriman dibatalkan.");
    return;
  }

  try {
    const response = await apiClient.post("/api/customer/update-player-id", {
      playerId,
    });

    console.log(
      "Player ID berhasil dikirim ke backend:",
      response.data?.message
    );
  } catch (error: unknown) {
    console.error("Error saat mengirim Player ID ke backend:", error);

    let message = "Gagal mengirim Player ID ke backend.";
    let status: number | undefined;

    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as Record<string, unknown>).response === "object"
    ) {
      const response = (
        error as { response?: { data?: unknown; status?: number } }
      ).response;
      message =
        typeof response?.data === "object" && response?.data !== null
          ? JSON.stringify(response.data)
          : String(response?.data || message);
      status = response?.status;
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error("Error detail:", message);

    if (status === 401) {
      console.log("Token mungkin expired, coba refresh atau login ulang");
    }
  }
};

// Fungsi untuk mendapatkan player ID saat ini
export const getCurrentPlayerId = (): string | null => {
  try {
    return OneSignal.User?.onesignalId || null;
  } catch (error) {
    console.error("Error mendapatkan player ID:", error);
    return null;
  }
};

// Fungsi untuk cek apakah OneSignal sudah siap
export const isOneSignalReady = (): boolean => {
  return isInitialized && OneSignal.User !== undefined;
};
