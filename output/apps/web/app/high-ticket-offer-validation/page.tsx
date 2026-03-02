import type { Metadata } from "next";
import Link from "next/link";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "High-Ticket Offer Validation — Know Why Your Offer Isn't Converting",
  description:
    "Before you spend on ads or hire a sales team, validate your high-ticket coaching or consulting offer with a structured 7-pillar audit. Identify the exact gaps costing you conversions.",
  alternates: {
    canonical: "https://offerintegrity.io/high-ticket-offer-validation",
  },
  openGraph: {
    title: "High-Ticket Offer Validation Report — OfferIntegrity",
    description:
      "A structured 7-pillar audit for coaching, consulting, and done-for-you offers priced $3K–$50K. Know exactly what to fix before your next launch.",
    url: "https://offerintegrity.io/high-ticket-offer-validation",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

export default function HighTicketOfferValidationPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <article className="max-w-3xl mx-auto px-6 py-20 prose prose-invert prose-lg max-w-none">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <header className="not-prose mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-yellow-400 mb-5">
            High-Ticket Offer Validation
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-6">
            Why Your High-Ticket Offer Isn&apos;t Converting
            <br />
            <span className="text-yellow-400">(And How to Fix It Before You Scale)</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-8 max-w-2xl">
            Most high-ticket offer problems aren&apos;t obvious. They&apos;re structural — buried
            in your positioning, your proof, or the language you use to describe what you do. This
            page explains the framework we use to surface them.
          </p>
          <Link
            href="/start"
            className="inline-block bg-yellow-400 text-black font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition-colors no-underline"
          >
            Validate My Offer — $149 →
          </Link>
        </header>

        {/* ── BODY COPY ────────────────────────────────────────────────── */}
        <div className="text-white/70 leading-relaxed space-y-8">

          <h2 className="text-white font-bold text-2xl mt-12 mb-4">
            The problem with most offer reviews
          </h2>
          <p>
            If you&apos;ve ever asked a peer, a coach, or a mentor to review your high-ticket
            offer, you&apos;ve probably received feedback like:{" "}
            <em className="text-white/50">
              &quot;Your messaging could be clearer,&quot; &quot;I think the price feels
              high,&quot; &quot;Maybe test a different headline.&quot;
            </em>
          </p>
          <p>
            That feedback isn&apos;t useless — but it&apos;s not diagnostic. It doesn&apos;t tell
            you which specific element is costing you conversions, how severe the problem is
            relative to other issues, or what to fix first.
          </p>
          <p>
            Without a structured framework, offer reviews are pattern-matched to the reviewer&apos;s
            own experience. They&apos;re useful if the reviewer has built an identical offer at an
            identical price point to an identical audience. Otherwise, you&apos;re getting
            anecdote dressed as diagnosis.
          </p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4">
            The 7 pillars of high-ticket offer conversion
          </h2>
          <p>
            After analysing dozens of high-ticket offers across coaching, consulting, and
            done-for-you services, the same failure patterns appear across seven structural
            dimensions. These aren&apos;t arbitrary — each one maps to a documented cause of
            conversion failure at premium price points.
          </p>

          {[
            {
              name: "1. Transformation Clarity",
              copy: `The most common failure. The offer describes a process rather than a transformation. "I help you build a system" is not a transformation — it's a deliverable. Buyers paying $5k+ need to understand their life before and after in specific, measurable terms. Vague outcomes signal vague results, which signals risk.`,
            },
            {
              name: "2. Positioning Differentiation",
              copy: `If your offer sounds like every other offer in your category, the buyer defaults to price comparison. Differentiation isn't about being weird — it's about being specific. A clearly differentiated offer makes price comparison difficult because there's no direct alternative to compare against.`,
            },
            {
              name: "3. Pricing Integrity",
              copy: `Price signals value. An offer priced at $2,500 positioned against $25,000 outcomes has pricing integrity. An offer priced at $497 positioned against $250,000 outcomes does not — the gap is too large and the buyer suspects the outcome claim. Pricing integrity also covers how the price is justified and where it appears in the conversion sequence.`,
            },
            {
              name: "4. Proof Structure",
              copy: `Testimonials and case studies are not interchangeable with proof. Proof requires specificity: a named client, a defined starting point, a measurable result, and a timeframe. "John went from 3 clients to 12 clients in 6 months using this methodology" is proof. "This changed my business" is not.`,
            },
            {
              name: "5. Conversion Friction",
              copy: `Every step between interest and purchase costs you roughly 15–25% of qualified buyers. Discovery call booking processes, long application forms, poorly designed checkout flows — each creates a leak. Conversion friction analysis identifies where qualified buyers are abandoning the process and why.`,
            },
            {
              name: "6. Credibility Signals",
              copy: `At high-ticket price points, buyers need to trust the seller before they trust the offer. Credibility signals are the environmental cues that establish that trust: professional presentation, verifiable claims, legitimate social proof, visible expertise. Missing or weak credibility signals increase perceived risk regardless of offer quality.`,
            },
            {
              name: "7. Risk Perception",
              copy: `Every high-ticket purchase carries perceived risk: financial risk, opportunity cost risk, and the social risk of recommending the offer to others. How your offer handles risk — through guarantees, onboarding clarity, scoping, or contract terms — directly affects conversion at the decision stage.`,
            },
          ].map(({ name, copy }) => (
            <div key={name}>
              <h3 className="text-white font-semibold text-lg mt-8 mb-2">{name}</h3>
              <p>{copy}</p>
            </div>
          ))}

          <h2 className="text-white font-bold text-2xl mt-12 mb-4">
            Why structural validation before scaling matters
          </h2>
          <p>
            Paid traffic, outbound, and referral programmes amplify what already exists. If your
            offer has a positioning problem, traffic will amplify the symptom (low conversion) and
            obscure the cause (structural gap). Founders who scale before validating end up spending
            more to acquire each client and attributing the problem to targeting, copy, or the
            economy — not to the offer itself.
          </p>
          <p>
            Validation before scaling answers the question:{" "}
            <em className="text-white/50">
              Is this a distribution problem, or an offer problem?
            </em>{" "}
            These require completely different responses. Conflating them is expensive.
          </p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4">
            Who this is for
          </h2>
          <p>
            This report is designed for coaches, consultants, and service providers with offers
            priced between $2,000 and $50,000. It works at any stage: pre-launch, post-launch but
            pre-scale, or when an existing offer that used to convert has stopped performing.
          </p>
          <p>
            It is not designed for products below $1,000. Below that threshold, standard conversion
            rate optimisation principles apply without the premium positioning work that
            high-ticket requires.
          </p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4">
            What you receive
          </h2>
          <p>
            After completing the 12-question intake form, your offer is evaluated across all 7
            pillars. Each pillar receives a score from 1–10, a written finding specific to your
            answers, and a prioritised fix. The report calls out the issues most likely to be
            costing you sales first.
          </p>
          <p>
            If you upload supporting materials — a sales page, pitch deck, or testimonials — those
            are reviewed as part of the analysis and referenced in the relevant sections.
          </p>
          <p>
            The report is delivered as a PDF to your email address within 60 minutes of completing
            the questionnaire and payment.
          </p>

          <h2 className="text-white font-bold text-2xl mt-12 mb-4">
            The cost of not validating
          </h2>
          <p>
            One unconverted sales call from a fixable positioning problem costs more in time and
            opportunity than the report. A misallocated ad spend testing the wrong hypothesis costs
            more in money. A launch that underperforms because of a proof structure problem you
            could have identified costs more in both.
          </p>
          <p>
            The question isn&apos;t whether you can afford a validation report. It&apos;s whether
            you can afford to scale without one.
          </p>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div className="not-prose mt-16 border-t border-white/10 pt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Get your 7-pillar offer validation report
          </h2>
          <p className="text-white/50 mb-8">
            10–15 min questionnaire. Report delivered within 60 minutes. $149.
          </p>
          <Link
            href="/start"
            className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-lg text-xl hover:bg-yellow-300 transition-colors"
          >
            Validate My Offer →
          </Link>
        </div>
      </article>
      <Footer />
    </div>
  );
}
