"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Founder() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      {/* Hidden SVG filter: navy (#0F172A) → ice-blue (#DBEAFE) duotone */}
      <svg
        aria-hidden="true"
        className="absolute"
        style={{ height: 0, width: 0, position: "absolute" }}
      >
        <defs>
          <filter id="founder-duotone" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.059 0.859" />
              <feFuncG type="table" tableValues="0.090 0.918" />
              <feFuncB type="table" tableValues="0.165 0.996" />
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Image column ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative">
              {/* Offset decorative block */}
              <div
                className="absolute -bottom-4 -right-4 w-full h-full rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE]"
                aria-hidden="true"
              />

              {/* Main image frame */}
              <div className="relative w-[320px] h-[360px] rounded-2xl overflow-hidden">
                {/* Dot-grid overlay matching hero */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(15,23,42,0.35) 1px, transparent 1px)",
                    backgroundSize: "22px 22px",
                    mixBlendMode: "multiply",
                  }}
                  aria-hidden="true"
                />

                {/* Duotone image */}
                <div
                  className="absolute inset-0"
                  style={{ filter: "url(#founder-duotone)" }}
                >
                  <Image
                    src="/headshot.jpeg"
                    alt="Conor Sweeney, Founder of SWN AI"
                    fill
                    sizes="320px"
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>

              {/* Corner brackets */}
              <div
                className="absolute -top-2.5 -left-2.5 w-6 h-6 border-t-2 border-l-2 border-[#0F172A]"
                aria-hidden="true"
              />
              <div
                className="absolute -top-2.5 -right-2.5 w-6 h-6 border-t-2 border-r-2 border-[#0F172A]"
                aria-hidden="true"
              />

              {/* Floating name badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0F172A] text-white text-xs font-semibold font-sans px-4 py-2 rounded-full shadow-lg z-20">
                Conor Sweeney — Founder
              </div>
            </div>
          </motion.div>

          {/* ── Bio column ── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0F172A] mb-4 font-sans">
              About the Founder
            </p>
            <h2 className="font-serif font-bold text-4xl leading-tight text-[#0A0A0A] mb-6">
              Built by someone who&apos;s been in the room.
            </h2>
            <p className="font-sans text-[#4B5563] leading-relaxed mb-5">
              I&apos;m Conor. Before starting SWN AI, I spent years working inside
              the businesses I now serve — supporting 200+ person teams, building
              dashboards that saved 40+ hours a month, and presenting new
              technology to rooms full of people who just needed it to work.
            </p>
            <p className="font-sans text-[#4B5563] leading-relaxed mb-8">
              I started SWN AI because I know what actually slows local
              businesses down — and I know exactly how to fix it with AI. No
              jargon. No black boxes. Just systems that get you results.
            </p>

            {/* Credential pills */}
            <div className="flex flex-wrap gap-2">
              {[
                "5+ yrs enterprise IT",
                "40+ hrs/month automated",
                "Systems thinker",
                "Based in Ireland",
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold font-sans text-[#0F172A] bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
