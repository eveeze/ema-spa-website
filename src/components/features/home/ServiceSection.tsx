// /src/components/features/home/ServicesSection.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import SectionTitle from "../../ui/SectionTitle";
import apiClient from "../../../api/apiClient";
import { Service } from "../../../types";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const ServicesSection: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiClient.get("/service?isActive=true");

        if (response.data?.success && Array.isArray(response.data.data)) {
          // Limit to first 3 services for home page
          setServices(response.data.data.slice(0, 3));
        } else {
          setServices([]);
          setError("Format data tidak sesuai");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message || err.message || "Gagal memuat layanan";
        setError(errorMessage);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Don't render section if there's an error or no services
  if (error || services.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          subtitle="Layanan Kami"
          title="Perawatan Terbaik untuk Anda"
        />

        {loading ? (
          // Loading state
          <div className="flex justify-center items-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transform hover:-translate-y-3 transition-all duration-500 border border-blue-100"
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="relative overflow-hidden">
                  {service.imageUrl ? (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <Sparkles className="h-12 w-12 text-blue-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent"></div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    {service.name}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {service.description ||
                      "Layanan berkualitas tinggi untuk kebutuhan Anda."}
                  </p>
                  {service.price && (
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        Rp {service.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  )}
                  <Link
                    to="/services"
                    className="inline-flex items-center font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-300 group"
                  >
                    Lihat Detail
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
                      →
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Services Button */}
        <div className="text-center mt-12">
          <Link
            to="/services"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            Lihat Semua Layanan
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
