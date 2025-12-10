// /src/components/ui/Button.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
  type?: "button" | "submit" | "reset";
  /**
   * Full width on mobile, auto width on larger screen.
   */
  fullWidth?: boolean;
  /**
   * Disable interaction.
   */
  disabled?: boolean;
  /**
   * Show loading spinner (auto disable button).
   */
  isLoading?: boolean;
  /**
   * Optional icon on the left side.
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional icon on the right side.
   */
  rightIcon?: React.ReactNode;
}

// Casting ke any biar framer-motion gak berantem sama tipe Link
const MotionLink = motion(Link as React.ComponentType<any>);
const MotionButton = motion.button;

const Button: React.FC<ButtonProps> = ({
  to,
  onClick,
  children,
  variant = "sky",
  className = "",
  size = "md",
  type = "button",
  fullWidth = false,
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
}) => {
  const isDisabled = disabled || isLoading;

  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight " +
    "transition-all duration-300 ease-out transform will-change-transform " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-60 disabled:pointer-events-none";

  const widthStyles = fullWidth ? "w-full sm:w-auto" : "w-auto";

  const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-4 py-2 text-xs md:text-sm",
    md: "px-6 py-2.5 text-sm md:px-8 md:py-3 md:text-base",
    lg: "px-7 py-3 text-base md:px-10 md:py-4 md:text-lg",
  };

  const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    sky:
      "bg-gradient-to-br from-sky-400 to-sky-600 text-white " +
      "shadow-lg shadow-sky-300/40 " +
      "hover:-translate-y-0.5 hover:shadow-xl hover:brightness-[1.08] " +
      "active:translate-y-0 focus-visible:ring-sky-200",
    pink:
      "bg-gradient-to-br from-pink-400 to-pink-600 text-white " +
      "shadow-lg shadow-pink-300/40 " +
      "hover:-translate-y-0.5 hover:shadow-xl hover:brightness-[1.08] " +
      "active:translate-y-0 focus-visible:ring-pink-200",
    yellow:
      "bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 " +
      "shadow-lg shadow-amber-300/40 " +
      "hover:-translate-y-0.5 hover:shadow-xl hover:brightness-[1.06] " +
      "active:translate-y-0 focus-visible:ring-amber-200",
    gradient:
      "bg-gradient-to-r from-sky-400 via-pink-400 to-amber-400 text-white " +
      "shadow-lg shadow-sky-300/40 " +
      "hover:-translate-y-0.5 hover:shadow-xl hover:saturate-125 " +
      "active:translate-y-0 focus-visible:ring-pink-200",
    "outline-sky":
      "border border-sky-300/70 bg-sky-50/40 text-sky-700 " +
      "backdrop-blur-sm shadow-sm " +
      "hover:bg-sky-100/70 hover:shadow-md hover:-translate-y-0.5 " +
      "active:translate-y-0 focus-visible:ring-sky-200",
    "outline-pink":
      "border border-pink-300/70 bg-pink-50/40 text-pink-700 " +
      "backdrop-blur-sm shadow-sm " +
      "hover:bg-pink-100/70 hover:shadow-md hover:-translate-y-0.5 " +
      "active:translate-y-0 focus-visible:ring-pink-200",
    "outline-yellow":
      "border border-amber-300/70 bg-amber-50/40 text-amber-700 " +
      "backdrop-blur-sm shadow-sm " +
      "hover:bg-amber-100/70 hover:shadow-md hover:-translate-y-0.5 " +
      "active:translate-y-0 focus-visible:ring-amber-200",
  };

  const styles = [
    baseStyles,
    widthStyles,
    sizeStyles[size],
    variantStyles[variant],
    "whitespace-nowrap",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {!isLoading && leftIcon}
      <span className="relative">{children}</span>
      {!isLoading && rightIcon}
    </>
  );

  if (to) {
    return (
      <MotionLink
        to={to}
        className={styles}
        aria-disabled={isDisabled}
        onClick={isDisabled ? (e: React.MouseEvent) => e.preventDefault() : onClick}
        whileTap={!isDisabled ? { scale: 0.97, y: 1 } : {}}
      >
        {content}
      </MotionLink>
    );
  }

  return (
    <MotionButton
      type={type}
      onClick={isDisabled ? undefined : onClick}
      className={styles}
      disabled={isDisabled}
      whileTap={!isDisabled ? { scale: 0.97, y: 1 } : {}}
    >
      {content}
    </MotionButton>
  );
};

export default Button;
