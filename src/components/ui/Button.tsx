// /src/components/ui/Button.tsx
import React from "react";
import { Link } from "react-router-dom";

interface ButtonProps {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?:
    | "sky"
    | "pink"
    | "yellow"
    | "gradient"
    | "outline-sky"
    | "outline-pink"
    | "outline-yellow";
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  to,
  onClick,
  children,
  variant = "sky",
  className = "",
  size = "md",
}) => {
  const baseStyles =
    "font-semibold rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-lg hover:shadow-xl";

  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-lg",
  };

  const variantStyles = {
    sky: "bg-gradient-to-r from-sky-400 to-sky-600 text-white hover:from-sky-500 hover:to-sky-700 focus:ring-sky-300",
    pink: "bg-gradient-to-r from-pink-400 to-pink-600 text-white hover:from-pink-500 hover:to-pink-700 focus:ring-pink-300",
    yellow:
      "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white hover:from-yellow-500 hover:to-yellow-700 focus:ring-yellow-300",
    gradient:
      "bg-gradient-to-r from-sky-400 via-pink-400 to-yellow-400 text-white hover:from-sky-500 hover:via-pink-500 hover:to-yellow-500 focus:ring-pink-300",
    "outline-sky":
      "bg-transparent border-2 border-sky-400 text-sky-600 hover:bg-sky-400 hover:text-white focus:ring-sky-300",
    "outline-pink":
      "bg-transparent border-2 border-pink-400 text-pink-600 hover:bg-pink-400 hover:text-white focus:ring-pink-300",
    "outline-yellow":
      "bg-transparent border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-white focus:ring-yellow-300",
  };

  const styles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={styles}>
      {children}
    </button>
  );
};

export default Button;
