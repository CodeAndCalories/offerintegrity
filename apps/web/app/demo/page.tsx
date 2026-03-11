import Link from "next/link";
import Nav from "@/components/Nav";
import ScoreMeter from "@/components/ScoreMeter";
import WhyThisMatters from "@/components/WhyThisMatters";
import PrintButton from "@/components/PrintButton";

export const metadata = {
  title: "Sample Report — OfferIntegrity",
  description: "See what a real Offer Integrity validation report looks like.",
};

const MOCK = {
  meta: {
    offerName: "Scale Ready Consulting Accelerator",
    price: 8500,
    generatedAt: "2025-03-01T00:00:00Z",
  },
  overall: {
    scoreTotal: 48,
    scorePercent: 69,
    verdict: "Refine Before Scaling",
    topStrengths: [
      "Clear, painful problem statement that resonates with experienced operators",
      "Strong outcome specificity — timeline and result are concrete",
      "Delivery model is proven and repeatable at current capacity",
    ],
    topRisks: [
      "Buyer readiness signals are weak — ICP often lacks authority or budget cycle alignment",
      "Differentiation is thin against established alternatives at this price point",
      "Proof assets are insufficient to justify $8,500 without a discovery call",
    ],
  },
  pillars: [
    {
      id: "problem-severity",
      name: "Problem Severity",
      score: 8,
      whyItMatters:
        "Buyers act when the pain of staying still outweighs the cost of change. A clearly articulated problem frames your offer as a necessity, not a luxury.",
      whatYouHave: ["Pain is specific and measurable — 'losing 60% of revenue to churn'", "Inaction cost is quantified"],
      gaps: ["Urgency framing is missing in positioning copy"],
      recommendations: [
        { action: "Add a 'cost of delay' calculation to your landing page", priority: "Medium", expectedImpact: "Increases perceived urgency" },
      ],
      riskFlags: [],
      whyMattersExpander: [
        "Buyers in the $5k–$20k range are loss-averse — framing around what they lose beats framing around what they gain.",
        "Problem severity sets the ceiling on what buyers will pay — the more painful, the higher the threshold.",
        "Specificity matters: 'I help consultants grow' is generic; 'I help consultants hit $30k months in 90 days' is a problem statement.",
        "Without quantified pain, buyers default to 'let me think about it' — which usually means no.",
        "Your problem statement should make your ideal client feel seen before they read another word.",
      ],
    },
    {
      id: "buyer-readiness",
      name: "Buyer Readiness",
      score: 5,
      whyItMatters:
        "The best offer in the world fails if your ICP can't buy it now. Readiness covers budget, authority, and timing alignment.",
      whatYouHave: ["Target ICP has consistent budget signals"],
      gaps: [
        "No qualification mechanism to filter for decision-makers",
        "No urgency trigger tied to buyer timing",
      ],
      recommendations: [
        { action: "Add a qualifier question to intake form: 'Are you the final decision-maker?'", priority: "High", expectedImpact: "Improves close rate by filtering tire-kickers" },
        { action: "Build a 'right for you if...' section into sales page", priority: "Medium", expectedImpact: "Pre-qualifies before discovery call" },
      ],
      riskFlags: [{ level: "High", flag: "No decision-maker filter", reason: "Without this, you'll spend discovery calls with buyers who can't say yes" }],
      whyMattersExpander: [
        "High-ticket sales stall most often because the person on the call can't buy — they need to 'check with someone'.",
        "Budget authority and timing are the three legs of BANT — miss one and the deal collapses.",
        "Adding friction (qualification) early increases close rate — the right buyers appreciate the selectivity.",
        "Urgency must be real or constructed — a cohort close date, price increase, or capped availability all work.",
        "At $8k+, expect a 7–14 day decision cycle unless you've created urgency.",
      ],
    },
    {
      id: "outcome-specificity",
      name: "Outcome Specificity",
      score: 8,
      whyItMatters:
        "Vague promises create vague buying decisions. A specific, time-bound outcome gives buyers a mental finish line to buy toward.",
      whatYouHave: ["Outcome is time-bound: '90-day'", "Result is quantifiable: 'consistent $30k months'"],
      gaps: ["Secondary outcomes (client quality, freedom, etc.) are undefined"],
      recommendations: [
        { action: "Add 1–2 secondary outcomes to give buyers a fuller picture of post-purchase life", priority: "Low", expectedImpact: "Strengthens emotional case for buying" },
      ],
      riskFlags: [],
      whyMattersExpander: [
        "Buyers don't buy your process — they buy the outcome on the other side of your process.",
        "A time-bound promise (90 days, 6 weeks) creates a mental deadline that reduces buyer anxiety.",
        "The more specific the result, the easier it is for buyers to picture themselves achieving it.",
        "Vague outcomes attract vague buyers — specificity self-selects for serious candidates.",
        "Secondary outcomes (lifestyle, status, relationships) often close the emotional gap when the primary outcome is rational.",
      ],
    },
    {
      id: "differentiation",
      name: "Differentiation",
      score: 5,
      whyItMatters:
        "At $8k+, buyers are evaluating you against alternatives. If you can't articulate why you're different, they'll choose the safest or cheapest option.",
      whatYouHave: ["Proprietary framework name is in place"],
      gaps: [
        "No clear 'why us vs. alternatives' articulated on sales page",
        "Mechanism of differentiation not explained",
      ],
      recommendations: [
        { action: "Add a 'Why this works differently' section explaining your unique mechanism", priority: "High", expectedImpact: "Reduces comparison shopping" },
      ],
      riskFlags: [{ level: "Medium", flag: "Thin differentiation narrative", reason: "Buyers at this price point will comparison shop — give them a reason to stop" }],
      whyMattersExpander: [
        "Differentiation isn't 'we care more' — it's a structural reason why your approach produces better results.",
        "A named methodology (e.g. 'The 5-Step Revenue Architecture') elevates perception and reduces commoditization.",
        "Buyers use differentiation as permission to choose you — they need a story to tell themselves (and others).",
        "At $8k, your biggest competitor is inaction — differentiation needs to address why your offer beats doing nothing.",
        "Specificity in your mechanism ('we do X, not Y, because Z') builds trust faster than generic claims.",
      ],
    },
    {
      id: "proof-credibility",
      name: "Proof & Credibility",
      score: 6,
      whyItMatters:
        "High-ticket buyers are risk-averse. Social proof and credentials reduce perceived risk and shorten the decision timeline.",
      whatYouHave: ["2–3 strong testimonials in place", "Founder story is present"],
      gaps: ["No case studies with quantified ROI", "No before/after narrative"],
      recommendations: [
        { action: "Document 1 case study with revenue numbers and timeline", priority: "High", expectedImpact: "Single biggest credibility lever at this price point" },
      ],
      riskFlags: [{ level: "Medium", flag: "Proof is thin relative to price", reason: "$8,500 requires heavier proof assets than generic testimonials" }],
      whyMattersExpander: [
        "A single well-documented case study with ROI numbers outperforms 10 generic testimonials.",
        "Before/after narratives activate the buyer's imagination — they picture themselves in the 'after'.",
        "Risk transfer (guarantees, case studies) lets buyers commit without feeling like they're gambling.",
        "Credibility markers (logos, press, credentials) reduce 'who are you?' friction for cold audiences.",
        "Specificity in social proof ('she went from $8k to $28k in 11 weeks') is far more compelling than vague praise.",
      ],
    },
    {
      id: "delivery-feasibility",
      name: "Delivery Feasibility",
      score: 8,
      whyItMatters:
        "A great sale followed by a poor delivery destroys referral pipelines. Feasibility scoring ensures you're not over-promising capacity.",
      whatYouHave: ["Delivery model is documented", "Current capacity handles 5 clients per cohort"],
      gaps: ["No stated onboarding SLA creates expectation gaps"],
      recommendations: [
        { action: "Add 'What happens after you join' section to set delivery expectations", priority: "Low", expectedImpact: "Reduces buyer anxiety and post-purchase regret" },
      ],
      riskFlags: [],
      whyMattersExpander: [
        "High-ticket offers live or die on word-of-mouth — delivery quality is the product that generates referrals.",
        "Over-promising at the sales stage creates delivery debt you'll pay back in refunds and churn.",
        "A clear onboarding sequence (within 48 hours of payment) dramatically reduces buyer's remorse.",
        "Capacity constraints, when communicated honestly, create scarcity — which drives urgency.",
        "Delivery feasibility also protects you: a model you can execute consistently compounds your reputation.",
      ],
    },
    {
      id: "value-justification",
      name: "Value Justification",
      score: 8,
      whyItMatters:
        "Buyers justify the price to themselves and to others. Your job is to make that calculation obvious, not implied.",
      whatYouHave: ["ROI framing is present in copy ('10x the investment in 90 days')", "Price anchoring against alternatives is in place"],
      gaps: ["No explicit value stack showing what's included"],
      recommendations: [
        { action: "Add a visual value stack showing what $8,500 gets them (module by module)", priority: "Medium", expectedImpact: "Reduces price objection surface area" },
      ],
      riskFlags: [],
      whyMattersExpander: [
        "Buyers don't evaluate price in isolation — they evaluate it against perceived value and alternatives.",
        "A value stack (what you get for $X) shifts focus from cost to investment.",
        "ROI framing ('this generates $30k in 90 days') makes the price feel like a transaction, not an expense.",
        "Anchoring against more expensive alternatives ('coaching elsewhere costs $20k') reframes your offer as a deal.",
        "Price confidence in your copy signals confidence in your delivery — hesitation on price creates hesitation in buyers.",
      ],
    },
  ],
  recommendationPlan: {
    next7Days: [
      "Add a 'decision-maker' qualifier question to your intake form",
      "Write one quantified case study with a before/after revenue narrative",
      "Draft a 'Why this works differently' section explaining your mechanism",
    ],
    next14Days: [
      "Rebuild your proof section around the new case study",
      "Add cost-of-delay calculation to your landing page hero section",
      "Create a 'What happens after you join' onboarding overview",
    ],
    next30Days: [
      "Add a visual value stack to your sales page",
      "Test a cohort-close deadline to create urgency trigger",
      "Add 1–2 secondary outcomes to strengthen emotional buy-in",
    ],
  },
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="score-bar-track mt-2">
      <div className="score-bar-fill" style={{ width: `${(score / 10) * 100}%` }} />
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

function DemoPillarCard({ pillar }: { pillar: (typeof MOCK.pillars)[0] }) {
  // Server-rendered static open state — first 2 pillars expanded for demo
  return (
    <details className="border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors group" open={pillar.id === "buyer-readiness"}>
      <summary className="w-full text-left p-6 cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className="text-lg font-light text-parchment">{pillar.name}</span>
            <ScoreBar score={pillar.score} />
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl text-gold font-light">{pillar.score}</p>
            <p className="mono text-xs text-parchment-muted">/10</p>
          </div>
        </div>
        {pillar.riskFlags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {pillar.riskFlags.map((rf, i) => (
              <RiskBadge key={i} level={rf.level} />
            ))}
          </div>
        )}
        <p className="text-xs text-parchment-muted mt-3">Click to expand ▾</p>
      </summary>

      <div className="px-6 pb-6 border-t border-[#1a1a1a] space-y-6">
        <div className="pt-6">
          <p className="text-xs text-parchment-muted tracking-widest uppercase mb-2">Why It Matters</p>
          <p className="text-sm text-parchment-dim leading-relaxed">{pillar.whyItMatters}</p>
        </div>

        {pillar.whatYouHave.length > 0 && (
          <div>
            <p className="text-xs text-parchment-muted tracking-widest uppercase mb-3">What You Have</p>
            <ul className="space-y-1.5">
              {pillar.whatYouHave.map((item, i) => (
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
              {pillar.gaps.map((item, i) => (
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
              {pillar.recommendations.map((rec, i) => (
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
              {pillar.riskFlags.map((rf, i) => (
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

        <WhyThisMatters bullets={pillar.whyMattersExpander} />
      </div>
    </details>
  );
}

export default function DemoPage() {
  const report = MOCK;

  return (
    <main className="min-h-screen bg-ink text-parchment">
      <Nav />

      {/* Demo banner */}
      <div className="bg-[#0f0e0c] border-b border-[#2a2a2a] py-3 px-6 text-center print:hidden">
        <p className="mono text-xs text-gold tracking-widest">
          SAMPLE REPORT — Static mock data for illustration purposes.{" "}
          <Link href="/start" className="underline underline-offset-2 hover:text-gold-light transition-colors">
            Validate your own offer →
          </Link>
        </p>
      </div>

      {/* Report header */}
      <div className="pt-16 pb-8 px-6 border-b border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="fade-up">
              <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-3">Offer Integrity Report</p>
              <h1 className="text-4xl font-light mb-2">{report.meta.offerName}</h1>
              <p className="mono text-sm text-parchment-muted">
                ${report.meta.price.toLocaleString()} · Sample — March 2025
              </p>
            </div>
            <div className="fade-up fade-up-delay-1 print:hidden">
              <PrintButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Overall score */}
        <section className="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {/* Score */}
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">Overall Score</p>
              <p className="text-6xl text-gold font-light">{report.overall.scoreTotal}</p>
              <p className="mono text-sm text-parchment-muted mt-1">/ 70 points</p>
              <div className="mt-6">
                <ScoreMeter score={report.overall.scorePercent} size="lg" showLabel={true} />
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">Verdict</p>
              <div className="inline-flex items-center border rounded-sm px-4 py-2 verdict-refine">
                <span className="mono text-sm tracking-widest">{report.overall.verdict}</span>
              </div>
              <p className="text-xs text-parchment-muted mt-4 leading-relaxed">
                Strong foundation with key gaps in buyer qualification and differentiation. Refine before investing in paid acquisition.
              </p>
            </div>

            {/* Pillar summary */}
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-4">Pillar Summary</p>
              <div className="space-y-2">
                {report.pillars.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#1a1a1a]">
                      <div className="h-full bg-gold opacity-60" style={{ width: `${(p.score / 10) * 100}%` }} />
                    </div>
                    <span className="mono text-xs text-parchment-muted w-6 text-right">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Top strengths & risks */}
        <section className="fade-up fade-up-delay-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
            <div className="bg-ink p-8">
              <p className="mono text-xs text-parchment-muted tracking-widest uppercase mb-6">Top Strengths</p>
              <ul className="space-y-4">
                {report.overall.topStrengths.map((s, i) => (
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
                {report.overall.topRisks.map((r, i) => (
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
            {report.pillars.map((pillar) => (
              <DemoPillarCard key={pillar.id} pillar={pillar} />
            ))}
          </div>
        </section>

        {/* 30-day plan */}
        <section className="fade-up fade-up-delay-3">
          <div className="mb-8">
            <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-2">30-Day Plan</p>
            <h2 className="text-2xl font-light">Prioritized Action Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {[
              { period: "Next 7 Days", key: "next7Days" as const, color: "text-red-400" },
              { period: "Next 14 Days", key: "next14Days" as const, color: "text-amber-400" },
              { period: "Next 30 Days", key: "next30Days" as const, color: "text-emerald-400" },
            ].map(({ period, key, color }) => (
              <div key={key} className="bg-ink p-8">
                <p className={`mono text-xs tracking-widest uppercase mb-6 ${color}`}>{period}</p>
                <ul className="space-y-4">
                  {report.recommendationPlan[key].map((action, i) => (
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

        {/* CTA */}
        <section className="border-t border-[#1a1a1a] pt-12 fade-up fade-up-delay-4 print:hidden">
          <div className="text-center">
            <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">This is a sample</p>
            <h2 className="text-3xl font-light mb-4">Get your own offer scored</h2>
            <p className="text-parchment-dim mb-8 max-w-md mx-auto">
              Your real report uses AI analysis of your specific offer — priced, positioned, and benchmarked across all 7 pillars.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-3 bg-gold text-ink px-10 py-4 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
            >
              Validate My Offer — $39 →
            </Link>
            <p className="mt-4 text-xs text-parchment-muted">Instant access. One-time. No subscription.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
