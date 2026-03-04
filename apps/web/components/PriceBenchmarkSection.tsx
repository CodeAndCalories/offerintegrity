"use client";

import { computePriceBenchmark, type PriceBenchmarkResult, type PricePositionLabel } from "@/lib/priceBenchmark";

// ─── Shared primitives (self-contained to avoid cross-file coupling) ──────────

type BadgeColor = "red" | "amber" | "emerald" | "blue" | "gold" | "violet";

function Badge({ text, color }: { text: string; color: BadgeColor }) {
  const cls: Record<BadgeColor, string> = {
    red:     "text-red-400 border-red-800/40 bg-red-950/20",
    amber:   "text-amber-400 border-amber-800/40 bg-amber-950/20",
    emerald: "text-emerald-400 border-emerald-800/40 bg-emerald-950/20",
    blue:    "text-blue-400 border-blue-800/40 bg-blue-950/20",
    gold:    "text-gold border-gold/30 bg-gold/5",
    violet:  "text-violet-400 border-violet-800/40 bg-violet-950/20",
  };
  return (
    <span className={`mono text-xs px-3 py-1 border rounded-sm ${cls[color]}`}>
      {text}
    </span>
  );
}

const LABEL_COLOR: Record<PricePositionLabel, BadgeColor> = {
  Premium: "gold",
  Market:  "blue",
  Budget:  "amber",
};

// ─── Public component ─────────────────────────────────────────────────────────

export default function PriceBenchmarkSection({
  report,
  competitors = [],
}: {
  report: any;
  competitors?: { name: string; price: string; promise: string }[];
}) {
  if (!report) return null;

  const benchmark: PriceBenchmarkResult = computePriceBenchmark(
    report.meta.price as number,
    competitors
  );

  return (
    <section className="fade-up price-benchmark-section">
      <div className="mb-8">
        <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-2">
          Step 2 · Price Intelligence
        </p>
        <h2 className="text-2xl font-light">Price Benchmark</h2>
      </div>

      <div className="border border-[#1a1a1a]">
        {!benchmark.hasData ? (
          /* ── No competitor data ── */
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-3">
              Competitor Data
            </p>
            <p className="text-sm text-parchment-dim leading-relaxed">
              No competitor data provided. Add competitor pricing on the intake
              form to unlock market positioning analysis.
            </p>
          </div>
        ) : (
          /* ── Full benchmark ── */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {/* Positioning */}
            <div className="bg-ink p-8 flex flex-col gap-4">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase">
                Price Positioning
              </p>
              <div className="flex items-center gap-3">
                <Badge
                  text={benchmark.positionLabel!}
                  color={LABEL_COLOR[benchmark.positionLabel!]}
                />
                <span className="mono text-xs text-parchment-muted">
                  {benchmark.competitorCount} competitor
                  {benchmark.competitorCount !== 1 ? "s" : ""} analyzed
                </span>
              </div>
              <p className="text-sm text-parchment-dim leading-relaxed">
                {benchmark.positionImplication}
              </p>
            </div>

            {/* Price stats */}
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-6">
                Price Comparison
              </p>
              <div className="space-y-4">
                {[
                  { label: "Your Price",        val: benchmark.userPriceFormatted,   accent: "text-gold" },
                  { label: "Competitor Avg",     val: benchmark.avgPriceFormatted,    accent: "text-parchment" },
                  { label: "Competitor Median",  val: benchmark.medianPriceFormatted, accent: "text-parchment-dim" },
                ].map(({ label, val, accent }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-parchment-dim">{label}</span>
                    <span className={`mono text-sm font-light ${accent}`}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Visual position bar */}
              <div className="mt-6">
                <div className="flex justify-between mono text-xs text-parchment-muted mb-1">
                  <span>Budget</span>
                  <span>Market</span>
                  <span>Premium</span>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full relative overflow-hidden">
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 bg-amber-900/30" />
                    <div className="flex-1 bg-blue-900/30" />
                    <div className="flex-1 bg-gold/10" />
                  </div>
                  {/* User price marker */}
                  <PositionMarker
                    userPrice={benchmark.userPrice}
                    avgPrice={benchmark.avgPrice}
                  />
                </div>
              </div>
            </div>

            {/* Implication */}
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
                What This Means
              </p>
              <div className="border-l-2 border-gold/30 pl-4">
                <p className="text-sm text-parchment-dim leading-relaxed">
                  {benchmark.positionLabel === "Premium" &&
                    "Premium positioning commands higher close rates only when backed by extraordinary proof, a named mechanism, and a believable outcome promise. Without these, buyers will comparison-shop you out."}
                  {benchmark.positionLabel === "Market" &&
                    "At market price, your offer lives or dies on differentiation. Buyers can find alternatives at the same price point — give them a structural reason to stop looking."}
                  {benchmark.positionLabel === "Budget" &&
                    "Sub-market pricing can attract volume buyers but risks positioning you as the 'cheap option' in a category where buyers equate price with quality. Consider whether strategic price anchoring could support a higher rate."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Renders a marker dot on the position bar.
 * Clamps between 5%–95% so the dot never disappears off an edge.
 */
function PositionMarker({
  userPrice,
  avgPrice,
}: {
  userPrice: number;
  avgPrice: number;
}) {
  // Map: budget = 0%, market = 50%, premium = 100%
  // Budget threshold: avg * 0.75  → 16.67% of bar
  // Premium threshold: avg * 1.25 → 83.33% of bar
  // Linear scale: 0% = avg*0.5, 100% = avg*1.5
  const low  = avgPrice * 0.5;
  const high = avgPrice * 1.5;
  const rawPct = avgPrice > 0
    ? Math.round(((userPrice - low) / (high - low)) * 100)
    : 50;
  const pct = Math.max(5, Math.min(95, rawPct));

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gold border-2 border-ink shadow"
      style={{ left: `calc(${pct}% - 6px)` }}
    />
  );
}
