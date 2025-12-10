// /src/components/ServiceCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Clock, Sparkles } from "lucide-react";
import type { Service } from "../types";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const s = service as Service & {
    duration?: number | null;
    hasPriceTiers?: boolean;
    priceTiers?: { id: string; price: number; minBabyAge: number; maxBabyAge: number }[];
  };

  const { id, name, description, imageUrl } = s;
  const hasPriceTiers = Boolean(s.hasPriceTiers && s.priceTiers && s.priceTiers.length > 0);

  // Hitung harga tampilan
  let displayPrice: string | null = null;
  let priceLabelPrefix = "";

  if (hasPriceTiers && s.priceTiers) {
    const minPrice = Math.min(...s.priceTiers.map((t) => t.price));
    displayPrice = minPrice.toLocaleString("id-ID");
    priceLabelPrefix = "Mulai dari";
  } else if (s.price) {
    displayPrice = s.price.toLocaleString("id-ID");
    priceLabelPrefix = "";
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sky-100/70 bg-white/90 shadow-sm shadow-sky-100/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      {/* Image */}
      <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-50 via-sky-100 to-sky-200">
            <Sparkles className="h-8 w-8 text-sky-400" />
          </div>
        )}

        {/* gradient overlay tipis */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />

        {/* badge kecil di pojok */}
        <div className="pointer-events-none absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-sky-700 shadow-sm">
          Spa bayi &amp; bunda
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold tracking-tight text-slate-900">
          {name}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
          {description ||
            "Perawatan lembut yang dirancang untuk memberikan rasa nyaman dan aman bagi bayi dan Bunda."}
        </p>

        {/* Meta: durasi + harga */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-sky-500" />
            <span>{s.duration ? `${s.duration} menit` : "Durasi fleksibel"}</span>
          </div>

          {displayPrice && (
            <div className="flex flex-col items-end">
              {priceLabelPrefix && (
                <span className="text-[10px] text-slate-400 uppercase tracking-[0.18em]">
                  {priceLabelPrefix}
                </span>
              )}
              <p className="text-sm sm:text-base font-semibold text-sky-700">
                Rp {displayPrice}
              </p>
            </div>
          )}
        </div>

        {/* Footer: CTA */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <Link
            to={`/services/${id}`}
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-slate-800 hover:text-sky-700 transition-colors group"
          >
            Detail layanan
            <span className="ml-1 translate-y-[1px] text-[13px] transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          {hasPriceTiers ? (
            // Kalau ada tier → suruh ke detail dulu biar pilih harga/usia
            <Link
              to={`/services/${id}`}
              className="inline-flex items-center rounded-full bg-sky-500/90 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-white shadow-sm shadow-sky-300/70 transition-all duration-200 hover:bg-sky-600 hover:shadow-md"
            >
              Pilih harga &amp; booking
            </Link>
          ) : (
            // Kalau single price → boleh booking cepat
            <Link
              to={`/booking/${id}`}
              className="inline-flex items-center rounded-full bg-sky-500/90 px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-white shadow-sm shadow-sky-300/70 transition-all duration-200 hover:bg-sky-600 hover:shadow-md"
            >
              Booking cepat
            </Link>
          )}
        </div>
      </div>

      {/* Glow halus di bawah ketika hover */}
      <div className="pointer-events-none absolute inset-x-6 -bottom-4 h-6 rounded-full bg-sky-200/0 blur-2xl transition-opacity duration-300 group-hover:bg-sky-200/50 group-hover:opacity-70" />
    </article>
  );
};

export default ServiceCard;
