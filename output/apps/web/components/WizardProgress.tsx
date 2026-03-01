/**
 * WizardProgress — shows step N of total with a progress bar.
 * Usage: <WizardProgress current={2} total={5} labels={["Offer", "Audience", ...]} />
 */

interface WizardProgressProps {
  current: number; // 1-indexed
  total: number;
  labels?: string[];
}

export default function WizardProgress({ current, total, labels }: WizardProgressProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="mb-8">
      {/* Step label */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs uppercase tracking-widest text-gold opacity-70">
          {labels?.[current - 1] ?? `Step ${current}`}
        </span>
        <span className="text-xs opacity-40">
          {current} / {total}
        </span>
      </div>

      {/* Progress track */}
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i + 1 <= current ? "bg-gold" : "bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
