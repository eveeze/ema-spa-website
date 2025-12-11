// src/pages/VerifyOtpPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { verifyOtp, resendOtp } from '../api/customerApi';

const isAxiosLikeError = (
  e: unknown,
): e is { response?: { data?: { message?: string } } } =>
  typeof e === 'object' &&
  e !== null &&
  'response' in e &&
  typeof (e as Record<string, unknown>).response === 'object';

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await verifyOtp({ email, otp });
      setSuccess(response.message || 'Verifikasi berhasil!');

      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      const errorMessage = isAxiosLikeError(err)
        ? err.response?.data?.message || 'Kode OTP salah.'
        : 'Verifikasi gagal.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setResending(true);
    setError('');
    setSuccess('');

    try {
      const response = await resendOtp({ email });
      setSuccess(response.message || 'OTP baru telah dikirim ke email Anda.');
    } catch (err) {
      setError('Gagal mengirim ulang OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-50 px-4 overflow-x-hidden">
      {/* Glow Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-sky-100/70 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-56 w-56 rounded-full bg-pink-100/60 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="rounded-3xl bg-white/95 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-sky-100 overflow-hidden">
          {/* Header */}
          <div className="border-b border-sky-50 px-6 py-5 bg-gradient-to-r from-sky-50 to-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-500">
              Verifikasi Email
            </p>
            <h1 className="mt-2 text-xl font-semibold text-slate-900">
              Masukkan kode OTP{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sky-800">
                4 digit
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Kode dikirim ke <b className="text-slate-700">{email}</b>.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerifySubmit} className="px-6 py-6 space-y-4">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl py-2 text-center"
              >
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 rounded-xl py-2 text-center"
              >
                {success}
              </motion.p>
            )}

            {/* OTP Input (4 DIGIT) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 text-center">
                Kode OTP
              </label>

              <div className="flex justify-center">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  maxLength={4} // ⬅ hanya 4 digit
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                  }
                  placeholder="••••"
                  className="w-40 text-center text-3xl font-bold tracking-[0.3em] border rounded-2xl py-3 bg-slate-50/80 border-slate-200 focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                />
              </div>

              <p className="text-center text-xs text-slate-500">
                Masukkan kode yang terdiri dari 4 angka.
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || !!success}
              whileHover={!loading ? { y: -1 } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              transition={{ duration: 0.18 }}
              className="w-full py-3 rounded-full bg-sky-500 text-white font-semibold shadow-md hover:bg-sky-600 disabled:bg-gray-400"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi'}
            </motion.button>
          </form>

          {/* Resend OTP */}
          <div className="border-t border-slate-100 px-6 py-4 text-center">
            <p className="text-sm text-slate-600">
              Tidak menerima kode?{' '}
              <button
                onClick={handleResendOtp}
                disabled={resending}
                className="text-sky-600 font-semibold hover:underline disabled:text-gray-400"
              >
                {resending ? 'Mengirim ulang...' : 'Kirim Ulang OTP'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;
