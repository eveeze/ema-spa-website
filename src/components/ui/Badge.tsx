// /src/components/ui/Badge.tsx
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "sky" | "pink" | "yellow" | "gradient";
  size?: "sm" | "md" | "lg";
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "sky",
  size = "md",
}) => {
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const variantStyles = {
    sky: "bg-sky-100 text-sky-800 border border-sky-200",
    pink: "bg-pink-100 text-pink-800 border border-pink-200",
    yellow: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    gradient:
      "bg-gradient-to-r from-sky-100 via-pink-100 to-yellow-100 text-gray-800 border border-pink-200",
  };

  return (
    <span
      className={`
      inline-flex items-center font-medium rounded-full
      ${sizeStyles[size]} 
      ${variantStyles[variant]}
    `}
    >
      {children}
    </span>
  );
};

export default Badge;
