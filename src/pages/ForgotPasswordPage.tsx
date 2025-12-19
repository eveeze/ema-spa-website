// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound, Lock, CheckCircle, ArrowLeft } from "lucide-react";
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

  // --- HANDLERS ---

  // STEP 1: Kirim Email minta OTP
  // PERBAIKAN: Parameter 'e' dibuat opsional (?) agar kompatibel dengan onClick Button
  const handleRequestOtp = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!email) return setError("Email harus diisi");

    setIsLoading(true);
    setError(null);
    try {
      await forgotPassword({ email });
      setStep(2); // Pindah ke step OTP
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
      setStep(3); // Pindah ke step Password Baru
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
      setStep(4); // Pindah ke step Sukses
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mereset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER UI PER STEP ---

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-400 to-sky-600 p-8 text-center text-white relative">
          {step < 4 && (
            <button
              onClick={() =>
                step === 1
                  ? navigate("/login")
                  : setStep((prev) => (prev - 1) as any)
              }
              className="absolute top-6 left-6 p-1 bg-white/20 rounded-full hover:bg-white/30 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight">Lupa Password</h1>
          <p className="text-sky-100 mt-1 text-sm font-medium opacity-90">
            {step === 1 && "Masukkan email untuk reset"}
            {step === 2 && "Masukkan kode OTP dari email"}
            {step === 3 && "Buat password baru"}
            {step === 4 && "Selesai!"}
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* FORM STEP 1: EMAIL */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => handleRequestOtp()}
                variant="gradient"
                className="w-full justify-center shadow-lg shadow-sky-200"
              >
                {isLoading ? "Mengirim..." : "Kirim OTP"}
              </Button>
            </form>
          )}

          {/* FORM STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kode OTP
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none tracking-widest text-lg font-bold text-center"
                    placeholder="XXXXXX"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Cek folder inbox atau spam di email Anda.
                </p>
              </div>
              <Button
                onClick={() => handleVerifyOtp()}
                variant="gradient"
                className="w-full justify-center shadow-lg shadow-sky-200"
              >
                {isLoading ? "Memverifikasi..." : "Verifikasi OTP"}
              </Button>
            </form>
          )}

          {/* FORM STEP 3: PASSWORD BARU */}
          {step === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={() => handleResetPassword()}
                variant="gradient"
                className="w-full justify-center shadow-lg shadow-sky-200"
              >
                {isLoading ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </form>
          )}

          {/* STEP 4: SUKSES */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Berhasil!
              </h2>
              <p className="text-slate-600 mb-8">
                Password Anda telah diperbarui. Silakan login dengan password
                baru.
              </p>
              <Button
                onClick={() => navigate("/login")}
                variant="sky"
                className="w-full justify-center"
              >
                Login Sekarang
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
