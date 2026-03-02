export const runtime = "edge";
import Link from "next/link";
import Nav from "@/components/Nav";

export default function Home() {
  const pillars = [
    { n: "01", name: "Problem Severity", desc: "How painful is the problem, and what does inaction cost?" },
    { n: "02", name: "Buyer Readiness", desc: "Can your ICP buy now, and do they have the authority?" },
    { n: "03", name: "Outcome Specificity", desc: "Is the promised result tangible and time-bound?" },
    { n: "04", name: "Differentiation", desc: "What makes this unforgettable against alternatives?" },
    { n: "05", name: "Proof & Credibility", desc: "Can you substantiate the outcome before the sale?" },
    { n: "06", name: "Delivery Feasibility", desc: "Can you deliver consistently at your target capacity?" },
    { n: "07", name: "Value Justification", desc: "Does the perceived value justify the price?" },
  ];

  return (
    <main className="min-h-screen bg-ink text-parchment">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="fade-up">
          <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-8">
            High Ticket Offer Validation
          </p>
          <h1 className="text-5xl md:text-7xl font-light leading-[1.1] mb-8 text-parchment">
            Know if your offer
            <br />
            <em className="text-gold not-italic">will actually sell</em>
            <br />
            before you launch.
          </h1>
          <p className="text-lg text-parchment-dim max-w-xl mb-12 leading-relaxed">
            A structured 7-pillar validation report for founders and consultants
            building high-ticket programs. Stop guessing. Start with clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/start"
              className="inline-flex items-center gap-3 bg-gold text-ink px-8 py-4 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
            >
              Validate My Offer
              <span>→</span>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-3 border border-[#2a2a2a] text-parchment-dim px-8 py-4 text-sm tracking-widest uppercase hover:border-gold hover:text-parchment transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>

        {/* Price signal */}
        <div className="mt-16 pt-16 border-t border-[#1a1a1a]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div>
              <p className="mono text-4xl text-gold">$149</p>
              <p className="text-xs text-parchment-muted mt-1 tracking-wide">One-time. Instant report.</p>
            </div>
            <div className="h-px w-px hidden sm:block bg-[#2a2a2a] self-stretch" />
            <ul className="space-y-1.5">
              {[
                "Scored across 7 validation pillars",
                "Identified risks and strengths",
                "Prioritized 30-day action plan",
                "PDF report delivered by email",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-parchment-dim">
                  <span className="text-gold text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Pillars overview */}
      <section className="py-24 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">The Framework</p>
            <h2 className="text-3xl md:text-4xl font-light">7 Pillars of Offer Integrity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a1a1a]">
            {pillars.map((p) => (
              <div key={p.n} className="bg-ink p-8 hover:bg-ink-soft transition-colors group">
                <p className="mono text-xs text-parchment-muted mb-4">{p.n}</p>
                <h3 className="text-lg font-light text-parchment mb-3 group-hover:text-gold transition-colors">
                  {p.name}
                </h3>
                <p className="text-sm text-parchment-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
            {/* CTA card */}
            <div className="bg-[#0f0e0c] p-8 border-l border-[#1a1a1a] flex flex-col justify-between">
              <div>
                <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">Ready?</p>
                <p className="text-parchment-dim text-sm leading-relaxed">
                  Complete the 15-minute assessment and get your scored report instantly.
                </p>
              </div>
              <Link
                href="/start"
                className="mt-8 inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors tracking-wider uppercase"
              >
                Start Assessment →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll get */}
      <section className="py-24 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">The Deliverable</p>
          <h2 className="text-3xl font-light mb-16">Your report includes everything you need to decide.</h2>

          <div className="space-y-8">
            {[
              {
                title: "Overall Score & Verdict",
                desc: "A single score out of 70 with a clear verdict: Launch Ready, Refine Before Scaling, High Risk, or Do Not Launch.",
              },
              {
                title: "Pillar-by-Pillar Breakdown",
                desc: "Strengths, gaps, and specific recommendations for each of the 7 validation pillars. No fluff.",
              },
              {
                title: "Top Risks & Strengths",
                desc: "The 3-5 factors most likely to accelerate or derail your launch, surfaced from the analysis.",
              },
              {
                title: "30-Day Action Plan",
                desc: "Prioritized actions broken down by week — what to do now, what to do next, what to do before launch.",
              },
              {
                title: "PDF + Permanent Link",
                desc: "Download a formatted PDF or access your report anytime via a private link. Emailed immediately.",
              },
            ].map((item, i) => (
              <div key={item.title} className="flex gap-8 pb-8 border-b border-[#1a1a1a]">
                <p className="mono text-xs text-parchment-muted pt-1 w-6 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="text-lg font-light text-parchment mb-2">{item.title}</h3>
                  <p className="text-sm text-parchment-dim leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-6">One-Time Investment</p>
          <h2 className="text-4xl font-light mb-4">
            $149 for clarity
            <br />
            <em className="text-parchment-dim not-italic text-3xl">before you spend months selling</em>
          </h2>
          <p className="text-parchment-dim mb-12 leading-relaxed">
            A single misaligned offer can cost you months of wasted effort. Know now.
          </p>
          <Link
            href="/start"
            className="inline-flex items-center gap-3 bg-gold text-ink px-10 py-4 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
          >
            Validate My Offer — $149
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="mono text-xs text-parchment-muted tracking-widest">OFFERINTEGRITY.IO</p>
          <p className="text-xs text-parchment-muted">© {new Date().getFullYear()} OfferIntegrity. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
