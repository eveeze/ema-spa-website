// /src/layout/Navbar.tsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import NotificationIcon from "../components/ui/NotificationIcon";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `font-medium text-brand-dark hover:text-brand-blue transition-colors duration-300 ${
      isActive ? "text-brand-blue" : ""
    }`;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                className="h-16 w-auto rounded-full"
                src="/babyspa.jpg"
                alt="Ema Mom Kids Baby Spa"
              />
              <span className="ml-2 text-xl font-bold text-brand-dark">
                Ema Baby Spa
              </span>
            </Link>
          </div>

          {/* Navigasi Desktop */}
          <nav className="hidden md:flex md:space-x-8">
            <NavLink to="/" className={navLinkClasses}>
              Home
            </NavLink>
            <NavLink to="/services" className={navLinkClasses}>
              Layanan
            </NavLink>
            <NavLink to="/schedule" className={navLinkClasses}>
              Jadwal
            </NavLink>
          </nav>

          {/* Tombol Aksi Desktop */}
          <div className="hidden md:block">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <NotificationIcon />
                <span className="text-sm text-gray-600">
                  Halo, {user?.name || "User"}
                </span>
                <Button to="/dashboard">Dashboard</Button>
              </div>
            ) : (
              <Button to="/login">Login</Button>
            )}
          </div>

          {/* Tombol Menu Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Main menu"
              aria-expanded="false"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
            <NavLink
              to="/"
              className={navLinkClasses}
              onClick={() => setIsOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/services"
              className={navLinkClasses}
              onClick={() => setIsOpen(false)}
            >
              Layanan
            </NavLink>
            <NavLink
              to="/schedule"
              className={navLinkClasses}
              onClick={() => setIsOpen(false)}
            >
              Jadwal
            </NavLink>

            {/* Tombol untuk Mobile */}
            <div className="pt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <NotificationIcon />
                  <div className="text-sm text-gray-600 pb-2">
                    Halo, {user?.name || "User"}
                  </div>
                  <Button to="/dashboard" onClick={() => setIsOpen(false)}>
                    Dashboard
                  </Button>
                </>
              ) : (
                <Button to="/login" onClick={() => setIsOpen(false)}>
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
