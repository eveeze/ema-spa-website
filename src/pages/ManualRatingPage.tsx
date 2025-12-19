// src/pages/ManualRatingPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, CheckCircle, AlertCircle } from "lucide-react";
import { ratingApi, RatingSessionData } from "../api/ratingApi";
import Button from "../components/ui/Button";

const ManualRatingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<RatingSessionData | null>(
    null
  );
  const [submitted, setSubmitted] = useState(false);

  // Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  // 1. Fetch Session Info saat halaman dimuat
  useEffect(() => {
    if (!token) {
      setError("Token tidak ditemukan.");
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await ratingApi.getSessionByToken(token);
        if (res.success) {
          setSessionInfo(res.data);
        }
      } catch (err: any) {
        console.error(err);
        const msg =
          err.response?.data?.message ||
          "Link rating tidak valid atau sudah kadaluarsa.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [token]);

  // 2. Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    if (!token) return;

    setSubmitting(true);
    try {
      await ratingApi.submitManualRating({
        token,
        rating,
        comment,
      });
      setSubmitted(true);
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Gagal mengirim rating. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // --- RENDERING ---

  // State: Loading Awal
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // State: Error (Token Invalid)
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Link Tidak Valid
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          {/* Button Anda tidak punya fullWidth, jadi kita pakai className w-full */}
          <Button
            onClick={() => navigate("/")}
            variant="outline-sky"
            className="w-full justify-center"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  // State: Sukses Submit
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Terima Kasih!
          </h2>
          <p className="text-slate-600 mb-6">
            Penilaian Anda sangat berarti bagi kami untuk terus meningkatkan
            pelayanan Ema Mom Kids Baby Spa.
          </p>
          <Button
            onClick={() => navigate("/")}
            variant="sky"
            className="w-full justify-center"
          >
            Selesai
          </Button>
        </div>
      </div>
    );
  }

  // State: Form Rating (Default)
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-400 to-sky-600 p-8 text-center text-white">
          <h1 className="text-2xl font-bold tracking-tight">
            Beri Nilai Layanan
          </h1>
          <p className="text-sky-100 mt-1 text-sm font-medium opacity-90">
            Ema Mom Kids Baby Spa
          </p>
        </div>

        <div className="p-8">
          {/* Info Box */}
          <div className="bg-sky-50 rounded-xl p-5 mb-8 border border-sky-100">
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex justify-between border-b border-sky-200 pb-2 mb-2">
                <span className="text-slate-500">Layanan</span>
                <span className="font-semibold text-slate-800">
                  {sessionInfo?.serviceName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Terapis</span>
                <span className="font-semibold text-slate-800">
                  {sessionInfo?.staffName}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Star Rating Input */}
            <div className="mb-8 text-center">
              <label className="block text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">
                Bagaimana pengalaman Anda?
              </label>
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      size={42}
                      className={`transition-colors duration-200 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "fill-transparent text-slate-300"
                      }`}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
              <div className="h-6 text-sm font-medium text-amber-500 transition-opacity duration-300">
                {rating === 1 && "Sangat Buruk 😞"}
                {rating === 2 && "Kurang Memuaskan 😐"}
                {rating === 3 && "Cukup Bagus 🙂"}
                {rating === 4 && "Sangat Bagus 😄"}
                {rating === 5 && "Luar Biasa! 😍"}
              </div>
            </div>

            {/* Comment Input */}
            <div className="mb-8">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Komentar / Saran (Opsional)
              </label>
              <textarea
                id="comment"
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-700 resize-none"
                placeholder="Ceritakan apa yang Anda sukai atau apa yang bisa kami tingkatkan..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* MODIFIKASI: Menghapus props yang tidak didukung (fullWidth, type, disabled, isLoading) */}
            {/* Kita gunakan className untuk styling dan logika render untuk loading/disabled */}
            <div
              className={
                rating === 0 || submitting
                  ? "opacity-50 pointer-events-none"
                  : ""
              }
            >
              <Button
                // type="submit"  <- Hapus ini karena props tidak ada, tapi di dalam form button akan default submit
                variant="gradient"
                size="lg"
                className="w-full shadow-xl shadow-sky-200 flex justify-center" // Pengganti fullWidth
              >
                {/* Handle loading state via text karena button tidak punya prop isLoading */}
                {submitting
                  ? "Mengirim..."
                  : rating === 0
                  ? "Pilih Bintang Dulu"
                  : "Kirim Penilaian"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManualRatingPage;
