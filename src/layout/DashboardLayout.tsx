// src/layouts/DashboardLayout.tsx
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, CalendarCheck, User, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    {
      name: "Reservasi Saya",
      href: "/dashboard/reservations",
      icon: CalendarCheck,
    },
    { name: "Profil Saya", href: "/dashboard/profile", icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-brand-primary">Ema Baby Spa</h2>
          <p className="text-sm text-gray-500 mt-2">Welcome, {user?.name}!</p>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end // 'end' prop penting untuk matching rute index
              className={({ isActive }) =>
                `flex items-center gap-x-3 px-6 py-3 text-gray-700 hover:bg-brand-secondary hover:text-brand-primary transition-colors ${
                  isActive
                    ? "bg-brand-secondary text-brand-primary font-semibold"
                    : ""
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="w-full flex items-center gap-x-3 px-6 py-3 text-gray-700 hover:bg-red-100 hover:text-red-600 transition-colors mt-8"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </nav>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
