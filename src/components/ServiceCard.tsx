// src/components/ServiceCard.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Star, Baby, ImageIcon } from "lucide-react";
import { Service } from "../types";

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getAgeRange = (minAge: number | null, maxAge: number | null) => {
    if (minAge === null || maxAge === null) {
      return "Semua usia";
    }
    return `${minAge}-${maxAge} bulan`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {!imageError && service.imageUrl ? (
          <>
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Actual image */}
            <img
              src={service.imageUrl}
              alt={service.name}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          </>
        ) : (
          /* Fallback for missing/error image */
          <div className="w-full h-full bg-gradient-to-br from-brand-primary/10 to-brand-primary/20 flex items-center justify-center">
            <div className="text-center">
              <Baby className="w-16 h-16 text-brand-primary/50 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No Image</p>
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
            {service.category.name}
          </span>
        </div>

        {/* Rating Badge (if available) */}
        {service.averageRating && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span className="text-xs font-semibold">
              {service.averageRating}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Service Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {service.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>

        {/* Service Info */}
        <div className="space-y-2 mb-4">
          {/* Duration */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{service.duration} menit</span>
          </div>

          {/* Age Range */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Baby className="w-4 h-4" />
            <span>
              Usia {getAgeRange(service.minBabyAge, service.maxBabyAge)}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          {service.price !== null ? (
            <>
              <span className="text-2xl font-bold text-brand-primary">
                {formatPrice(service.price)}
              </span>
              {service.hasPriceTiers && (
                <span className="text-sm text-gray-500 ml-2">mulai dari</span>
              )}
            </>
          ) : (
            <span className="text-lg font-semibold text-gray-600">
              Harga bervariasi
            </span>
          )}
        </div>

        {/* Action Button */}
        <Link
          to={`/services/${service.id}`}
          className="w-full bg-sky-300 -primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-primary/90 transition-colors duration-200 text-center block"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;
