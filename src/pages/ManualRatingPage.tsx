// src/pages/ManualRatingPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
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
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    // Tambahkan pengecekan if (e) sebelum preventDefault
    if (e) e.preventDefault();

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

  // Shared: Auth-like shell (match Login/Forgot theme)
  const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-50 px-4 py-10">
      {/* Soft blobs / accents */}
      <div className="pointer-events-none absolute -left-10 top-10 h-40 w-40 rounded-full bg-sky-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-52 w-52 rounded-full bg-amber-100/70 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">
            Ema Mom Kids Baby Spa
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Penilaian Layanan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Ceritakan pengalaman Anda agar layanan kami semakin baik.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.08, duration: 0.3, ease: "easeOut" }}
          className="rounded-3xl bg-white/95 p-6 shadow-xl shadow-sky-100/80 ring-1 ring-slate-100"
        >
          {children}
        </motion.div>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Terima kasih sudah membantu Ema Mom Kids Baby Spa menjadi lebih baik.
        </p>
      </motion.div>
    </div>
  );

  // State: Loading Awal
  if (loading) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-10">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600 shadow-inner">
            <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
            Memuat sesi rating...
          </div>
        </div>
      </Shell>
    );
  }

  // State: Error (Token Invalid)
  if (error) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Link Tidak Valid
          </h2>
          <p className="mt-1 text-sm text-slate-500">{error}</p>

          <div className="mt-5">
            <Button
              onClick={() => navigate("/")}
              variant="outline-sky"
              className="w-full justify-center"
            >
              Kembali ke Beranda
            </Button>
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            Jika Anda merasa ini kesalahan, minta link rating terbaru dari
            admin.
          </p>
        </div>
      </Shell>
    );
  }

  // State: Sukses Submit
  if (submitted) {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ring-1 ring-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Terima kasih!
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Penilaian Anda sangat berarti bagi kami untuk terus meningkatkan
            pelayanan.
          </p>

          <div className="mt-5">
            <Button
              onClick={() => navigate("/")}
              variant="sky"
              className="w-full justify-center"
            >
              Selesai
            </Button>
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            Ingin lihat layanan lain?{" "}
            <Link to="/" className="font-semibold text-sky-600 hover:underline">
              Kunjungi beranda
            </Link>
            .
          </p>
        </div>
      </Shell>
    );
  }

  // State: Form Rating (Default)
  return (
    <Shell>
      {/* Session Info */}
      <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 shadow-inner">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Layanan
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {sessionInfo?.serviceName}
            </span>
          </div>
          <div className="h-px bg-slate-200/70" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Terapis
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {sessionInfo?.staffName}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Star Rating */}
        <div className="text-center">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Bagaimana pengalaman Anda?
          </label>

          <div className="mt-3 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="rounded-xl p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200"
                aria-label={`Beri rating ${star}`}
              >
                <Star
                  size={40}
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

          <div className="mt-2 h-6 text-sm font-medium text-amber-500 transition-opacity duration-300">
            {rating === 1 && "Sangat Buruk 😞"}
            {rating === 2 && "Kurang Memuaskan 😐"}
            {rating === 3 && "Cukup Bagus 🙂"}
            {rating === 4 && "Sangat Bagus 😄"}
            {rating === 5 && "Luar Biasa! 😍"}
          </div>

          <div className="mt-1 text-[11px] text-slate-500">
            Klik bintang untuk memilih. (Wajib)
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Komentar / Saran (Opsional)
          </label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 shadow-inner focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
            <textarea
              rows={4}
              className="w-full resize-none bg-transparent px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              placeholder="Ceritakan apa yang Anda sukai atau apa yang bisa kami tingkatkan..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Singkat saja sudah membantu.</span>
            <span>{comment.length}/500</span>
          </div>
        </div>

        {/* CTA */}
        <div
          className={
            rating === 0 || submitting ? "opacity-50 pointer-events-none" : ""
          }
        >
          <Button
            onClick={handleSubmit}
            variant="gradient"
            size="lg"
            className="w-full shadow-lg shadow-sky-200 flex justify-center"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengirim...
              </span>
            ) : rating === 0 ? (
              "Pilih Bintang Dulu"
            ) : (
              "Kirim Penilaian"
            )}
          </Button>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          Dengan mengirim, Anda membantu kami meningkatkan kualitas layanan.
        </div>
      </form>
    </Shell>
  );
};

export default ManualRatingPage;
