export const runtime = "edge";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function HowItWorks() {
  const pillars = [
    {
      id: "01",
      name: "Problem Severity & Cost of Inaction",
      desc: "High-ticket buyers don't buy solutions — they escape pain. We evaluate how acute your problem framing is and whether the cost of doing nothing is quantified compellingly enough to create urgency.",
      signals: ["Pain is specific and measurable", "Inaction has a quantified cost", "Urgency trigger is defined"],
    },
    {
      id: "02",
      name: "Buyer Readiness & Purchasing Power",
      desc: "Even a perfect offer fails when sold to the wrong buyer. We assess whether your ICP has the authority to say yes, the budget to pay, and the intent to act now.",
      signals: ["Decision-maker is clearly defined", "Budget range aligns with price", "Stage triggers indicate in-market buyers"],
    },
    {
      id: "03",
      name: "Outcome Specificity & Tangibility",
      desc: "Vague outcomes create buyer hesitation. We evaluate whether your promised result is specific, time-bound, and believable enough to justify the investment.",
      signals: ["Result is measurable", "Timeline is defined", "Outcome is tied to their current situation"],
    },
    {
      id: "04",
      name: "Differentiation & Competitive Edge",
      desc: "At high prices, buyers comparison-shop. We assess how defensible your position is against alternatives and whether your unique mechanism is named and owned.",
      signals: ["Unique mechanism is named", "Alternatives are addressed", "Why you is clearly articulated"],
    },
    {
      id: "05",
      name: "Proof & Credibility Assets",
      desc: "High-ticket purchases require trust before the sale. We evaluate the strength, specificity, and relevance of your proof assets relative to your price point.",
      signals: ["Metric-based case studies exist", "Social proof is relevant to ICP", "Proof is proportional to price"],
    },
    {
      id: "06",
      name: "Delivery Feasibility & Capacity",
      desc: "Overselling capacity kills businesses. We assess whether your time commitment and delivery process are sustainable at your target client load.",
      signals: ["Delivery is documented", "Capacity matches sales targets", "Dependencies are managed"],
    },
    {
      id: "07",
      name: "Offer Structure & Value Justification",
      desc: "Buyers must feel they're getting 10x value before they're willing to pay. We evaluate whether your offer structure makes the price feel like a bargain.",
      signals: ["Value stack itemized", "Price-to-value ratio is strong", "Format matches buyer expectations"],
    },
  ];

  return (
    <main className="min-h-screen bg-ink text-parchment">
      <Nav />

      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-6 fade-up">The Framework</p>
        <h1 className="text-4xl md:text-6xl font-light mb-8 fade-up fade-up-delay-1">
          How OfferIntegrity
          <br />
          <em className="not-italic text-parchment-dim">evaluates your offer</em>
        </h1>
        <p className="text-lg text-parchment-dim max-w-xl mb-16 leading-relaxed fade-up fade-up-delay-2">
          A structured, AI-assisted analysis across 7 pillars that every successful high-ticket offer must satisfy. Not opinions — a repeatable framework.
        </p>

        {/* Process */}
        <div className="mb-24">
          <h2 className="text-2xl font-light mb-12 text-parchment">The Process</h2>
          <div className="space-y-0">
            {[
              { step: "01", title: "Complete the Assessment", desc: "A 7-step structured intake form covering your offer, buyer, problem, proof, delivery, and launch plan. Takes 10–15 minutes." },
              { step: "02", title: "Secure Payment", desc: "One-time $49 payment via Stripe. Your intake data is held securely until payment is confirmed." },
              { step: "03", title: "Report Generated", desc: "Our AI analyzes your intake across all 7 pillars and produces a structured JSON report. This happens once, then is stored." },
              { step: "04", title: "Instant Access", desc: "View your report immediately after payment. No waiting. The report is also emailed to you with a permanent link and PDF." },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-8 py-8 border-b border-[#1a1a1a]">
                <p className="mono text-xs text-parchment-muted pt-1 w-6 shrink-0">{item.step}</p>
                <div>
                  <h3 className="text-lg font-light text-parchment mb-2">{item.title}</h3>
                  <p className="text-sm text-parchment-dim leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pillars */}
        <h2 className="text-2xl font-light mb-12">The 7 Pillars</h2>
        <div className="space-y-12">
          {pillars.map((p) => (
            <div key={p.id} className="border border-[#1a1a1a] p-8 hover:border-[#2a2a2a] transition-colors">
              <div className="flex items-start gap-6 mb-4">
                <span className="mono text-xs text-parchment-muted pt-1">{p.id}</span>
                <h3 className="text-xl font-light text-parchment">{p.name}</h3>
              </div>
              <p className="text-sm text-parchment-dim leading-relaxed mb-6 pl-10">{p.desc}</p>
              <div className="pl-10 flex flex-wrap gap-3">
                {p.signals.map((s) => (
                  <span key={s} className="text-xs text-parchment-muted border border-[#222] px-3 py-1.5 mono">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link
            href="/start"
            className="inline-flex items-center gap-3 bg-gold text-ink px-10 py-4 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
          >
            Start Your Validation — $49
          </Link>
        </div>
      </div>
    </main>
  );
}
