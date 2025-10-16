// /src/layout/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-blue-light text-brand-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Ema Mom Kids Baby Spa</h3>
            <p className="text-brand-gray">
              Memberikan perawatan terbaik untuk buah hati dan bunda dengan
              sentuhan kasih sayang. Kami menyediakan berbagai layanan spa untuk
              bayi, anak, dan ibu hamil.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Navigasi</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-brand-blue">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-brand-blue">
                  Layanan
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-blue">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-blue">
                  Kontak
                </Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-brand-blue">
                  Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-bold text-lg mb-4">Ikuti Kami</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="text-brand-gray hover:text-brand-blue text-2xl"
              >
                <FaFacebook />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-brand-gray hover:text-brand-blue text-2xl"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="text-brand-gray hover:text-brand-blue text-2xl"
              >
                <FaWhatsapp />
              </a>
            </div>
            <p className="text-sm text-brand-gray mt-4">
              Jl. Contoh Alamat No. 123, Yogyakarta, Indonesia
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-brand-gray">
          <p>
            &copy; {new Date().getFullYear()} Ema Mom Kids Baby Spa. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
