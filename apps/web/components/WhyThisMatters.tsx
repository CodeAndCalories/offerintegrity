"use client";
import { useState } from "react";

interface WhyThisMattersProps {
  bullets: string[];
  title?: string;
}

export default function WhyThisMatters({ bullets, title = "Why this matters" }: WhyThisMattersProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-[#1a1a1a] mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="mono text-xs text-parchment-muted tracking-widest uppercase group-hover:text-parchment transition-colors">
          {title}
        </span>
        <span
          className="text-gold text-xs transition-transform duration-200"
          style={{ display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <ul className="pb-4 space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-3 text-xs text-parchment-muted leading-relaxed">
              <span className="text-gold shrink-0 mt-0.5">·</span>
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
