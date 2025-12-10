// /src/layout/Navbar.tsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import NotificationIcon from "../components/ui/NotificationIcon";

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  [
    "relative px-2 py-1 text-sm md:text-[15px] font-medium tracking-tight",
    "text-slate-600 transition-colors duration-200",
    // underline micro interaction
    "after:pointer-events-none after:absolute after:left-1 after:right-1 after:-bottom-1",
    "after:h-[2px] after:rounded-full after:bg-sky-400",
    "after:scale-x-0 after:origin-center after:transition-transform after:duration-300",
    isActive
      ? "text-slate-900 after:scale-x-100"
      : "hover:text-slate-900 hover:after:scale-x-100",
  ].join(" ");

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-sky-100/80 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ y: -1, scale: 1.01 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-shrink-0 items-center gap-3"
          >
            <Link to="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded-full border border-sky-100 shadow-sm shadow-sky-100/80 bg-slate-50">
                <img
                  className="h-full w-full object-cover"
                  src="/babyspa.jpg"
                  alt="Ema Mom Kids Baby Spa"
                />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm md:text-base font-semibold text-slate-900">
                  Ema Mom Kids Baby Spa
                </span>
                <span className="text-[11px] md:text-xs text-slate-500">
                  Relax, Healthy and Happy
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Navigasi Desktop */}
          <nav className="hidden md:flex md:items-center md:gap-6">
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
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex items-center gap-3 rounded-full border border-sky-100 bg-sky-50/60 px-3 py-1.5 shadow-sm shadow-sky-100/70"
              >
                <NotificationIcon />
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 leading-none">
                    Halo,
                  </span>
                  <span className="text-sm font-medium text-slate-800 leading-tight">
                    {user?.name || "User"}
                  </span>
                </div>
                <Button size="sm" variant="sky" to="/dashboard">
                  Dashboard
                </Button>
              </motion.div>
            ) : (
              <Button size="sm" variant="sky" to="/login">
                Login
              </Button>
            )}
          </div>

          {/* Tombol Menu Mobile */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-white/90 shadow-sm text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
              aria-label="Main menu"
              aria-expanded={isOpen}
              whileTap={{ scale: 0.94 }}
            >
              <svg
                className="h-5 w-5"
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
            </motion.button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="md:hidden border-t border-sky-100/80 bg-white/95 backdrop-blur-md"
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 py-3 text-center">
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
                <div className="mt-2 flex flex-col items-center gap-2 pb-3">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/70 px-3 py-1.5 shadow-sm">
                        <NotificationIcon />
                        <span className="text-sm text-slate-700">
                          Halo, {user?.name || "User"}
                        </span>
                      </div>
                      <Button
                        size="md"
                        fullWidth
                        variant="sky"
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="md"
                      fullWidth
                      variant="sky"
                      to="/login"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
