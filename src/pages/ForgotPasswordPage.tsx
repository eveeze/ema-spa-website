// src/pages/ForgotPasswordPage.tsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  KeyRound,
  Lock,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Button from "../components/ui/Button";
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../api/customerApi";

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // State Step: 1=Email, 2=OTP, 3=NewPassword, 4=Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Data State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error Message
  const [error, setError] = useState<string | null>(null);

  const subtitle = useMemo(() => {
    if (step === 1) return "Masukkan email untuk menerima kode verifikasi.";
    if (step === 2) return "Masukkan kode OTP yang kami kirim ke email Anda.";
    if (step === 3) return "Buat kata sandi baru untuk akun Anda.";
    return "Password berhasil diperbarui. Silakan login kembali.";
  }, [step]);

  // STEP 1: Kirim Email minta OTP
  const handleRequestOtp = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!email) return setError("Email harus diisi");

    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword({ email });
      setStep(2);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Gagal mengirim OTP. Cek email Anda."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verifikasi OTP
  const handleVerifyOtp = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!otp) return setError("OTP harus diisi");

    setIsLoading(true);
    setError(null);
    try {
      await verifyResetOtp({ email, otp });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "OTP salah atau kadaluarsa.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Simpan Password Baru
  const handleResetPassword = async (
    e?: React.FormEvent | React.MouseEvent
  ) => {
    if (e) e.preventDefault();
    if (!newPassword || !confirmPassword)
      return setError("Semua kolom harus diisi");
    if (newPassword !== confirmPassword) return setError("Password tidak sama");
    if (newPassword.length < 6) return setError("Password minimal 6 karakter");

    setIsLoading(true);
    setError(null);
    try {
      await resetPassword({ email, newPassword });
      setStep(4);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mereset password.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 1) navigate("/login");
    else setStep((prev) => (prev - 1) as any);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-50 px-4">
      {/* Soft blobs / accents (match Login) */}
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-52 w-52 rounded-full bg-amber-100/70 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header (match Login vibe) */}
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
            Ema Mom Kids Baby Spa
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Lupa Password
          </h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.3, ease: "easeOut" }}
          className="relative rounded-3xl bg-white/95 p-6 shadow-xl shadow-sky-100/80 ring-1 ring-slate-100"
        >
          {/* Back button (match style) */}
          {step < 4 && (
            <button
              onClick={goBack}
              type="button"
              className="absolute left-4 top-4 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 p-2 text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900"
              aria-label="Kembali"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-2xl border border-red-100 bg-red-50/80 px-3 py-2 text-xs text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Alamat Email
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 shadow-inner focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Kami akan mengirim kode OTP untuk verifikasi reset password.
                </p>
              </div>

              <Button
                onClick={() => handleRequestOtp()}
                variant="gradient"
                className="w-full justify-center shadow-lg shadow-sky-200"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  "Kirim OTP"
                )}
              </Button>

              <p className="text-center text-xs text-slate-500">
                Ingat password?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-sky-600 hover:underline"
                >
                  Kembali ke Login
                </Link>
              </p>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Kode OTP
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 shadow-inner focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                  <KeyRound className="h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="XXXXXX"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-transparent text-center text-sm font-semibold tracking-[0.4em] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Cek inbox/spam email Anda.</span>
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={isLoading}
                    className="font-semibold text-sky-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Kirim ulang
                  </button>
                </div>
              </div>

              <Button
                onClick={() => handleVerifyOtp()}
                variant="gradient"
                className="w-full justify-center shadow-lg shadow-sky-200"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </span>
                ) : (
                  "Verifikasi OTP"
                )}
              </Button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Password Baru
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 shadow-inner focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Konfirmasi Password
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 shadow-inner focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Pastikan password baru mudah diingat dan aman.
                </p>
              </div>

              <Button
                onClick={() => handleResetPassword()}
                variant="gradient"
                className="w-full justify-center shadow-lg shadow-sky-200"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  "Simpan Password"
                )}
              </Button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
                <CheckCircle className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Berhasil diperbarui
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Password Anda telah diganti. Silakan login dengan password baru.
              </p>

              <div className="mt-5">
                <Button
                  onClick={() => navigate("/login")}
                  variant="sky"
                  className="w-full justify-center"
                >
                  Login Sekarang
                </Button>
              </div>

              <p className="mt-4 text-[11px] text-slate-400">
                Jika Anda tidak meminta reset password, abaikan email OTP tadi.
              </p>
            </div>
          )}
        </motion.div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Dengan melanjutkan, Anda menyetujui pengelolaan data untuk keperluan
          reservasi dan layanan Ema Mom Kids Baby Spa.
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
