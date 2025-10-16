// src/components/OneSignalManager.tsx
import OneSignal from "react-onesignal";
import { useEffect, useRef } from "react";
import { sendPlayerIdToBackend } from "../services/oneSignalService";
import { useAuth } from "../hooks/useAuth";

const OneSignalManager = () => {
  const { isAuthenticated } = useAuth();
  const isInitialized = useRef(false);
  const listenerAttached = useRef(false);
  const subscriptionChangeHandler = useRef<((change: any) => void) | null>(
    null
  );

  useEffect(() => {
    if (!isAuthenticated || isInitialized.current) {
      return;
    }

    console.log("User terautentikasi, memproses OneSignal...");

    const setupOneSignal = async () => {
      try {
        // Inisialisasi OneSignal
        await OneSignal.init({
          appId: "adb63973-e191-4d84-8454-2f5e168ffad0",
          allowLocalhostAsSecureOrigin: true,
          // Tambahkan konfigurasi untuk service worker
          serviceWorkerParam: {
            scope: "/push/onesignal/",
          },
          serviceWorkerPath: "OneSignalSDKWorker.js",
        });

        isInitialized.current = true;
        console.log("OneSignal berhasil diinisialisasi");

        // Tunggu sampai OneSignal benar-benar siap
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Setup listener untuk perubahan subscription
        if (!listenerAttached.current && OneSignal.User?.PushSubscription) {
          const onSubscriptionChange = (change: any) => {
            console.log("Status langganan berubah:", change);

            if (change.current?.optedIn && change.current?.id) {
              const playerId = change.current.id;
              console.log("Player ID baru didapatkan:", playerId);
              sendPlayerIdToBackend(playerId);
            }
          };

          // Simpan referensi handler untuk cleanup
          subscriptionChangeHandler.current = onSubscriptionChange;

          OneSignal.User.PushSubscription.addEventListener(
            "change",
            onSubscriptionChange
          );
          listenerAttached.current = true;
          console.log("Listener berhasil ditambahkan");
        }

        // Cek apakah user sudah punya player ID
        const existingPlayerId = OneSignal.User?.onesignalId;
        if (existingPlayerId) {
          console.log("Player ID sudah ada:", existingPlayerId);
          sendPlayerIdToBackend(existingPlayerId);
        } else {
          // Minta permission jika belum ada
          console.log("Meminta permission notifikasi...");
          try {
            await OneSignal.Notifications.requestPermission();
          } catch (permissionError) {
            console.log("Permission ditolak atau error:", permissionError);
          }
        }
      } catch (error) {
        console.error("Error setup OneSignal:", error);
        isInitialized.current = false;
      }
    };

    setupOneSignal();

    // Cleanup function
    return () => {
      if (
        listenerAttached.current &&
        OneSignal.User?.PushSubscription &&
        subscriptionChangeHandler.current
      ) {
        try {
          OneSignal.User.PushSubscription.removeEventListener(
            "change",
            subscriptionChangeHandler.current
          );
          listenerAttached.current = false;
          subscriptionChangeHandler.current = null;
          console.log("OneSignal listener dihapus");
        } catch (error) {
          console.log("Error menghapus listener:", error);
        }
      }
    };
  }, [isAuthenticated]);

  return null;
};

export default OneSignalManager;
