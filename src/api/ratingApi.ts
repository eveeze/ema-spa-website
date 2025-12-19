// src/api/ratingApi.ts
import apiClient from "./apiClient";

export interface RatingSessionData {
  serviceName: string;
  staffName: string;
  customerName?: string; // Optional tergantung response backend
}

export interface ManualRatingPayload {
  token: string;
  rating: number;
  comment: string;
}

export const ratingApi = {
  // Mengambil info sesi berdasarkan token (GET /api/ratings/session/:token)
  getSessionByToken: async (token: string) => {
    const response = await apiClient.get<{
      success: boolean;
      data: RatingSessionData;
    }>(`/ratings/session/${token}`);
    return response.data;
  },

  // Mengirim rating manual (POST /api/ratings/manual)
  submitManualRating: async (data: ManualRatingPayload) => {
    const response = await apiClient.post("/ratings/manual", data);
    return response.data;
  },
};
