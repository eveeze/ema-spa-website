// /src/pages/Home.tsx
import React from "react";
import HeroSection from "../components/features/home/HeroSection";
import ServicesSection from "../components/features/home/ServiceSection";
import CtaSection from "../components/features/home/CtaSection";

const Home: React.FC = () => {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <CtaSection />
    </>
  );
};

export default Home;
