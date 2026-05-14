"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { TRUST_SIGNALS } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  business: z.string().min(1, "Business name is required"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().optional(),
  message: z.string().min(10, "Please tell us a bit more"),
});

type FormData = z.infer<typeof schema>;

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-xl border px-4 py-3 text-sm font-sans text-[#0A0A0A]",
    "placeholder:text-[#9CA3AF] outline-none transition-colors",
    "focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A]",
    hasError
      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-400"
      : "border-[#E5E7EB] bg-white",
  ].join(" ");
}

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setSubmittedName(data.name.split(" ")[0]);
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-24 bg-[#0F172A]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left: copy + trust signals */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <SectionHeader
              label="Get Started"
              heading="Tell us about your business."
              body="We'll review your message and get back within 24 hours with a free recommendation — no pitch, no pressure."
              centered={false}
              inverted
            />

            <ul className="space-y-4 mt-2">
              {TRUST_SIGNALS.map((signal) => (
                <li key={signal} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Check size={11} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="font-sans text-[#CBD5E1] text-sm">
                    {signal}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right: form card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="bg-white rounded-2xl shadow-2xl p-8"
          >
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center mx-auto mb-5">
                  <Check size={24} className="text-[#0F172A]" strokeWidth={2} />
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#0A0A0A] mb-2">
                  Thanks, {submittedName}.
                </h3>
                <p className="font-sans text-[#4B5563] text-sm leading-relaxed">
                  We&apos;ll be in touch within 24 hours with a free recommendation.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 font-sans"
                    >
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Smith"
                      className={inputClass(!!errors.name)}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500 font-sans">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="business"
                      className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 font-sans"
                    >
                      Business Name
                    </label>
                    <input
                      id="business"
                      type="text"
                      autoComplete="organization"
                      placeholder="Smith&apos;s Café"
                      className={inputClass(!!errors.business)}
                      {...register("business")}
                    />
                    {errors.business && (
                      <p className="mt-1 text-xs text-red-500 font-sans">
                        {errors.business.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 font-sans"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@smithscafe.ie"
                    className={inputClass(!!errors.email)}
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500 font-sans">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 font-sans"
                  >
                    Phone{" "}
                    <span className="text-[#9CA3AF] font-normal">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+353 87 123 4567"
                    className={inputClass(false)}
                    {...register("phone")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold text-[#0A0A0A] mb-1.5 font-sans"
                  >
                    Biggest problem right now
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="e.g. I'm spending too much time chasing leads, or I need a website that actually gets enquiries..."
                    className={`${inputClass(!!errors.message)} resize-none`}
                    {...register("message")}
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500 font-sans">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full bg-[#0F172A] text-white font-semibold font-sans py-3.5 text-sm hover:bg-[#1E293B] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Sending…
                    </>
                  ) : (
                    "Send Message →"
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
