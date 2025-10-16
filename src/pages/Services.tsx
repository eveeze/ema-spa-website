// src/pages/Services.tsx
import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";
import { Gem, AlertCircle, Sparkles } from "lucide-react";
import { Service } from "../types";
import ServiceCard from "../components/ServiceCard";

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get("/service?isActive=true");

        if (response.data?.success && Array.isArray(response.data.data)) {
          setServices(response.data.data);
        } else {
          setServices([]);
          setError("Format data tidak sesuai");
        }
      } catch (err: unknown) {
        let errorMessage = "Gagal memuat layanan. Silakan coba lagi nanti.";

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err &&
          typeof (err as Record<string, unknown>).response === "object"
        ) {
          const response = (
            err as { response?: { data?: { message?: string } } }
          ).response;
          if (response?.data?.message) {
            errorMessage = response.data.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 min-h-screen py-16">
        <div className="container mx-auto px-6">
          <div className="text-center py-24">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500 mx-auto"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-sky-500" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold text-gray-800">
              Memuat Layanan Terbaik
            </h2>
            <p className="mt-2 text-gray-600">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 min-h-screen py-16">
        <div className="container mx-auto px-6">
          <div className="text-center py-24">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Oops! Ada Masalah
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen">
      {/* Services Section */}
      <div className="container mx-auto px-6 pb-20">
        {services.length > 0 ? (
          <>
            {/* Services Stats */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center bg-white rounded-full px-6 py-3 shadow-lg border border-sky-100 mt-8">
                <Sparkles className="h-5 w-5 text-sky-500 mr-2" />
                <span className="text-sky-700 font-semibold">
                  {services.length} Layanan Premium Tersedia
                </span>
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="transform transition-all duration-300 hover:scale-105"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-24">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="bg-sky-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
                <Gem className="h-12 w-12 text-sky-500 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Layanan Segera Hadir
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Kami sedang mempersiapkan layanan terbaik untuk Anda. Silakan
                kembali lagi dalam waktu dekat.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-sky-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Periksa Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesPage;
