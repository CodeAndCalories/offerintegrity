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

  const testimonials = [
    {
      quote: "I'd been running ads on my coaching offer for three months and couldn't figure out why it wasn't converting. The report flagged the exact problem within the first two pillars. Worth every dollar.",
      name: "M.T.",
      title: "Business Coach, Austin TX",
      tag: "Beta feedback",
    },
    {
      quote: "Before spending on a launch, I put my offer through this. Came back 'Refine Before Scaling.' Painful — but the 30-day action plan gave me a clear fix. Re-launched 6 weeks later with a much stronger close rate.",
      name: "R.K.",
      title: "Consultant, London",
      tag: "Beta feedback",
    },
    {
      quote: "I was skeptical it would tell me anything I didn't know. It surfaced a value justification gap I'd been hand-waving for months. Now I lead with ROI framing and it's changed my discovery calls.",
      name: "J.L.",
      title: "Fractional CMO, Chicago",
      tag: "Beta feedback",
    },
  ];

  // TODO: Replace /public/preview-1.png, -2.png, -3.png with real report screenshots
  const reportScreenshots = [
    { src: "/preview-1.png", alt: "Report overview — score and verdict section", caption: "Overall score & verdict" },
    { src: "/preview-2.png", alt: "Pillar-by-pillar breakdown", caption: "Pillar breakdown" },
    { src: "/preview-3.png", alt: "30-day action plan section", caption: "30-day action plan" },
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
            Most high-ticket offers
            <br />
            <em className="text-gold not-italic">fail before they launch.</em>
            <br />
            Yours doesn&rsquo;t have to.
          </h1>
          <p className="text-lg text-parchment-dim max-w-xl mb-12 leading-relaxed">
            Validate your $2k–$20k coaching or consulting offer before you launch.
            Get a structured 7-pillar report showing whether your offer is likely to sell.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/start"
              className="inline-flex items-center gap-3 bg-gold text-ink px-8 py-4 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
            >
              Validate My Offer →
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-3 border border-[#2a2a2a] text-parchment-dim px-8 py-4 text-sm tracking-widest uppercase hover:border-gold hover:text-parchment transition-colors"
            >
              View Sample Report
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
                "PDF + private report link (90 days)",
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

      {/* Credibility block */}
      <section className="py-12 px-6 border-t border-[#1a1a1a] bg-ink-soft">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#1a1a1a]">
            {[
              {
                label: "Built for $2k–$20k offers",
                desc: "Calibrated for high-ticket consulting, coaching, and productized services — not courses or SaaS.",
              },
              {
                label: "7-pillar scoring rubric",
                desc: "Each pillar is scored 0–10 against a defined rubric. No vague feedback. No hand-waving.",
              },
              {
                label: "Instant 30-day action roadmap",
                desc: "Prioritized by week. Know exactly what to fix first and why it matters to conversion.",
              },
            ].map((item) => (
              <div key={item.label} className="bg-ink-soft px-8 py-6">
                <p className="text-xs text-gold mono tracking-widest uppercase mb-2">{item.label}</p>
                <p className="text-sm text-parchment-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
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

      {/* Report screenshots */}
      <section className="py-24 px-6 border-t border-[#1a1a1a] bg-ink-soft">
        <div className="max-w-5xl mx-auto">
          <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">Sample Output</p>
          <h2 className="text-3xl font-light mb-4">What your report looks like</h2>
          <p className="text-sm text-parchment-dim mb-6 max-w-xl">
            A structured, scored report across all 7 pillars — with specific gaps, risks, and a prioritized action plan.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors tracking-wider uppercase mb-12"
          >
            View full sample report →
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportScreenshots.map((shot) => (
              <div key={shot.src} className="border border-[#2a2a2a] bg-ink overflow-hidden group">
                <div className="relative aspect-[4/3] bg-[#111] flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-parchment-muted text-xs mono opacity-20 pointer-events-none select-none">
                    {shot.caption}
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-[#1a1a1a]">
                  <p className="text-xs text-parchment-dim">{shot.caption}</p>
                </div>
              </div>
            ))}
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
                title: "Private Report Link (90 days)",
                desc: "Download a formatted PDF or access your report anytime via a private link. Emailed immediately after payment.",
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

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-[#1a1a1a] bg-ink-soft">
        <div className="max-w-5xl mx-auto">
          <p className="mono text-xs text-gold tracking-[0.3em] uppercase mb-4">Early Feedback</p>
          <h2 className="text-3xl font-light mb-16">From founders who ran their offer through it</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-ink p-8 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-parchment-dim leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div>
                  <p className="text-sm text-parchment font-light">{t.name}</p>
                  <p className="text-xs text-parchment-muted mt-0.5">{t.title}</p>
                  <span className="mt-3 inline-block mono text-xs text-parchment-muted border border-[#2a2a2a] px-2 py-0.5">{t.tag}</span>
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
            $149 before you spend
            <br />
            <em className="text-parchment-dim not-italic text-3xl">months on an offer that won&rsquo;t close</em>
          </h2>
          <p className="text-parchment-dim mb-10 leading-relaxed">
            Every week you run a misaligned offer is a week of wasted discovery calls, lost trust, and diluted positioning. Know now.
          </p>
          <Link
            href="/start"
            className="inline-flex items-center gap-3 bg-gold text-ink px-10 py-4 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors"
          >
            Validate My Offer — $149
          </Link>
          {/* Microcopy */}
          <p className="mt-4 text-xs text-parchment-muted tracking-wide">
            Instant access. No subscription. One-time validation.
          </p>
          {/* Sample link */}
          <p className="mt-3 text-xs text-parchment-muted">
            Not sure what you&rsquo;re getting?{" "}
            <Link href="/demo" className="text-gold hover:text-gold-light underline underline-offset-2 transition-colors">
              View a sample report first.
            </Link>
          </p>
          </div>
          </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="mono text-xs text-parchment-muted tracking-widest">OFFERINTEGRITY.IO</p>
          <div className="flex gap-6 text-xs text-parchment-muted">
            <Link href="/privacy" className="hover:text-parchment transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-parchment transition-colors">Terms</Link>
          </div>
          <p className="text-xs text-parchment-muted">© {new Date().getFullYear()} OfferIntegrity. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
