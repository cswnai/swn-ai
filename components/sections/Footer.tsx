import { Mail } from "lucide-react";

function LinkedinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
import { NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-[#080E1A] text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Brand */}
          <div>
            <div className="font-serif font-bold text-xl text-white mb-2">
              SWN{" "}
              <span className="border-b-2 border-white/60">AI</span>
            </div>
            <p className="font-sans text-sm text-[#64748B]">
              AI + Web for Local Business
            </p>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-3 list-none">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-sans text-sm text-[#64748B] hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <a
              href="mailto:hello@swnai.ie"
              className="flex items-center gap-2 font-sans text-sm text-[#64748B] hover:text-white transition-colors"
            >
              <Mail size={14} aria-hidden="true" />
              hello@swnai.ie
            </a>
            <a
              href="#"
              aria-label="SWN AI on LinkedIn"
              className="flex items-center gap-2 font-sans text-sm text-[#64748B] hover:text-white transition-colors"
            >
              <LinkedinIcon size={14} />
              LinkedIn
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.07] text-center">
          <p className="font-sans text-xs text-[#334155]">
            © 2025 SWN AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
