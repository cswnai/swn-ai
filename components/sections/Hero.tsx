"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#FAFAFA] pt-16">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0F172A 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.04,
        }}
        aria-hidden="true"
      />

      {/* Gradient orb */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, #0F172A 0%, transparent 65%)",
          opacity: 0.045,
        }}
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.045, 0.065, 0.045],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 bg-[#EFF6FF] text-[#0F172A] text-xs font-semibold font-sans px-4 py-2 rounded-full border border-[#BFDBFE]">
            <span aria-hidden="true">⚡</span>
            Now taking new clients
          </span>
        </div>

        {/* Overline */}
        <p className="text-xs font-semibold uppercase tracking-widest text-[#0F172A] mb-6 font-sans">
          AI + Web for Local Business
        </p>

        {/* H1 */}
        <h1 className="font-serif font-bold leading-[1.08] tracking-tight text-[#0A0A0A] mb-7"
          style={{ fontSize: "clamp(2.8rem, 7vw, 4.5rem)" }}
        >
          More Customers.
          <br />
          <span className="text-[#0F172A]">Less Admin.</span>
          <br />
          Powered by AI.
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-[#4B5563] max-w-[520px] mx-auto mb-10 leading-relaxed font-sans">
          SWN AI builds done-for-you AI systems and high-converting websites for
          restaurants, trades, and local businesses — so you can focus on running
          the business, not chasing leads.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            href="#contact"
            variant="primary"
            className="text-base px-8 py-3.5"
          >
            Let&apos;s Talk →
          </Button>
          <Button
            href="#services"
            variant="ghost"
            className="text-base px-8 py-3.5"
          >
            See What We Build ↓
          </Button>
        </div>
      </div>
    </section>
  );
}
