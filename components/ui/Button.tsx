"use client";

import { motion } from "framer-motion";

type Variant = "primary" | "ghost" | "inverted";

interface ButtonProps {
  variant?: Variant;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#0F172A] text-white hover:bg-[#1E293B]",
  ghost:
    "border border-[#0F172A] text-[#0F172A] hover:bg-[#0F172A] hover:text-white",
  inverted:
    "bg-white text-[#0F172A] hover:bg-[#F8FAFC]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold font-sans transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2";

export default function Button({
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
  children,
}: ButtonProps) {
  const classes = `${base} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={classes}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={`${classes} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {children}
    </motion.button>
  );
}
