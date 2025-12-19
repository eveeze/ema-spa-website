// src/components/NotificationIcon.tsx
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

const dropdownVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.985,
    transition: { duration: 0.16, ease: "easeInOut" },
  },
};

const NotificationIcon = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;
  const hasNotifications =
    !isLoading && !!notifications && notifications.length > 0;

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

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  // Lock scroll when open (mobile UX)
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Optional: keep focus sane on close
  useEffect(() => {
    if (!isOpen) return;
    return () => {
      triggerRef.current?.focus?.();
    };
  }, [isOpen]);

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9998] bg-slate-900/25 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel: mobile bottom-sheet, desktop dropdown */}
          <motion.div
            key="notif-panel"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={[
              "fixed z-[9999] overflow-hidden border border-slate-100 bg-white/92 backdrop-blur-xl",
              "shadow-[0_20px_60px_rgba(15,23,42,0.18)]",
              // Mobile: bottom sheet
              "left-3 right-3 bottom-3 rounded-3xl",
              // Desktop: dropdown (anchored to top-right area)
              // (Kita taruh fixed juga biar aman dari transform navbar)
              "md:w-96 md:right-6 md:left-auto md:top-20 md:bottom-auto md:rounded-2xl",
            ].join(" ")}
            role="dialog"
            aria-label="Daftar notifikasi"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-50">
                  <Bell className="h-4 w-4 text-sky-600" />
                </span>
                <div className="flex flex-col">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Notifikasi
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {unreadCount > 0
                      ? `${unreadCount} belum dibaca`
                      : "Semua sudah dibaca"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="hidden sm:inline-flex text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      // placeholder – tidak mengubah behavior sekarang
                    }}
                  >
                    Tandai semua
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                  aria-label="Tutup notifikasi"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[60vh] md:max-h-96 overflow-y-auto overscroll-contain">
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-xs text-slate-500">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-100 border-t-sky-500" />
                  Memuat notifikasi...
                </div>
              )}

              {!isLoading && !hasNotifications && (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
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
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={[
                      "group flex w-full items-start gap-3 px-4 py-3.5 border-b border-slate-100 text-left transition-colors",
                      "active:scale-[0.99] active:bg-slate-50/70",
                      notif.isRead
                        ? "bg-white hover:bg-slate-50/70"
                        : "bg-sky-50/80 hover:bg-sky-100/80",
                    ].join(" ")}
                  >
                    <div className="mt-1.5 flex-shrink-0">
                      {!notif.isRead ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-sky-500" />
                      ) : (
                        <span className="inline-flex h-2 w-2 rounded-full bg-slate-200" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {notif.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>

                    {notif.referenceId && (
                      <span className="mt-1 text-[10px] font-semibold text-sky-600 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        Lihat
                      </span>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>

            {/* Mobile handle */}
            <div className="md:hidden flex items-center justify-center px-4 py-3">
              <div className="h-1.5 w-12 rounded-full bg-slate-200" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-sky-100 bg-white/90 shadow-sm shadow-slate-200/60 ring-1 ring-slate-200/60 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Notifikasi"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Bell className="h-[18px] w-[18px] md:h-5 md:w-5 text-slate-700" />
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.6, opacity: 0, y: -3 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0 }}
            className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Portal overlay */}
      {typeof document !== "undefined"
        ? createPortal(overlay, document.body)
        : null}
    </div>
  );
};

export default NotificationIcon;
