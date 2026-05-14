interface SectionHeaderProps {
  label: string;
  heading: string;
  body?: string;
  centered?: boolean;
  inverted?: boolean;
}

export default function SectionHeader({
  label,
  heading,
  body,
  centered = true,
  inverted = false,
}: SectionHeaderProps) {
  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""} mb-16`}>
      <p
        className={`text-xs font-semibold uppercase tracking-widest mb-4 font-sans ${
          inverted ? "text-[#93C5FD]" : "text-[#0F172A]"
        }`}
      >
        {label}
      </p>
      <h2
        className={`font-serif font-bold text-4xl leading-tight mb-4 ${
          inverted ? "text-white" : "text-[#0A0A0A]"
        }`}
      >
        {heading}
      </h2>
      {body && (
        <p
          className={`text-lg leading-relaxed font-sans ${
            inverted ? "text-[#CBD5E1]" : "text-[#4B5563]"
          }`}
        >
          {body}
        </p>
      )}
    </div>
  );
}
