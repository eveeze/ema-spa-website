// /src/components/ui/Card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  colorScheme?: "sky" | "pink" | "yellow" | "gradient";
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  colorScheme = "sky",
  hover = true,
}) => {
  const colorSchemes = {
    sky: "border-sky-200 bg-gradient-to-br from-sky-50 to-white hover:border-sky-300",
    pink: "border-pink-200 bg-gradient-to-br from-pink-50 to-white hover:border-pink-300",
    yellow:
      "border-yellow-200 bg-gradient-to-br from-yellow-50 to-white hover:border-yellow-300",
    gradient:
      "border-sky-200 bg-gradient-to-br from-sky-50 via-pink-50 to-yellow-50 hover:border-pink-300",
  };

  const hoverEffect = hover ? "hover:shadow-lg hover:scale-105" : "";

  return (
    <div
      className={`
      p-6 rounded-xl shadow-md border-2 transition-all duration-300 
      ${colorSchemes[colorScheme]} 
      ${hoverEffect} 
      ${className}
    `}
    >
      {children}
    </div>
  );
};

export default Card;
