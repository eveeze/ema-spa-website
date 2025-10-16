// /src/components/features/home/CtaSection.tsx
import React from "react";
import Button from "../../ui/Button";

const CtaSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-sky-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-3xl p-12 lg:p-16 text-center shadow-xl">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white">
            Siap Manjakan Buah Hati & Bunda?
          </h2>
          <p className="max-w-3xl mx-auto mb-10 text-blue-50 text-lg leading-relaxed">
            Jangan tunda lagi, berikan pengalaman relaksasi terbaik untuk orang
            terkasih. Jadwalkan sesi Anda sekarang juga.
          </p>
          <Button
            to="/booking"
            
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Booking Sekarang
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
