// src/pages/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, LockKeyhole, Mail } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/customer/login', formData);
      const { token, customer } = response.data;
      login(token, customer);
      navigate('/dashboard');
    } catch (err: unknown) {
      let errorMessage = 'Login gagal.';

      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as Record<string, unknown>).response === 'object'
      ) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-50 px-4">
      {/* Soft blobs / accents */}
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-52 w-52 rounded-full bg-amber-100/70 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
            Ema Mom Kids Baby Spa
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Selamat Datang Kembali
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Masuk untuk mengelola jadwal spa si kecil dengan lebih mudah.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.3, ease: 'easeOut' }}
          className="rounded-3xl bg-white/95 p-6 shadow-xl shadow-sky-100/80 ring-1 ring-slate-100"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-2xl border border-red-100 bg-red-50/80 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                Alamat Email
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 shadow-inner focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contoh@email.com"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
              >
                Kata Sandi
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 shadow-inner focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Masukkan kata sandi"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Hint kecil (opsional lupa password nanti) */}
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Gunakan email yang terdaftar di Ema Spa.</span>
              {/* Bisa diaktifkan nanti kalau sudah ada fitur lupa password */}
              {/* <button className="font-semibold text-sky-600 hover:underline">
                Lupa kata sandi?
              </button> */}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition hover:from-sky-600 hover:to-sky-700 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link
              to="/register"
              className="font-semibold text-sky-600 hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </motion.div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Dengan masuk, Anda menyetujui pengelolaan data untuk keperluan
          reservasi dan layanan Ema Mom Kids Baby Spa.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
