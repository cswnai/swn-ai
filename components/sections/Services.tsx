"use client";

import { motion, type Variants } from "framer-motion";
import { Zap, Globe, Settings2, MessageSquare } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { SERVICES } from "@/lib/constants";

const ICON_MAP = {
  Zap,
  Globe,
  Settings2,
  MessageSquare,
} as const;

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Services() {
  return (
    <section id="services" className="py-24 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeader
            label="What We Build"
            heading="Four systems that grow your business."
            body="We combine web and AI to deliver the tools local businesses need to compete — without the complexity."
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {SERVICES.map((service) => {
            const Icon = ICON_MAP[service.icon as keyof typeof ICON_MAP];
            return (
              <motion.div
                key={service.title}
                variants={card}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 cursor-default transition-shadow hover:shadow-md"
              >
                <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center mb-6">
                  <Icon size={22} className="text-[#0F172A]" strokeWidth={1.75} />
                </div>
                <h3 className="font-sans font-semibold text-xl text-[#0A0A0A] mb-3">
                  {service.title}
                </h3>
                <p className="font-sans text-[#4B5563] leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
