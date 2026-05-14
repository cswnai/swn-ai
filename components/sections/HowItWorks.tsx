"use client";

import { motion, type Variants } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import { STEPS } from "@/lib/constants";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const stepVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeader
            label="The Process"
            heading="Simple. Fast. Done."
            body="From first conversation to live system in days, not months."
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Connecting line */}
          <div
            className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-[#E5E7EB]"
            aria-hidden="true"
          />

          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={stepVariant}
              className="relative bg-[#FAFAFA] rounded-2xl border border-[#E5E7EB] p-8 text-center overflow-hidden"
            >
              {/* Ghost number behind content */}
              <div
                className="absolute inset-x-0 -top-3 text-[7rem] font-serif font-bold text-[#0F172A] leading-none select-none pointer-events-none text-center"
                style={{ opacity: 0.04 }}
                aria-hidden="true"
              >
                {step.number}
              </div>

              {/* Step badge */}
              <div className="relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0F172A] text-white text-sm font-semibold font-sans mb-6">
                {parseInt(step.number, 10)}
              </div>

              <h3 className="relative z-10 font-sans font-semibold text-xl text-[#0A0A0A] mb-1">
                {step.title}
              </h3>
              <p className="relative z-10 text-[11px] font-semibold text-[#0F172A] uppercase tracking-widest mb-4 font-sans">
                {step.subtitle}
              </p>
              <p className="relative z-10 font-sans text-[#4B5563] leading-relaxed text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
