// src/components/NotificationIcon.tsx
import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

const NotificationIcon = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleNotificationClick = (
    notificationId: string,
    referenceId?: string | null
  ) => {
    // Tandai sudah dibaca
    markAsRead(notificationId);
    setIsOpen(false);

    // Arahkan ke halaman detail jika ada referenceId
    if (referenceId) {
      navigate(`/dashboard/reservations/${referenceId}`);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-2xl border z-50 animate-fade-in-down">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-bold text-gray-800">Notifikasi</h3>
            {unreadCount > 0 && (
              <button className="text-xs text-blue-600 hover:underline">
                Tandai semua dibaca
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <p className="p-4 text-center text-gray-500">Memuat...</p>
            )}

            {!isLoading && (!notifications || notifications.length === 0) && (
              <p className="p-4 text-center text-gray-500">
                Tidak ada notifikasi baru.
              </p>
            )}

            {notifications?.map((notif) => (
              <div
                key={notif.id}
                onClick={() =>
                  handleNotificationClick(notif.id, notif.referenceId)
                }
                className={`flex items-start gap-4 p-4 border-b cursor-pointer transition-colors ${
                  notif.isRead ? "bg-white" : "bg-sky-50 hover:bg-sky-100"
                }`}
              >
                {!notif.isRead && (
                  <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
                <div className={`flex-grow ${notif.isRead ? "ml-6" : ""}`}>
                  <p className="font-semibold text-gray-800">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
