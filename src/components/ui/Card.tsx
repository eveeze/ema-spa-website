// /src/components/ui/Card.tsx
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  colorScheme?: "sky" | "pink" | "yellow" | "gradient";
  /**
   * Aktifkan efek hover (floating + shadow).
   */
  hover?: boolean;
  /**
   * Opsional: jika diisi, card akan dianggap interaktif (cursor-pointer + focus state).
   */
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  colorScheme = "sky",
  hover = true,
  onClick,
}) => {
  const isInteractive = Boolean(onClick) || hover;

  const baseStyles =
    // layout & shape
    "relative overflow-hidden rounded-2xl border " +
    "p-4 sm:p-5 md:p-6 " +
    // visual style
    "bg-white/80 backdrop-blur-sm shadow-md " +
    // transition
    "transition-all duration-300 ease-out will-change-transform";

  const colorSchemes: Record<NonNullable<CardProps["colorScheme"]>, string> = {
    sky:
      "border-sky-100/80 bg-gradient-to-br from-sky-50/80 via-sky-50/60 to-white " +
      "shadow-sky-100/70",
    pink:
      "border-pink-100/80 bg-gradient-to-br from-pink-50/80 via-pink-50/60 to-white " +
      "shadow-pink-100/70",
    yellow:
      "border-amber-100/80 bg-gradient-to-br from-amber-50/80 via-amber-50/60 to-white " +
      "shadow-amber-100/70",
    gradient:
      "border-sky-100/80 bg-gradient-to-br from-sky-50/80 via-pink-50/70 to-amber-50/80 " +
      "shadow-sky-100/70",
  };

  const hoverEffect = hover
    ? "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 hover:brightness-[1.02]"
    : "";

  const interactiveStyles = isInteractive
    ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-200"
    : "";

  const styles = [
    baseStyles,
    colorSchemes[colorScheme],
    hoverEffect,
    interactiveStyles,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={styles}
      onClick={onClick}
      // kalau interaktif, bantu aksesibilitas dikit
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* subtle gradient overlay untuk depth ekstra */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/10" />
      {/* content */}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
};

export default Card;
