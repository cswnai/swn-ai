"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import SectionHeader from "@/components/ui/SectionHeader";
import { METRICS } from "@/lib/constants";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const duration = 1800;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const metricCard: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Results() {
  return (
    <section className="py-24 bg-[#0F172A]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <SectionHeader
            label="By The Numbers"
            heading="Founder track record."
            body="Before building SWN AI, Conor spent years inside the businesses he now serves — solving the exact problems that slow teams down."
            inverted
          />
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {METRICS.map((metric) => (
            <motion.div
              key={metric.label}
              variants={metricCard}
              className="text-center p-6 rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="font-serif font-bold text-5xl text-white leading-none mb-2">
                <CountUp target={metric.value} suffix={metric.suffix} />
              </div>
              <div className="font-sans text-sm font-semibold text-[#93C5FD] uppercase tracking-wider mb-3">
                {metric.unit}
              </div>
              <p className="font-sans text-sm text-[#94A3B8] leading-relaxed">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
