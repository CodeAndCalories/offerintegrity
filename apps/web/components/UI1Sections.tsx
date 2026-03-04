"use client";

import RadarChart from "@/components/RadarChart";
import {
  computeOfferGrade,
  computePillarRanking,
  computeCloseProbMeter,
  computeExecSummary,
  type OfferGrade,
} from "@/lib/ui1Analytics";

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionDivider({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8">
      <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-2">{label}</p>
      <h2 className="text-2xl font-light">{title}</h2>
    </div>
  );
}

// ─── 1. Executive Summary Card ────────────────────────────────────────────────

function ExecutiveSummaryCard({ report }: { report: any }) {
  const summary = computeExecSummary(report);

  return (
    <section className="fade-up ui1-exec-summary">
      <SectionDivider label="Executive Summary" title="At a Glance" />
      <div className="border border-[#1a1a1a] bg-[#080808] p-8 md:p-10 space-y-4">
        {/* Eyebrow */}
        <div className="flex flex-wrap gap-3 items-center mb-2">
          <span className="mono text-xs text-gold tracking-widest uppercase">
            {report.meta.offerName}
          </span>
          <span className="mono text-xs text-parchment-muted">·</span>
          <span className="mono text-xs text-parchment-muted">
            ${report.meta.price.toLocaleString()} offer
          </span>
          <span className="mono text-xs text-parchment-muted">·</span>
          <span className="mono text-xs text-parchment-muted">
            {report.overall.scoreTotal}/70 pts
          </span>
        </div>

        {/* Summary sentences */}
        <div className="space-y-3">
          {summary.sentences.map((s, i) => (
            <p key={i} className={`leading-relaxed ${i === 0 ? "text-parchment text-base" : "text-parchment-dim text-sm"}`}>
              {s}
            </p>
          ))}
        </div>

        {/* Tags */}
        <div className="pt-2 flex flex-wrap gap-3">
          <span className="mono text-xs px-3 py-1 border border-emerald-800/40 bg-emerald-950/20 text-emerald-400">
            ↑ {summary.topStrengthPillar}
          </span>
          <span className="mono text-xs px-3 py-1 border border-amber-800/40 bg-amber-950/20 text-amber-400">
            ↓ {summary.topRiskPillar}
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── 2. Grade Badge ───────────────────────────────────────────────────────────

const GRADE_STYLES: Record<string, { border: string; text: string; bg: string }> = {
  emerald: {
    border: "border-emerald-700/50",
    text:   "text-emerald-400",
    bg:     "bg-emerald-950/20",
  },
  gold: {
    border: "border-gold/40",
    text:   "text-gold",
    bg:     "bg-gold/5",
  },
  amber: {
    border: "border-amber-700/50",
    text:   "text-amber-400",
    bg:     "bg-amber-950/20",
  },
  red: {
    border: "border-red-700/50",
    text:   "text-red-400",
    bg:     "bg-red-950/20",
  },
};

function GradeBadge({ grade }: { grade: OfferGrade }) {
  const s = GRADE_STYLES[grade.color];
  return (
    <div className={`inline-flex flex-col items-center border ${s.border} ${s.bg} px-6 py-4 rounded-sm`}>
      <span className={`text-5xl font-light leading-none ${s.text}`} style={{ fontVariantNumeric: "tabular-nums" }}>
        {grade.label}
      </span>
      <span className="mono text-xs text-parchment-muted mt-2 tracking-widest uppercase">
        Offer Grade
      </span>
      <span className={`text-xs mt-1 ${s.text} opacity-80`}>{grade.tagline}</span>
    </div>
  );
}

// ─── 3. Close Probability Meter ───────────────────────────────────────────────

const CONF_STYLES: Record<string, { text: string; bar: string; border: string }> = {
  High:     { text: "text-emerald-400", bar: "bg-emerald-500",  border: "border-emerald-800/40" },
  Moderate: { text: "text-amber-400",   bar: "bg-amber-500",    border: "border-amber-800/40" },
  Low:      { text: "text-red-400",     bar: "bg-red-500",      border: "border-red-800/40" },
};

function CloseProbabilityMeter({ report }: { report: any }) {
  const meter = computeCloseProbMeter(report);
  const conf = CONF_STYLES[meter.confidence];
  // Meter fill: midpoint / 50 * 100 (50% = max reasonable close rate for premium offers)
  const fillPct = Math.min(100, Math.round((meter.midpoint / 50) * 100));

  return (
    <div className="border border-[#1a1a1a] bg-ink p-8 space-y-6 ui1-close-meter">
      <div>
        <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-1">
          Est. Close Probability
        </p>
        <div className="flex items-end gap-3 mt-2">
          <span className="text-4xl font-light text-parchment">{meter.rangeLabel}</span>
          <span className={`mono text-xs px-2 py-0.5 border rounded-sm mb-1 ${conf.border} ${conf.text}`}>
            {meter.confidence} Confidence
          </span>
        </div>
      </div>

      {/* Meter bar */}
      <div>
        <div className="flex justify-between mono text-xs text-parchment-muted mb-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%+</span>
        </div>
        <div className="h-2.5 bg-[#111] border border-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${conf.bar} opacity-70`}
            style={{ width: `${fillPct}%` }}
          />
        </div>
        {/* tick marks */}
        <div className="relative h-1 mt-0.5">
          <div className="absolute left-1/2 w-px h-1 bg-[#333]" />
        </div>
      </div>

      <p className="text-xs text-parchment-dim leading-relaxed">{meter.summary}</p>
    </div>
  );
}

// ─── 4. Radar Chart Section ───────────────────────────────────────────────────

function PillarRadarSection({ report }: { report: any }) {
  const data = report.pillars.map((p: any) => ({
    label: p.name,
    value: p.score,
    max: 10,
  }));

  return (
    <div className="border border-[#1a1a1a] bg-ink p-8 ui1-radar">
      <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-6">
        Pillar Radar
      </p>
      <div className="flex justify-center" style={{ maxWidth: 300, margin: "0 auto" }}>
        <RadarChart data={data} size={300} />
      </div>
    </div>
  );
}

// ─── 5. Pillar Ranking ────────────────────────────────────────────────────────

function PillarRankingSection({ report }: { report: any }) {
  const ranking = computePillarRanking(report.pillars);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a] ui1-pillar-ranking">
      {/* Strongest */}
      <div className="bg-ink p-8">
        <p className="mono text-xs text-emerald-400 tracking-widest uppercase mb-5">
          ↑ Strongest Areas
        </p>
        <div className="space-y-4">
          {ranking.strongest.map((p, i) => (
            <div key={p.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-parchment flex items-center gap-2">
                  <span className="mono text-xs text-parchment-muted">{i + 1}</span>
                  {p.name}
                </span>
                <span className="mono text-xs text-emerald-400">{p.score}/10</span>
              </div>
              <div className="h-1 bg-[#111] rounded-full">
                <div
                  className="h-full rounded-full bg-emerald-600 opacity-60"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weakest */}
      <div className="bg-ink p-8">
        <p className="mono text-xs text-amber-400 tracking-widest uppercase mb-5">
          ↓ Weakest Areas
        </p>
        <div className="space-y-4">
          {ranking.weakest.map((p, i) => (
            <div key={p.name}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-parchment flex items-center gap-2">
                  <span className="mono text-xs text-parchment-muted">{i + 1}</span>
                  {p.name}
                </span>
                <span className="mono text-xs text-amber-400">{p.score}/10</span>
              </div>
              <div className="h-1 bg-[#111] rounded-full">
                <div
                  className="h-full rounded-full bg-amber-600 opacity-60"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Composite UI1Sections export ─────────────────────────────────────────────

export default function UI1Sections({ report }: { report: any }) {
  const grade = computeOfferGrade(report.overall.scorePercent);

  return (
    <>
      {/* 1. Executive Summary */}
      <ExecutiveSummaryCard report={report} />

      {/* 2+3. Grade + Close Probability side-by-side */}
      <section className="fade-up fade-up-delay-1">
        <SectionDivider label="Offer Snapshot" title="Grade &amp; Close Probability" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
          {/* Grade */}
          <div className="bg-ink p-8 flex flex-col justify-between gap-6">
            <div>
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-6">
                Offer Strength Grade
              </p>
              <GradeBadge grade={grade} />
            </div>
            <div className="border-t border-[#1a1a1a] pt-4">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-2">
                Score Breakdown
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-gold">
                  {report.overall.scoreTotal}
                </span>
                <span className="mono text-sm text-parchment-muted">/ 70 pts</span>
                <span className="mono text-xs text-parchment-muted ml-2">
                  ({report.overall.scorePercent}%)
                </span>
              </div>
            </div>
          </div>

          {/* Close Probability Meter */}
          <CloseProbabilityMeter report={report} />
        </div>
      </section>

      {/* 4+5. Radar + Pillar Ranking */}
      <section className="fade-up fade-up-delay-2">
        <SectionDivider label="Pillar Intelligence" title="Radar &amp; Rankings" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
          <PillarRadarSection report={report} />
          <PillarRankingSection report={report} />
        </div>
      </section>
    </>
  );
}
