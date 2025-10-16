// src/pages/ServiceDetail.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";
import { Service } from "../types"; // Asumsikan PriceTier ada di types
import {
  Clock,
  Baby,
  ChevronRight,
  ShieldCheck,
  Heart,
  Sparkles,
} from "lucide-react";

// Komponen kecil untuk menampilkan item informasi
const InfoPill = ({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) => (
  <div className="flex items-center gap-x-2 bg-gradient-to-r from-sky-50 to-pink-50 text-sky-600 rounded-full px-4 py-2.5 text-sm font-semibold border border-sky-100/50 shadow-sm">
    <Icon className="w-4 h-4 text-sky-500" />
    <span>{text}</span>
  </div>
);

// Floating decoration component
const FloatingDecor = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute top-10 left-10 text-pink-200 opacity-20">
      <Heart className="w-16 h-16 animate-pulse" />
    </div>
    <div className="absolute top-32 right-16 text-sky-200 opacity-20">
      <Sparkles className="w-12 h-12 animate-bounce" />
    </div>
    <div className="absolute bottom-20 left-20 text-yellow-200 opacity-20">
      <Baby className="w-14 h-14 animate-pulse" />
    </div>
  </div>
);

const ServiceDetailPage = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // BARU: State untuk menyimpan tier harga yang dipilih
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;

    const fetchServiceDetail = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/service/${serviceId}`);
        setService(response.data.data);
      } catch (err) {
        setError("Layanan tidak ditemukan atau terjadi kesalahan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [serviceId]);

  // BARU: Fungsi untuk menangani klik tombol booking
  const handleBooking = () => {
    // Validasi: Jika ada price tier, harus dipilih dulu
    if (service?.hasPriceTiers && !selectedTierId) {
      alert("Silakan pilih detail harga per usia terlebih dahulu.");
      return;
    }

    // Kirim priceTierId sebagai query parameter jika ada
    const bookingUrl = selectedTierId
      ? `/booking/${serviceId}?priceTierId=${selectedTierId}`
      : `/booking/${serviceId}`;

    navigate(bookingUrl);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-300 border-t-pink-300 mx-auto mb-4"></div>
          <p className="text-xl text-sky-600 font-medium">
            Memuat Detail Layanan...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="text-red-400 mb-4">
            <Baby className="w-16 h-16 mx-auto opacity-50" />
          </div>
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );

  if (!service) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-pink-50 relative">
      <FloatingDecor />

      <div className="container mx-auto px-4 py-8 lg:py-16 relative z-10">
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-12">
          {/* Kolom Kiri: Gambar & Info Kategori */}
          <div className="lg:col-span-3 space-y-6">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-100 to-pink-100 text-sky-700 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider border border-sky-200/50">
              <Sparkles className="w-4 h-4" />
              {service.category.name}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight mb-4">
                {service.name}
              </h1>
            </div>

            {/* Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-200/20 to-pink-200/20 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
              <img
                src={
                  service.imageUrl ||
                  "https://images.unsplash.com/photo-1544991887-a"
                }
                alt={service.name}
                className="relative w-full h-auto rounded-2xl shadow-2xl aspect-video object-cover border-4 border-white group-hover:shadow-3xl transition-all duration-300"
              />
            </div>

            {/* Description Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100/50 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-sky-400 to-pink-400 rounded-full"></div>
                <h3 className="font-bold text-xl md:text-2xl text-gray-800">
                  Deskripsi Layanan
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                {service.description}
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Detail, Harga & Tombol Aksi */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white/90 backdrop-blur-lg p-6 md:p-8 rounded-3xl shadow-2xl border border-sky-100/50">
              {/* Price Section */}
              <div className="mb-8 text-center">
                <div className="bg-gradient-to-r from-sky-50 to-pink-50 rounded-2xl p-6 border border-sky-100/50">
                  {service.hasPriceTiers ? (
                    <div>
                      <p className="text-base text-gray-600 font-medium">
                        Mulai dari
                      </p>
                      <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">
                        Rp{" "}
                        {Math.min(
                          ...service.priceTiers.map((t) => t.price)
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-base text-gray-600 font-medium">
                        Harga
                      </p>
                      <p className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-pink-600 bg-clip-text text-transparent">
                        Rp {service.price?.toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Pills */}
              <div className="space-y-3 mb-8">
                <InfoPill
                  icon={Clock}
                  text={`Durasi ${service.duration} menit`}
                />
                <InfoPill
                  icon={Baby}
                  text={`Untuk usia ${
                    service.hasPriceTiers
                      ? `${Math.min(
                          ...service.priceTiers.map((t) => t.minBabyAge)
                        )}-${Math.max(
                          ...service.priceTiers.map((t) => t.maxBabyAge)
                        )}`
                      : `${service.minBabyAge}-${service.maxBabyAge}`
                  } bulan`}
                />
              </div>

              {/* Price Tiers - DIUBAH */}
              {service.hasPriceTiers && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-6 bg-gradient-to-b from-sky-400 to-pink-400 rounded-full"></div>
                    Pilih Detail Harga per Usia
                  </h4>
                  <div className="space-y-3">
                    {service.priceTiers.map((tier) => {
                      const isSelected = selectedTierId === tier.id;
                      return (
                        <button
                          key={tier.id}
                          onClick={() => setSelectedTierId(tier.id)}
                          className={`w-full flex justify-between items-center text-sm p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                            isSelected
                              ? "border-sky-500 bg-sky-50 shadow-lg ring-2 ring-sky-200"
                              : "border-gray-200 bg-white hover:border-sky-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 text-left">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isSelected ? "bg-sky-500" : "bg-gray-300"
                              }`}
                            ></div>
                            <div>
                              <span className="font-semibold text-gray-700">
                                {tier.tierName}
                              </span>
                              <span className="block text-gray-500 text-xs">
                                ({tier.minBabyAge}-{tier.maxBabyAge} bln)
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-gray-900">
                            Rp {tier.price.toLocaleString("id-ID")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CTA Button - DIUBAH */}
              <button
                onClick={handleBooking}
                disabled={service.hasPriceTiers && !selectedTierId}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-2xl text-base md:text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                <div className="relative flex items-center justify-center gap-x-2">
                  <Heart className="w-5 h-5" />
                  {service.hasPriceTiers && !selectedTierId
                    ? "Pilih Harga Dahulu"
                    : "Reservasi Sekarang"}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </button>

              {/* Trust Badge */}
              <div className="mt-6 flex items-center justify-center gap-x-2 text-sm text-gray-500 bg-green-50 p-3 rounded-xl border border-green-100">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="font-medium">
                  Transaksi Aman & Terapis Profesional
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
