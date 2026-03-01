"use client"
export const runtime = "edge";
import { useState } from "react";
import Nav from "@/components/Nav";
import { getPdfUrl } from "@/lib/api";

type Report = any;

function getVerdictClass(verdict: string): string {
  switch (verdict) {
    case "Launch Ready": return "verdict-launch";
    case "Refine Before Scaling": return "verdict-refine";
    case "High Risk": return "verdict-high-risk";
    case "Do Not Launch": return "verdict-do-not";
    default: return "verdict-refine";
  }
}

function ScoreBar({ score, animate = true }: { score: number; animate?: boolean }) {
  return (
    <div className="score-bar-track mt-2">
      <div
        className="score-bar-fill"
        style={{ width: animate ? `${(score / 10) * 100}%` : "0%" }}
      />
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "text-red-400 border-red-800/40 bg-red-950/20",
    Medium: "text-amber-400 border-amber-800/40 bg-amber-950/20",
    Low: "text-emerald-400 border-emerald-800/40 bg-emerald-950/20",
  };
  return (
    <span className={`mono text-xs px-2 py-0.5 border rounded-sm ${colors[priority] || colors.Medium}`}>
      {priority}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    High: "text-red-400 border-red-800/40",
    Medium: "text-amber-400 border-amber-800/40",
    Low: "text-blue-400 border-blue-800/40",
  };
  return (
    <span className={`mono text-xs px-2 py-0.5 border ${colors[level] || colors.Medium}`}>
      {level} Risk
    </span>
  );
}

function PillarCard({ pillar }: { pillar: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg font-light text-parchment">{pillar.name}</span>
            </div>
            <ScoreBar score={pillar.score} />
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl text-gold font-light">{pillar.score}</p>
            <p className="mono text-xs text-parchment-muted">/10</p>
          </div>
        </div>

        {pillar.riskFlags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {pillar.riskFlags.map((rf: any, i: number) => (
              <RiskBadge key={i} level={rf.level} />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-parchment-muted">{expanded ? "Hide details" : "Show details"}</span>
          <span className={`text-gold text-xs transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-[#1a1a1a] space-y-6">
          <div className="pt-6">
            <p className="text-xs text-parchment-muted tracking-widest uppercase mb-2">Why It Matters</p>
            <p className="text-sm text-parchment-dim leading-relaxed">{pillar.whyItMatters}</p>
          </div>

          {pillar.whatYouHave.length > 0 && (
            <div>
              <p className="text-xs text-parchment-muted tracking-widest uppercase mb-3">What You Have</p>
              <ul className="space-y-1.5">
                {pillar.whatYouHave.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim">
                    <span className="text-emerald-400 shrink-0 mt-0.5">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pillar.gaps.length > 0 && (
            <div>
              <p className="text-xs text-parchment-muted tracking-widest uppercase mb-3">Gaps</p>
              <ul className="space-y-1.5">
                {pillar.gaps.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim">
                    <span className="text-amber-400 shrink-0 mt-0.5">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pillar.recommendations.length > 0 && (
            <div>
              <p className="text-xs text-parchment-muted tracking-widest uppercase mb-3">Recommendations</p>
              <div className="space-y-4">
                {pillar.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="border border-[#1a1a1a] p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm text-parchment leading-relaxed">{rec.action}</p>
                      <PriorityBadge priority={rec.priority} />
                    </div>
                    <p className="text-xs text-parchment-muted">Impact: {rec.expectedImpact}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pillar.riskFlags.length > 0 && (
            <div>
              <p className="text-xs text-parchment-muted tracking-widest uppercase mb-3">Risk Flags</p>
              <div className="space-y-3">
                {pillar.riskFlags.map((rf: any, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <RiskBadge level={rf.level} />
                    <div>
                      <p className="text-sm text-parchment">{rf.flag}</p>
                      <p className="text-xs text-parchment-muted mt-0.5">{rf.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReportClient({ report, token }: { report: Report; token: string }) {
  const [copied, setCopied] = useState(false);
  const verdictClass = getVerdictClass(report.overall.verdict);
  const pdfUrl = getPdfUrl(token);
  const reportUrl = typeof window !== "undefined"
    ? `${window.location.origin}/report/${token}`
    : `/report/${token}`;

  function copyLink() {
    navigator.clipboard.writeText(reportUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const generatedDate = new Date(report.meta.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen bg-ink text-parchment">
      <Nav />

      {/* Report header */}
      <div className="pt-24 pb-8 px-6 border-b border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="fade-up">
              <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-3">Offer Integrity Report</p>
              <h1 className="text-4xl font-light mb-2">{report.meta.offerName}</h1>
              <p className="mono text-sm text-parchment-muted">
                ${report.meta.price.toLocaleString()} · {generatedDate}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 fade-up fade-up-delay-1">
              <a
                href={pdfUrl}
                className="inline-flex items-center gap-2 border border-[#2a2a2a] text-parchment-dim px-4 py-2.5 text-xs tracking-widest uppercase hover:border-gold hover:text-parchment transition-colors"
              >
                ↓ Download PDF
              </a>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 border border-[#2a2a2a] text-parchment-dim px-4 py-2.5 text-xs tracking-widest uppercase hover:border-gold hover:text-parchment transition-colors"
              >
                {copied ? "✓ Copied" : "⌘ Copy Link"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Overall score */}
        <section className="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {/* Score */}
            <div className="bg-ink p-8 col-span-1 md:col-span-1">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">Overall Score</p>
              <p className="text-6xl text-gold font-light">{report.overall.scoreTotal}</p>
              <p className="mono text-sm text-parchment-muted mt-1">/ 70 points</p>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="mono text-xs text-parchment-muted">0</span>
                  <span className="mono text-xs text-parchment-muted">70</span>
                </div>
                <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-dim to-gold rounded-full transition-all duration-1000"
                    style={{ width: `${report.overall.scorePercent}%` }}
                  />
                </div>
                <p className="mono text-xs text-gold mt-2 text-right">{report.overall.scorePercent}%</p>
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">Verdict</p>
              <div className={`inline-flex items-center border rounded-sm px-4 py-2 ${verdictClass}`}>
                <span className="mono text-sm tracking-widest">{report.overall.verdict}</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">Pillar Summary</p>
              <div className="space-y-2">
                {report.pillars.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#1a1a1a]">
                      <div
                        className="h-full bg-gold opacity-60"
                        style={{ width: `${(p.score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="mono text-xs text-parchment-muted w-6 text-right">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top risks and strengths */}
        <section className="fade-up fade-up-delay-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-6">Top Strengths</p>
              <ul className="space-y-4">
                {report.overall.topStrengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim leading-relaxed">
                    <span className="text-emerald-400 shrink-0 mt-0.5 font-bold">+</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-6">Top Risks</p>
              <ul className="space-y-4">
                {report.overall.topRisks.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim leading-relaxed">
                    <span className="text-amber-400 shrink-0 mt-0.5 font-bold">!</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pillar cards */}
        <section className="fade-up fade-up-delay-2">
          <div className="mb-8">
            <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-2">Pillar Analysis</p>
            <h2 className="text-2xl font-light">Detailed Breakdown</h2>
          </div>
          <div className="space-y-3">
            {report.pillars.map((pillar: any) => (
              <PillarCard key={pillar.id} pillar={pillar} />
            ))}
          </div>
        </section>

        {/* Action plan */}
        <section className="fade-up fade-up-delay-3">
          <div className="mb-8">
            <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-2">30-Day Plan</p>
            <h2 className="text-2xl font-light">Prioritized Action Plan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {[
              { period: "Next 7 Days", key: "next7Days", color: "text-red-400" },
              { period: "Next 14 Days", key: "next14Days", color: "text-amber-400" },
              { period: "Next 30 Days", key: "next30Days", color: "text-emerald-400" },
            ].map(({ period, key, color }) => (
              <div key={key} className="bg-ink p-8">
                <p className={`mono text-xs tracking-widest uppercase mb-6 ${color}`}>{period}</p>
                <ul className="space-y-4">
                  {report.recommendationPlan[key].map((action: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-parchment-dim leading-relaxed">
                      <span className="mono text-xs text-parchment-muted mt-0.5 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Footer actions */}
        <section className="border-t border-[#1a1a1a] pt-12 fade-up fade-up-delay-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-parchment-dim text-sm mb-1">Bookmark or share this report</p>
              <p className="mono text-xs text-parchment-muted break-all">{reportUrl}</p>
            </div>
            <div className="flex gap-3">
              <a
                href={pdfUrl}
                className="inline-flex items-center gap-2 bg-gold text-ink px-6 py-3 text-xs tracking-widest uppercase hover:bg-gold-light transition-colors"
              >
                ↓ Download PDF
              </a>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 border border-[#2a2a2a] text-parchment-dim px-6 py-3 text-xs tracking-widest uppercase hover:border-gold hover:text-parchment transition-colors"
              >
                {copied ? "✓ Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
