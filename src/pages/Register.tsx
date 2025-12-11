// src/pages/Register.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registerCustomer } from '../api/customerApi';
import type { RegisterPayload } from '../types';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterPayload>({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerCustomer(formData);
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: unknown) {
      let errorMessage = 'Registrasi gagal. Silakan coba lagi.';

      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as Record<string, unknown>).response === 'object'
      ) {
        const response = (
          err as {
            response?: { data?: { message?: string } };
          }
        ).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-50 px-4 sm:px-6 overflow-x-hidden">
      {/* Background glow dibatasi supaya tidak bikin scroll horizontal */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 top-10 h-52 w-52 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-64 w-64 rounded-full bg-pink-100/70 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Card utama */}
        <div className="overflow-hidden rounded-3xl bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-sky-100">
          {/* Header kecil */}
          <div className="border-b border-sky-50 bg-gradient-to-r from-sky-50 via-white to-sky-50 px-6 py-5 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-500">
              Registrasi Pelanggan
            </p>
            <h1 className="mt-2 text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
              Buat akun untuk atur{' '}
              <span className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 bg-clip-text text-transparent">
                jadwal spa si kecil
              </span>
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Satu akun untuk mengelola reservasi, riwayat kunjungan, dan
              pengalaman spa bayi & bunda yang lebih terarah.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 px-6 py-6 sm:px-8 sm:py-8"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-100 bg-red-50/80 px-3 py-2.5 text-xs text-red-700 sm:text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 sm:text-sm">
                Nama Lengkap
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-3 shadow-inner shadow-slate-100 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                <span className="mr-2 text-slate-400">👤</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-11 w-full border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 sm:text-sm">
                Alamat Email
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-3 shadow-inner shadow-slate-100 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                <span className="mr-2 text-slate-400">📧</span>
                <input
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 w-full border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 sm:text-sm">
                Nomor Telepon
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-3 shadow-inner shadow-slate-100 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                <span className="mr-2 text-slate-400">📱</span>
                <input
                  name="phoneNumber"
                  type="tel"
                  placeholder="0812xxxxxxx"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="h-11 w-full border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 sm:text-sm">
                Kata Sandi
              </label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/70 px-3 shadow-inner shadow-slate-100 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
                <span className="mr-2 text-slate-400">🔒</span>
                <input
                  name="password"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 w-full border-0 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={
                !loading
                  ? { y: -1, boxShadow: '0 18px 40px rgba(56,189,248,0.45)' }
                  : {}
              }
              whileTap={!loading ? { scale: 0.97 } : {}}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-sm font-semibold text-white shadow-md shadow-sky-300/60 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400"
            >
              {loading ? 'Mendaftarkan...' : 'Buat Akun'}
            </motion.button>

            <p className="pt-2 text-center text-xs text-slate-500 sm:text-[13px]">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="font-semibold text-sky-600 hover:text-sky-700 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </form>

          <div className="border-t border-slate-100 bg-white/80 px-6 py-3 text-center">
            <p className="text-[11px] text-slate-400">
              Dengan mendaftar, Anda menyetujui pengelolaan data untuk keperluan
              reservasi & pengalaman layanan yang lebih baik.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
