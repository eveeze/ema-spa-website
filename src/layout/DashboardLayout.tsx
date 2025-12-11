// src/layouts/DashboardLayout.tsx
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  {
    name: 'Reservasi Saya',
    href: '/dashboard/reservations',
    icon: CalendarCheck,
  },
  { name: 'Profil Saya', href: '/dashboard/profile', icon: User },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const displayName = user?.name?.split(' ')[0] ?? user?.name ?? 'Pelanggan';

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50">
      <div className="mx-auto flex max-w-7xl gap-0 px-4 pb-8 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        {/* SIDEBAR (desktop & tablet) */}
        <motion.aside
          className="relative hidden w-64 flex-shrink-0 flex-col rounded-3xl bg-white/90 p-5 shadow-md ring-1 ring-sky-100/80 lg:flex"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Brand + user */}
          <div className="mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
                <span className="text-sm font-semibold">E</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Ema Mom Kids Baby Spa
                </h2>
                <p className="text-[11px] text-slate-500">
                  Relax, Healthy and Happy
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-sky-50/80 px-3 py-2 text-xs text-slate-700">
              <p className="font-semibold text-sky-700">Halo, {displayName}</p>
              <p className="text-[11px] text-slate-500">
                Kelola jadwal & data reservasi Anda di sini.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.href === '/dashboard'}
                  className={({ isActive }) =>
                    [
                      'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-medium transition-all',
                      'hover:bg-sky-50 hover:text-sky-800',
                      isActive
                        ? 'bg-sky-500/10 text-sky-800 ring-1 ring-sky-200'
                        : 'text-slate-600',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={[
                          'flex h-8 w-8 items-center justify-center rounded-xl border text-sky-500 transition-all',
                          isActive
                            ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                            : 'border-slate-200 bg-slate-50 group-hover:border-sky-300',
                        ].join(' ')}
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

          {/* Logout */}
          <button
            onClick={logout}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </motion.aside>

        {/* MAIN AREA */}
        <div className="flex-1 lg:pl-6">
          {/* Top bar for mobile / small screen */}
          <motion.header
            className="mb-4 flex items-center justify-between rounded-2xl bg-white/90 px-4 py-3 shadow-sm ring-1 ring-sky-100/80 lg:hidden"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-600">
                Dashboard
              </p>
              <p className="text-sm font-medium text-slate-900">
                Hai, {displayName}
              </p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-inner transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </button>
          </motion.header>

          <main className="rounded-3xl bg-transparent pb-4 lg:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
