"use client";

import { computeV25Analytics, CompetitorEntry, V25Analytics } from "@/lib/v25Analytics";

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-2">{label}</p>
      <h2 className="text-2xl font-light">{title}</h2>
    </div>
  );
}

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

function Ring({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#1a1a1a" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={r} fill="none"
          stroke="currentColor" strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={color}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-light text-parchment mono">{value}</span>
    </div>
  );
}

function FlagRow({ text, severity }: { text: string; severity: "High" | "Medium" | "Low" }) {
  const color = severity === "High" ? "text-red-400" : severity === "Medium" ? "text-amber-400" : "text-blue-400";
  const dot   = severity === "High" ? "bg-red-500"   : severity === "Medium" ? "bg-amber-500"   : "bg-blue-500";
  return (
    <li className="flex items-start gap-3 text-sm text-parchment-dim leading-relaxed py-2 border-b border-[#1a1a1a] last:border-0">
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      <span>{text}</span>
      <span className={`mono text-xs shrink-0 ml-auto mt-0.5 ${color}`}>{severity}</span>
    </li>
  );
}

// ─── Saturation Section ───────────────────────────────────────────────────────

function SaturationSection({ data }: { data: V25Analytics["marketSaturation"] }) {
  const levelColor: Record<string, BadgeColor> = { Low: "emerald", Medium: "amber", High: "red" };
  const barColor   = data.level === "High" ? "bg-red-500" : data.level === "Medium" ? "bg-amber-500" : "bg-emerald-500";

  return (
    <section className="fade-up">
      <SectionHeader label="V2.5 Market Intelligence" title="Market Saturation Signal" />
      <div className="border border-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
          {/* Level */}
          <div className="bg-ink p-8 flex flex-col gap-4">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase">Saturation Level</p>
            <div className="flex items-center gap-4">
              <Badge text={data.level} color={levelColor[data.level]} />
              {data.competitorCount > 0 && (
                <span className="text-xs text-parchment-muted mono">
                  {data.competitorCount} competitor{data.competitorCount !== 1 ? "s" : ""} analyzed
                </span>
              )}
            </div>
            <p className="text-sm text-parchment-dim leading-relaxed">{data.summary}</p>
          </div>

          {/* Overlap metrics */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-6">Overlap Metrics</p>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs text-parchment-dim mb-1">
                  <span>Price Tier Overlap</span>
                  <span className="mono">{data.priceTierOverlap}%</span>
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${data.priceTierOverlap}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-parchment-dim mb-1">
                  <span>Promise Similarity</span>
                  <span className="mono">{data.promiseSimilarity}%</span>
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full">
                  <div className={`h-full rounded-full ${barColor}`} style={{ width: `${data.promiseSimilarity}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Signals */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">Market Signals</p>
            <ul className="space-y-3">
              {data.signals.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim leading-relaxed">
                  <span className="text-gold shrink-0 mono text-xs mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Differentiation Gap Section ─────────────────────────────────────────────

function DifferentiationSection({ data }: { data: V25Analytics["differentiationGap"] }) {
  const clarityColor: Record<string, BadgeColor> = { Strong: "emerald", Moderate: "amber", Weak: "red" };
  const ringColor = data.clarityLabel === "Strong" ? "text-emerald-400" : data.clarityLabel === "Moderate" ? "text-amber-400" : "text-red-400";

  return (
    <section className="fade-up">
      <SectionHeader label="V2.5 Market Intelligence" title="Differentiation Gap Analyzer" />
      <div className="border border-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
          {/* Score + recommendation */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-6">Differentiation Clarity</p>
            <div className="flex items-center gap-6 mb-6">
              <Ring value={data.clarityScore} max={100} color={ringColor} />
              <div>
                <Badge text={data.clarityLabel} color={clarityColor[data.clarityLabel]} />
                <p className="text-xs text-parchment-muted mono mt-2">{data.clarityScore}/100 clarity score</p>
              </div>
            </div>
            <p className="text-sm text-parchment-dim leading-relaxed border-l-2 border-gold/30 pl-4">
              {data.recommendation}
            </p>
          </div>

          {/* Warnings + Strengths */}
          <div className="bg-ink p-8">
            {data.warnings.length > 0 && (
              <>
                <p className="mono text-xs text-red-400 tracking-widest uppercase mb-3">Warnings</p>
                <ul className="space-y-2 mb-6">
                  {data.warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-parchment-dim leading-relaxed">
                      <span className="text-red-400 shrink-0 mt-0.5">!</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {data.strengths.length > 0 && (
              <>
                <p className="mono text-xs text-emerald-400 tracking-widest uppercase mb-3">Strengths</p>
                <ul className="space-y-2">
                  {data.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-parchment-dim leading-relaxed">
                      <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Offer Confidence Section ─────────────────────────────────────────────────

function OfferConfidenceSection({ data }: { data: V25Analytics["offerConfidence"] }) {
  const levelColor: Record<string, BadgeColor> = { High: "emerald", Medium: "amber", Low: "red" };
  const ringColor  = data.level === "High" ? "text-emerald-400" : data.level === "Medium" ? "text-amber-400" : "text-red-400";
  const contribIcon = (c: "positive" | "negative" | "neutral") =>
    c === "positive" ? <span className="text-emerald-400">↑</span> :
    c === "negative" ? <span className="text-red-400">↓</span> :
    <span className="text-parchment-muted">→</span>;

  return (
    <section className="fade-up">
      <SectionHeader label="V2.5 Market Intelligence" title="Offer Confidence Score" />
      <div className="border border-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
          {/* Score */}
          <div className="bg-ink p-8 flex flex-col gap-5">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase">Confidence</p>
            <div className="flex items-center gap-5">
              <Ring value={data.score} max={100} color={ringColor} />
              <div>
                <Badge text={data.level} color={levelColor[data.level]} />
                <p className="text-xs text-parchment-muted mono mt-2">{data.score}/100</p>
              </div>
            </div>
            <p className="text-sm text-parchment-dim leading-relaxed">{data.explanation}</p>
          </div>

          {/* Driver list — spans 2 cols */}
          <div className="bg-ink p-8 md:col-span-2">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-5">Confidence Drivers</p>
            <div className="space-y-4">
              {data.drivers.map((d, i) => (
                <div key={i} className="border-b border-[#1a1a1a] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    {contribIcon(d.contribution)}
                    <p className="text-sm font-light text-parchment">{d.label}</p>
                  </div>
                  <p className="text-xs text-parchment-dim leading-relaxed pl-5">{d.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mechanism Clarity Section ────────────────────────────────────────────────

function MechanismClaritySection({ data }: { data: V25Analytics["mechanismClarity"] }) {
  const ratingColor: Record<string, BadgeColor> = { Clear: "emerald", Vague: "amber", Generic: "red" };

  return (
    <section className="fade-up">
      <SectionHeader label="V2.5 Market Intelligence" title="Mechanism Clarity Detector" />
      <div className="border border-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
          {/* Rating + fix */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-5">Clarity Rating</p>
            <div className="flex items-center gap-4 mb-6">
              <Badge text={data.clarityRating} color={ratingColor[data.clarityRating]} />
              <span className={`mono text-xs ${data.hasNamedMechanism ? "text-emerald-400" : "text-red-400"}`}>
                {data.hasNamedMechanism ? "✓ Named mechanism detected" : "✗ No named mechanism"}
              </span>
            </div>
            <div className="border-l-2 border-gold/30 pl-4">
              <p className="mono text-xs text-gold tracking-widest uppercase mb-2">Suggested Fix</p>
              <p className="text-sm text-parchment-dim leading-relaxed">{data.suggestedFix}</p>
            </div>
          </div>

          {/* Flags */}
          <div className="bg-ink p-8">
            <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">
              Risk Flags
              {data.flags.length > 0 && (
                <span className="ml-2 text-parchment-muted normal-case">({data.flags.length} detected)</span>
              )}
            </p>
            {data.flags.length === 0 ? (
              <p className="text-sm text-emerald-400">No mechanism risk flags detected.</p>
            ) : (
              <ul>
                {data.flags.map((f, i) => (
                  <FlagRow key={i} text={f.description} severity={f.severity} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Public: V25Sections wrapper ─────────────────────────────────────────────

export default function V25Sections({
  report,
  competitors = [],
}: {
  report: any;
  competitors?: CompetitorEntry[];
}) {
  if (!report) return null;

  const v25 = computeV25Analytics(report, competitors);

  return (
    <div className="space-y-24">
      <SaturationSection    data={v25.marketSaturation}   />
      <DifferentiationSection data={v25.differentiationGap} />
      <OfferConfidenceSection data={v25.offerConfidence}    />
      <MechanismClaritySection data={v25.mechanismClarity}  />
    </div>
  );
}
