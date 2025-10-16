// /src/components/ui/SectionTitle.tsx
import React from "react";

interface SectionTitleProps {
  title: string;
  subtitle: string;
  colorScheme?: "sky" | "pink" | "yellow" | "gradient";
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  colorScheme = "sky",
}) => {
  const colorSchemes = {
    sky: {
      subtitle: "text-sky-500",
      title: "text-sky-900",
    },
    pink: {
      subtitle: "text-pink-500",
      title: "text-pink-900",
    },
    yellow: {
      subtitle: "text-yellow-500",
      title: "text-yellow-900",
    },
    gradient: {
      subtitle:
        "bg-gradient-to-r from-sky-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent",
      title:
        "bg-gradient-to-r from-sky-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent",
    },
  };

  return (
    <div className="text-center mb-12">
      <h3
        className={`text-sm font-bold uppercase tracking-widest ${colorSchemes[colorScheme].subtitle}`}
      >
        {subtitle}
      </h3>
      <h2
        className={`text-4xl font-bold mt-2 ${colorSchemes[colorScheme].title}`}
      >
        {title}
      </h2>
    </div>
  );
};

export default SectionTitle;
