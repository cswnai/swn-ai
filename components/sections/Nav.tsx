"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import Button from "@/components/ui/Button";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] transition-shadow duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
      >
        <a
          href="#"
          className="font-serif font-bold text-xl text-[#0F172A] tracking-tight"
        >
          SWN{" "}
          <span className="border-b-2 border-[#0F172A]">AI</span>
        </a>

        <ul className="hidden md:flex items-center gap-8 list-none">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-[#4B5563] hover:text-[#0F172A] transition-colors font-sans"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <Button href="#contact" variant="primary">
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden text-[#0F172A] p-2 -mr-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden bg-white border-b border-[#E5E7EB] overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base text-[#4B5563] hover:text-[#0F172A] transition-colors font-sans py-1"
                >
                  {link.label}
                </a>
              ))}
              <Button
                href="#contact"
                variant="primary"
                className="w-full mt-1 justify-center"
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
