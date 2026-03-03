"use client";

import { computeV2Analytics, V2Analytics } from "@/lib/v2Analytics";

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-2">{label}</p>
      <h2 className="text-2xl font-light">{title}</h2>
    </div>
  );
}

function Badge({
  text,
  color,
}: {
  text: string;
  color: "red" | "amber" | "emerald" | "blue" | "gold";
}) {
  const cls: Record<string, string> = {
    red:     "text-red-400 border-red-800/40 bg-red-950/20",
    amber:   "text-amber-400 border-amber-800/40 bg-amber-950/20",
    emerald: "text-emerald-400 border-emerald-800/40 bg-emerald-950/20",
    blue:    "text-blue-400 border-blue-800/40 bg-blue-950/20",
    gold:    "text-gold border-gold/30 bg-gold/5",
  };
  return (
    <span className={`mono text-xs px-3 py-1 border rounded-sm ${cls[color]}`}>
      {text}
    </span>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="h-1 bg-[#1a1a1a] w-full rounded-full mt-2">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Feature 2: Close Probability Range ──────────────────────────────────────

function CloseProbabilitySection({ data }: { data: V2Analytics["closeProbability"] }) {
  const confColor: Record<string, "emerald" | "amber" | "red"> = {
    High: "emerald",
    Moderate: "amber",
    Low: "red",
  };

  return (
    <section className="fade-up">
      <SectionHeader label="V2 Intelligence" title="Close Probability Range" />
      <div className="border border-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
          {/* Range */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
              Estimated Close Rate
            </p>
            <p className="text-5xl font-light text-gold">
              {data.rangeLow}–{data.rangeHigh}
              <span className="text-2xl">%</span>
            </p>
            <p className="mono text-xs text-parchment-muted mt-2">on qualified discovery calls</p>
          </div>

          {/* Confidence */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
              Confidence Level
            </p>
            <Badge text={data.confidence} color={confColor[data.confidence]} />
            <p className="text-sm text-parchment-dim leading-relaxed mt-4">{data.summary}</p>
          </div>

          {/* Drivers */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
              Key Drivers
            </p>
            <ul className="space-y-3">
              {data.drivers.map((d, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim leading-relaxed">
                  <span className="text-gold shrink-0 mono text-xs mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature 3: Risk Prediction Engine ───────────────────────────────────────

function RiskPredictionSection({ data }: { data: V2Analytics["riskPrediction"] }) {
  const bandColor: Record<string, "emerald" | "amber" | "red"> = {
    Low: "emerald",
    Medium: "amber",
    High: "red",
  };
  const bandDesc: Record<string, string> = {
    Low:    "Your offer structure has low inherent risk. Focus on optimisation.",
    Medium: "Moderate risk factors present. Address key drivers before scaling.",
    High:   "Multiple compounding risks detected. Resolve before significant investment.",
  };

  return (
    <section className="fade-up">
      <SectionHeader label="V2 Intelligence" title="Risk Prediction Engine" />
      <div className="border border-[#1a1a1a]">
        {/* Band header */}
        <div className="p-8 border-b border-[#1a1a1a] flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-2">
              Overall Risk Band
            </p>
            <div className="flex items-center gap-4">
              <Badge text={`${data.band} Risk`} color={bandColor[data.band]} />
              <p className="text-sm text-parchment-dim">{bandDesc[data.band]}</p>
            </div>
          </div>
        </div>

        {/* Drivers */}
        <div className="p-8 border-b border-[#1a1a1a]">
          <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
            Triggered Risk Drivers
          </p>
          <ul className="space-y-3">
            {data.drivers.map((d, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim leading-relaxed">
                <span className="text-amber-400 shrink-0 mt-0.5">!</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Reduction note */}
        <div className="p-8 bg-[#0d0d0d]">
          <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-3">
            Highest Leverage Reduction
          </p>
          <p className="text-sm text-parchment-dim leading-relaxed border-l-2 border-gold/40 pl-4">
            {data.reductionNote}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Feature 5: Price Justification Index ────────────────────────────────────

function PriceJustificationSection({
  data,
  askPrice,
}: {
  data: V2Analytics["priceJustification"];
  askPrice: number;
}) {
  const confColor: Record<string, "emerald" | "amber" | "red"> = {
    Strong: "emerald",
    Moderate: "amber",
    Weak: "red",
  };

  const withinBand =
    askPrice >= data.supportedLow && askPrice <= data.supportedHigh;
  const aboveBand = askPrice > data.supportedHigh;

  return (
    <section className="fade-up">
      <SectionHeader label="V2 Intelligence" title="Price Justification Index" />
      <div className="border border-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
          {/* Supported range */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
              Supported Price Band
            </p>
            <p className="text-4xl font-light text-gold">
              ${data.supportedLow.toLocaleString()} – ${data.supportedHigh.toLocaleString()}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Badge text={`${data.priceConfidence} Confidence`} color={confColor[data.priceConfidence]} />
              {withinBand && (
                <span className="mono text-xs text-emerald-400">✓ Your price is within band</span>
              )}
              {aboveBand && (
                <span className="mono text-xs text-amber-400">↑ Your price exceeds band</span>
              )}
              {!withinBand && !aboveBand && (
                <span className="mono text-xs text-blue-400">↓ Room to price higher</span>
              )}
            </div>
            <p className="text-sm text-parchment-dim leading-relaxed mt-4">{data.summary}</p>
          </div>

          {/* Friction warnings */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
              Friction Warnings
            </p>
            {data.frictionWarnings.length === 0 ? (
              <p className="text-sm text-emerald-400">No significant price friction detected.</p>
            ) : (
              <ul className="space-y-4">
                {data.frictionWarnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim leading-relaxed">
                    <span className="text-amber-400 shrink-0 mt-0.5 font-bold">!</span>
                    {w}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature 6: Offer Fragility Meter ────────────────────────────────────────

function FragilitySection({ data }: { data: V2Analytics["fragility"] }) {
  const labelColor: Record<string, "emerald" | "amber" | "red"> = {
    Resilient: "emerald",
    Balanced:  "amber",
    Fragile:   "red",
  };
  const barColor: Record<string, string> = {
    Resilient: "bg-emerald-500",
    Balanced:  "bg-amber-500",
    Fragile:   "bg-red-500",
  };

  return (
    <section className="fade-up">
      <SectionHeader label="V2 Intelligence" title="Offer Fragility Meter" />
      <div className="border border-[#1a1a1a]">
        {/* Label + bar */}
        <div className="p-8 border-b border-[#1a1a1a]">
          <div className="flex items-center justify-between mb-4">
            <Badge text={data.label} color={labelColor[data.label]} />
            <span className="mono text-xs text-parchment-muted">
              Fragility index: {data.score}/100
            </span>
          </div>
          <MiniBar value={data.score} max={100} color={barColor[data.label]} />
          <div className="flex justify-between mt-1">
            <span className="mono text-xs text-emerald-400">Resilient</span>
            <span className="mono text-xs text-red-400">Fragile</span>
          </div>
        </div>

        {/* Drivers + stabilization */}
        <div className="p-8">
          <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
            Fragility Drivers & Stabilization
          </p>
          <div className="space-y-5">
            {data.drivers.map((d, i) => (
              <div key={i} className="border border-[#1a1a1a] p-4">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-amber-400 shrink-0 mt-0.5">↓</span>
                  <p className="text-sm text-parchment">{d}</p>
                </div>
                <p className="text-xs text-parchment-muted pl-5">
                  → {data.stabilization[i]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature 10: Smarter Priority Fix Plan ───────────────────────────────────

function PriorityFixesSection({ data }: { data: V2Analytics["priorityFixes"] }) {
  const sourceLabel: Record<string, string> = {
    score_gap:     "Score Gap",
    risk_trigger:  "Risk Trigger",
    fragility:     "Fragility",
    price_friction: "Price Friction",
  };
  const sourceColor: Record<string, "red" | "amber" | "blue" | "gold"> = {
    score_gap:     "red",
    risk_trigger:  "amber",
    fragility:     "blue",
    price_friction: "gold",
  };

  return (
    <section className="fade-up">
      <SectionHeader label="V2 Intelligence" title="Smarter Priority Fix Plan" />
      <div className="space-y-4">
        {data.fixes.map((fix) => (
          <div key={fix.rank} className="border border-[#1a1a1a] p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-light text-gold mono">
                  {String(fix.rank).padStart(2, "0")}
                </span>
                <div>
                  <Badge
                    text={sourceLabel[fix.source] ?? fix.source}
                    color={sourceColor[fix.source] ?? "gold"}
                  />
                  {fix.pillar && (
                    <p className="mono text-xs text-parchment-muted mt-1">{fix.pillar}</p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-parchment leading-relaxed mb-2">{fix.action}</p>
            <p className="text-xs text-parchment-muted">
              Expected lift: {fix.expectedLift}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function V2Sections({ report }: { report: any }) {
  const v2 = computeV2Analytics(report);

  return (
    <div className="space-y-16">
      <CloseProbabilitySection data={v2.closeProbability} />
      <RiskPredictionSection data={v2.riskPrediction} />
      <PriceJustificationSection data={v2.priceJustification} askPrice={report.meta.price} />
      <FragilitySection data={v2.fragility} />
      <PriorityFixesSection data={v2.priorityFixes} />
    </div>
  );
}
