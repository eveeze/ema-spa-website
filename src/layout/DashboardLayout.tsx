import React, { useMemo } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom"; // Tambah useLocation
import { LayoutDashboard, CalendarCheck, User, LogOut } from "lucide-react";
import {
  LazyMotion,
  domAnimation,
  m,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion"; // Tambah AnimatePresence
import { useAuth } from "../hooks/useAuth";

type NavItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Reservasi Saya",
    href: "/dashboard/reservations",
    icon: CalendarCheck,
  },
  { name: "Profil Saya", href: "/dashboard/profile", icon: User },
];

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation(); // ✅ Ambil lokasi untuk key animasi konten
  const reduceMotion = useReducedMotion();

  const displayName = useMemo(() => {
    const raw = user?.name?.trim();
    if (!raw) return "Pelanggan";
    const first = raw.split(/\s+/)[0];
    return first || raw;
  }, [user?.name]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50">
        <div className="mx-auto flex max-w-7xl gap-0 px-4 pt-4 sm:px-6 lg:px-8 lg:pt-8">
          {/* ===== SIDEBAR (Tidak akan ikut animasi reload) ===== */}
          <m.aside
            className="relative hidden w-64 flex-shrink-0 flex-col rounded-3xl bg-white/90 p-5 shadow-md ring-1 ring-sky-100/80 lg:flex"
            initial={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
                  <span className="text-sm font-semibold">E</span>
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Ema Baby Spa
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Relax, Healthy & Happy
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-sky-50/80 px-3 py-2 text-xs text-slate-700">
                <p className="font-semibold text-sky-700">
                  Halo, {displayName}
                </p>
                <p className="text-[11px] text-slate-500">
                  Kelola reservasi Anda.
                </p>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    end={item.href === "/dashboard"}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-medium transition-all",
                        "hover:bg-sky-50 hover:text-sky-800",
                        isActive
                          ? "bg-sky-500/10 text-sky-800 ring-1 ring-sky-200"
                          : "text-slate-600",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-xl border text-sky-500 transition-all",
                            isActive
                              ? "border-sky-500 bg-sky-500 text-white shadow-sm"
                              : "border-slate-200 bg-slate-50 group-hover:border-sky-300",
                          ].join(" ")}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="truncate">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </m.aside>

          {/* ===== MAIN CONTENT ===== */}
          <div className="flex-1 lg:pl-6">
            {/* Mobile Header */}
            <m.header
              className="mb-4 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-sky-100/80 lg:hidden"
              initial={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
                  Dashboard
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {displayName}
                </p>
              </div>

              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-inner transition hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar
              </button>
            </m.header>

            {/* ✅ ANIMASI PINDAH KE SINI: Hanya konten yang berubah */}
            <main className="rounded-3xl bg-transparent pb-24 lg:pb-0">
              <AnimatePresence mode="wait">
                <m.div
                  key={location.pathname} // Kunci animasi berdasarkan URL
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }} // Durasi lebih cepat agar responsif
                >
                  <Outlet />
                </m.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        {/* ===== Mobile Bottom Nav ===== */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sky-100/80 bg-white/85 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-around px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === "/dashboard"}
                  className={({ isActive }) =>
                    [
                      "relative flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 transition-all",
                      isActive
                        ? "text-sky-800"
                        : "text-slate-500 hover:text-slate-800",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <m.div
                          layoutId="bottomnav-active"
                          className="absolute inset-0 rounded-2xl bg-sky-500/10 ring-1 ring-sky-200"
                          transition={
                            reduceMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 720, damping: 52 }
                          }
                        />
                      )}
                      <div
                        className={[
                          "relative z-10 flex h-9 w-9 items-center justify-center rounded-2xl border transition-all",
                          isActive
                            ? "border-sky-200 bg-sky-50"
                            : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </div>
                      <span className="relative z-10 text-[11px] font-semibold leading-none">
                        {item.name.split(" ")[0]}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
};

export default DashboardLayout;
