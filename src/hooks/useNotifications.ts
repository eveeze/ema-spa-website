// src/hooks/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../api/apiClient";
import { Notification } from "../types";

const fetchNotifications = async (): Promise<Notification[]> => {
  const { data } = await apiClient.get("/notifications");
  return data.data;
};

// Fungsi untuk menandai notifikasi sebagai sudah dibaca
const markNotificationAsRead = async (notificationId: string) => {
  const { data } = await apiClient.patch(
    `/notifications/${notificationId}/read`
  );
  return data.data;
};

export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<Notification[], Error>({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 5 * 60 * 1000, // Ambil data ulang setiap 5 menit
  });

  // Mutation untuk update status
  const mutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: (updatedNotification) => {
      // Perbarui cache React Query secara manual agar UI langsung update
      queryClient.setQueryData(
        ["notifications"],
        (oldData: Notification[] | undefined) => {
          return oldData
            ? oldData.map((n) =>
                n.id === updatedNotification.id ? { ...n, isRead: true } : n
              )
            : [];
        }
      );
    },
    onError: (error) => {
      console.error("Gagal menandai notifikasi:", error);
    },
  });

  return {
    notifications: data,
    isLoading,
    isError,
    markAsRead: mutation.mutate, // Ekpos fungsi mutate
  };
};
