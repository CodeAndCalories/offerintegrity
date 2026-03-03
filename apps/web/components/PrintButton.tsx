"use client";

interface PrintButtonProps {
  className?: string;
}

export default function PrintButton({ className }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className={
        className ||
        "inline-flex items-center gap-2 border border-[#2a2a2a] text-parchment-dim px-4 py-2.5 text-xs tracking-widest uppercase hover:border-gold hover:text-parchment transition-colors print:hidden"
      }
    >
      ⎙ Print Report
    </button>
  );
}
