// src/pages/Register.tsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Impor fungsi registerCustomer yang sudah dibuat
import { registerCustomer } from "../api/customerApi";
import { RegisterPayload } from "../types";

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterPayload>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Gunakan fungsi registerCustomer yang sudah diimpor
      await registerCustomer(formData);

      // Arahkan ke halaman verifikasi OTP setelah sukses
      // Sertakan email sebagai query parameter untuk digunakan di halaman berikutnya
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Registrasi gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-sky-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-sky-600 mb-2">
          Buat Akun Baru
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Mulai perjalanan relaksasi untuk si kecil.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

          <input
            name="name"
            type="text"
            placeholder="Nama Lengkap"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Alamat Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <input
            name="phoneNumber"
            type="tel"
            placeholder="Nomor Telepon (e.g., 0812...)"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 text-white py-3 rounded-md font-semibold hover:bg-sky-600 transition disabled:bg-gray-400"
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-semibold text-sky-600 hover:underline"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
