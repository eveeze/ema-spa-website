// src/pages/ServiceDetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../api/apiClient";
import type { Service } from "../types";
import {
  Clock,
  Baby,
  ChevronRight,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

// ========== AGE HELPERS ==========

const formatAgeSingle = (months: number): string => {
  if (months < 12) return `${months} bln`;
  const years = Math.floor(months / 12);
  const restMonths = months % 12;

  if (restMonths === 0) return `${years} th`;
  return `${years} th ${restMonths} bln`;
};

const formatAgeRange = (min: number, max: number): string => {
  if (max < 24) {
    return `${min}-${max} bulan`;
  }

  const minLabel = min === 0 ? "0 bln" : formatAgeSingle(min);
  const maxLabel = formatAgeSingle(max);
  return `${minLabel} – ${maxLabel}`;
};

// ========== SMALL SUB COMPONENTS ==========

const InfoPill = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="inline-flex items-center gap-3 rounded-full border border-sky-100 bg-white/90 px-4 py-2 text-xs sm:text-sm shadow-sm shadow-sky-50">
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-50">
      <Icon className="h-3.5 w-3.5 text-sky-500" />
    </span>
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <span className="text-xs sm:text-sm font-medium text-slate-800">
        {value}
      </span>
    </div>
  </div>
);

const BackgroundDecor = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-[-10%] h-64 w-64 rounded-full bg-sky-100/80 blur-3xl" />
    <div className="absolute top-20 right-[-10%] h-72 w-72 rounded-full bg-sky-100/70 blur-3xl" />
    <div className="absolute bottom-[-20%] left-[5%] h-72 w-72 rounded-full bg-amber-50/70 blur-3xl" />
    <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-white to-sky-50" />
    <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-[0.06] mix-blend-soft-light" />
  </div>
);

// ========== PAGE COMPONENT ==========

const ServiceDetailPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    let mounted = true;

    const fetchServiceDetail = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/service/${serviceId}`);
        if (!mounted) return;
        setService(response.data.data);
      } catch (err) {
        if (!mounted) return;
        setError("Layanan tidak ditemukan atau terjadi kesalahan.");
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchServiceDetail();
    return () => {
      mounted = false;
    };
  }, [serviceId]);

  // LOADING
  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <BackgroundDecor />
        <div className="relative z-10 text-center">
          <div className="relative mx-auto mb-4 h-14 w-14">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
            <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-sky-500" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            Memuat detail layanan...
          </p>
        </div>
      </div>
    );
  }

  // ERROR
  if (error || !service) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <BackgroundDecor />
        <div className="relative z-10 max-w-md rounded-2xl border border-sky-100/80 bg-white/90 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
            <Sparkles className="h-6 w-6 text-sky-500" />
          </div>
          <p className="text-base font-semibold text-slate-800">
            {error || "Layanan tidak ditemukan."}
          </p>
          <button
            onClick={() => navigate("/services")}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke daftar layanan
          </button>
        </div>
      </div>
    );
  }

  // ====== DERIVED DATA + SAFE NUMBERS ======

  const hasPriceTiers =
    Boolean(service.hasPriceTiers) &&
    Array.isArray(service.priceTiers) &&
    service.priceTiers.length > 0;

  const minTierPrice = hasPriceTiers
    ? Math.min(...service.priceTiers.map((t) => t.price))
    : null;

  const effectivePrice = hasPriceTiers
    ? minTierPrice ?? undefined
    : service.price ?? undefined;

  // SAFE usia min & max (tidak mungkin null lagi)
  const safeMinAge = hasPriceTiers
    ? Math.min(
        ...service.priceTiers.map((t) => (t.minBabyAge ?? 0))
      )
    : (service.minBabyAge ?? 0);

  const safeMaxAge = hasPriceTiers
    ? Math.max(
        ...service.priceTiers.map((t) =>
          t.maxBabyAge ?? (t.minBabyAge ?? 0)
        )
      )
    : (service.maxBabyAge ?? safeMinAge);

  const isBookingDisabled = hasPriceTiers && !selectedTierId;

  const handleBooking = () => {
    if (isBookingDisabled) {
      alert("Silakan pilih detail harga per usia terlebih dahulu.");
      return;
    }

    const bookingUrl =
      hasPriceTiers && selectedTierId
        ? `/booking/${serviceId}?priceTierId=${selectedTierId}`
        : `/booking/${serviceId}`;

    navigate(bookingUrl);
  };

  // ========== MAIN LAYOUT ==========

  return (
    <div className="relative min-h-screen">
      <BackgroundDecor />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16 space-y-10">
        {/* BREADCRUMB + CATEGORY */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <Link to="/" className="transition-colors hover:text-slate-700">
              Home
            </Link>
            <span>·</span>
            <Link
              to="/services"
              className="transition-colors hover:text-slate-700"
            >
              Layanan
            </Link>
            <span>·</span>
            <span className="text-slate-600">Detail</span>
          </div>

          {service.category?.name && (
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {service.category.name}
            </span>
          )}
        </div>

        {/* TITLE + INTRO */}
        <header className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-3 py-1 text-[11px] font-semibold text-sky-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Ema Mom Kids · Spa Bayi & Ibu
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.05]">
              {service.name}
            </h1>
            <div className="mt-3 h-px w-16 rounded-full bg-gradient-to-r from-sky-400 to-sky-200" />
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Sesi perawatan lembut untuk mendukung tumbuh kembang, relaksasi,
              dan bonding hangat antara Bunda dan si kecil di ruang yang bersih
              dan nyaman.
            </p>
          </div>
        </header>

        {/* IMAGE HERO */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-3xl border border-sky-100/70" />
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-slate-900/80 shadow-[0_24px_70px_rgba(15,23,42,0.35)]">
            <img
              src={
                service.imageUrl ||
                "https://images.unsplash.com/photo-1544991887-a"
              }
              alt={service.name}
              loading="lazy"
              className="
                w-full
                h-auto
                max-h-[460px]
                object-cover
                object-center
                md:max-h-[520px]
              "
            />
            <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center rounded-full bg-sky-50/95 px-3 py-1 text-[11px] font-semibold text-sky-800 shadow-sm">
              Ruang perawatan Ema Mom Kids
            </div>
          </div>
        </div>

        {/* INFO PILLS */}
        <div className="flex flex-wrap gap-3">
          <InfoPill
            icon={Clock}
            label="Durasi"
            value={`±${service.duration} menit`}
          />
          <InfoPill
            icon={Baby}
            label="Rekomendasi usia"
            value={formatAgeRange(safeMinAge, safeMaxAge)}
          />
        </div>

        {/* DESCRIPTION CARD */}
        <section className="rounded-2xl border border-sky-100/80 bg-white/90 p-6 shadow-md backdrop-blur-sm md:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-sky-500 to-sky-300" />
            <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
              Deskripsi layanan
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 md:text-base">
            {service.description}
          </p>
        </section>

        {/* BOOKING / PRICE CARD */}
        <section className="space-y-6 rounded-3xl border border-sky-100/80 bg-white/95 p-6 shadow-2xl backdrop-blur-md md:p-7">
          {/* PRICE SUMMARY */}
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-sky-50 p-5 text-center shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              {hasPriceTiers ? "Mulai dari" : "Harga"}
            </p>
            <p className="bg-gradient-to-r from-sky-600 to-sky-700 bg-clip-text text-3xl font-extrabold text-transparent md:text-[2.1rem]">
              {effectivePrice
                ? `Rp ${effectivePrice.toLocaleString("id-ID")}`
                : "-"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {hasPriceTiers
                ? "Harga menyesuaikan usia bayi"
                : "Harga untuk 1 sesi perawatan"}
            </p>
          </div>

          {/* DETAIL HARGA PER USIA */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Detail harga per usia
              </h3>
              <span className="text-[11px] text-slate-500">
                {hasPriceTiers
                  ? "Pilih paket sesuai usia bayi"
                  : "Harga tunggal untuk rentang usia"}
              </span>
            </div>

            {hasPriceTiers ? (
              <div className="space-y-3">
                {service.priceTiers.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  const tierMin = tier.minBabyAge ?? 0;
                  const tierMax = tier.maxBabyAge ?? tierMin;

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierId(tier.id)}
                      className={[
                        "flex w-full items-center justify-between rounded-xl border-2 p-4 text-sm transition-all duration-200",
                        "hover:-translate-y-[1px] hover:shadow-md",
                        isSelected
                          ? "border-sky-500 bg-sky-50 shadow-lg ring-2 ring-sky-200"
                          : "border-slate-200 bg-white hover:border-sky-300",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            isSelected ? "bg-sky-500" : "bg-slate-300"
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-slate-800">
                            {tier.tierName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatAgeRange(tierMin, tierMax)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-900">
                        Rp {tier.price.toLocaleString("id-ID")}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-slate-200 bg-white p-4 text-sm shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-sky-400" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        Satu harga untuk semua
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatAgeRange(safeMinAge, safeMaxAge)} · 1 sesi
                        perawatan
                      </p>
                    </div>
                  </div>
                  {service.price && (
                    <span className="font-semibold text-slate-900">
                      Rp {service.price.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CTA BUTTON */}
          <button
            type="button"
            onClick={handleBooking}
            disabled={isBookingDisabled}
            className={[
              "group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl px-6 py-3.5 text-sm sm:text-base font-semibold text-white",
              "bg-gradient-to-r from-sky-500 to-sky-600 shadow-xl transition-all duration-300",
              "hover:from-sky-600 hover:to-sky-700 hover:shadow-2xl hover:shadow-sky-300/70",
              isBookingDisabled
                ? "cursor-not-allowed from-slate-400 to-slate-500 hover:from-slate-400 hover:to-slate-500 hover:shadow-xl hover:scale-100"
                : "hover:scale-[1.02]",
            ].join(" ")}
          >
            <span className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
            <span className="relative flex items-center gap-2">
              {isBookingDisabled
                ? "Pilih harga terlebih dahulu"
                : "Reservasi sekarang"}
              <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </button>

          {/* TRUST BADGE */}
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-[11px] font-medium text-emerald-700">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>
              Terapis tersertifikasi &amp; jadwal dikonfirmasi otomatis
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
