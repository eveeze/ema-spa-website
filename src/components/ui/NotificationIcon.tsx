// src/components/NotificationIcon.tsx
import { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";

const dropdownVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 4,
    scale: 0.97,
    transition: {
      duration: 0.15,
      ease: "easeInOut",
    },
  },
};

const NotificationIcon = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleNotificationClick = (
    notificationId: string,
    referenceId?: string | null
  ) => {
    markAsRead(notificationId);
    setIsOpen(false);

    if (referenceId) {
      navigate(`/dashboard/reservations/${referenceId}`);
    }
  };

  const hasNotifications = !isLoading && !!notifications && notifications.length > 0;

  return (
    <div className="relative">
      {/* Trigger button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm shadow-slate-200/60 ring-1 ring-slate-200/70 backdrop-blur hover:shadow-md hover:bg-slate-50 transition-all"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5, opacity: 0, y: -4 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="notif-dropdown"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-3 w-80 md:w-96 origin-top-right rounded-2xl border border-slate-100 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-50">
                  <Bell className="h-3.5 w-3.5 text-sky-600" />
                </span>
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifikasi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} notifikasi belum dibaca`
                      : "Semua notifikasi sudah dibaca"}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline"
                  // TODO: kalau nanti punya markAllAsRead, tinggal panggil di sini
                  onClick={(e) => {
                    e.stopPropagation();
                    // placeholder – sengaja tidak mengubah behavior sekarang
                  }}
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-xs text-slate-500">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-100 border-t-sky-500" />
                  Memuat notifikasi...
                </div>
              )}

              {!isLoading && !hasNotifications && (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Belum ada notifikasi
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Kamu akan melihat update tentang reservasi dan informasi
                    penting lainnya di sini.
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {notifications?.map((notif) => (
                  <motion.button
                    key={notif.id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(notif.id, notif.referenceId)
                    }
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`group flex w-full items-start gap-3 px-4 py-3.5 border-b border-slate-100 text-left transition-colors ${
                      notif.isRead
                        ? "bg-white hover:bg-slate-50/70"
                        : "bg-sky-50/80 hover:bg-sky-100/80"
                    }`}
                  >
                    {/* Dot status */}
                    <div className="mt-1.5 flex-shrink-0">
                      {!notif.isRead ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
                      ) : (
                        <span className="inline-flex h-2 w-2 rounded-full bg-slate-200" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">
                        {notif.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600">
                        {notif.message}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>

                    {/* Chevron / indicator kecil */}
                    {notif.referenceId && (
                      <span className="mt-1 text-[10px] font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Lihat
                      </span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationIcon;
