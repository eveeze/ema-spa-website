// src/pages/VerifyOtpPage.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyOtp, resendOtp } from "../api/customerApi";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");

  // Jika tidak ada email di URL, kembalikan ke halaman register
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await verifyOtp({ email, otp });
      setSuccess(
        response.message ||
          "Verifikasi berhasil! Anda akan diarahkan ke halaman login."
      );
      // Arahkan ke halaman login setelah 3 detik
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Verifikasi gagal. Cek kembali kode OTP Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;

    setResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await resendOtp({ email });
      setSuccess(
        response.message || "OTP baru telah berhasil dikirim ke email Anda."
      );
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengirim ulang OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-sky-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-sky-600 mb-2">
          Verifikasi Email Anda
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Masukkan 6 digit kode OTP yang telah kami kirimkan ke{" "}
          <strong className="text-gray-700">{email}</strong>
        </p>

        <form onSubmit={handleVerifySubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-sm bg-green-50 p-3 rounded-md text-center">
              {success}
            </p>
          )}

          <input
            name="otp"
            type="text"
            placeholder="Masukkan Kode OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            className="w-full text-center tracking-[0.5em] text-lg font-semibold px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            type="submit"
            disabled={loading || !!success} // Disable jika sedang loading atau sudah sukses
            className="w-full bg-sky-500 text-white py-3 rounded-md font-semibold hover:bg-sky-600 transition disabled:bg-gray-400"
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600 mt-6">
          <p>Tidak menerima kode?</p>
          <button
            onClick={handleResendOtp}
            disabled={resending || loading}
            className="font-semibold text-sky-600 hover:underline disabled:text-gray-400 disabled:no-underline"
          >
            {resending ? "Mengirim ulang..." : "Kirim Ulang OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
