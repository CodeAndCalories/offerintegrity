"use client";

import Link from "next/link";
import Footer from "../components/Footer";

// ─── Sample Report Preview ─────────────────────────────────────────────────

const SAMPLE_PILLARS = [
  {
    name: "Transformation Clarity",
    score: 6,
    verdict: "Weak",
    finding:
      "The outcome statement describes a process ('I help you build a system') rather than a specific, measurable transformation. Buyers paying £5k+ need to see their life before and after in concrete terms.",
    fix: "Rewrite your core promise as: 'From [specific painful state] to [specific desirable outcome] in [timeframe].' Test it — if someone can't repeat it back to you, it's too vague.",
  },
  {
    name: "Pricing Integrity",
    score: 8,
    verdict: "Strong",
    finding:
      "The price point is anchored to a credible outcome and the ROI framing is clear. Objection handling around price is present but not front-loaded.",
    fix: "Move the ROI calculation above the fold. Buyers should see the value math before they see the number.",
  },
  {
    name: "Proof Structure",
    score: 5,
    verdict: "Gap",
    finding:
      "Case studies present results without specificity. '3x revenue' with no timeframe, starting point, or client context reads as unverifiable. This actively increases perceived risk.",
    fix: "Rebuild your best 2 case studies using the format: '[Client type] went from [specific before] to [specific after] in [timeframe] using [specific element of your method].'",
  },
  {
    name: "Conversion Friction",
    score: 7,
    verdict: "Moderate",
    finding:
      "Discovery call booking requires 4 steps. Each additional step costs roughly 15–20% of applicants. The application form asks for information that could be collected post-booking.",
    fix: "Reduce the pre-call form to name, email, and one qualifying question. Move deeper discovery into the call itself.",
  },
];

const SCORE_COLOR: Record<string, string> = {
  Strong: "#4ade80",
  Moderate: "#facc15",
  Weak: "#f97316",
  Gap: "#f87171",
};

// ─── FAQ ───────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "What exactly do I get?",
    a: "A structured PDF report evaluating your offer across 7 pillars: Transformation Clarity, Positioning Differentiation, Pricing Integrity, Proof Structure, Conversion Friction, Credibility Signals, and Risk Perception. Each pillar is scored, findings are specific to your answers, and fixes are prioritised by sales impact.",
  },
  {
    q: "How long does it take to get my report?",
    a: "The wizard takes 10–15 minutes. Your report is usually ready within 60 minutes of completing the questionnaire and payment.",
  },
  {
    q: "Can I upload supporting materials?",
    a: "Yes. After completing the questionnaire you can optionally upload up to 3 files (PDF, Word, or text — 10MB total). Sales pages, pitch decks, or testimonials you upload will be reviewed and referenced in your report at no extra cost.",
  },
  {
    q: "What if I'm still building my offer?",
    a: "The report works at any stage. Many clients use it before their first launch specifically to avoid expensive positioning mistakes. Earlier is better.",
  },
  {
    q: "Is this just AI-generated generic advice?",
    a: "No. The methodology is a fixed 7-pillar framework built for high-ticket offers specifically. Your report is generated from your specific answers — it will call out the exact language you used, the specific gaps in your proof, and the particular friction points in your funnel.",
  },
  {
    q: "What's your refund policy?",
    a: "If your report is factually identical to advice you could find by Googling for 10 minutes, we'll refund you. See our Terms for the full policy. In practice, the analysis is specific enough that this has never been claimed.",
  },
  {
    q: "What kind of offers is this designed for?",
    a: "Coaching programmes, consulting retainers, done-for-you services, and online courses — all priced between £2,000 and £50,000. If your offer is below £1k it's probably not a fit; standard conversion principles apply at that price point without the premium positioning work.",
  },
];

// ─── Objections ────────────────────────────────────────────────────────────

const OBJECTIONS = [
  {
    label: "\"I already know my offer works.\"",
    response:
      "If it's converting above 20% consistently on cold traffic, you probably don't need this. Most founders who think it's working have a 'works sometimes' offer — the kind where you land clients but can't explain why some conversations convert and others don't. That inconsistency is what the report is designed to surface.",
  },
  {
    label: "\"£149 for a report feels expensive.\"",
    response:
      "One sales call that doesn't convert because of a positioning problem you haven't identified costs more than this. The report is designed to find the highest-leverage fix — the one change most likely to move your conversion rate. That's the maths.",
  },
  {
    label: "\"I can get feedback from my network for free.\"",
    response:
      "You can. But your network won't tell you your case studies are weak, your transformation statement is vague, or your price point signals doubt about your own value. A structured external audit without a relationship to protect will.",
  },
  {
    label: "\"I've tried offer reviews before and they were useless.\"",
    response:
      "Generic offer reviews give you generic feedback. This framework scores against 7 specific criteria and is calibrated to high-ticket conversion specifically. If the findings aren't specific to your answers, contact us.",
  },
  {
    label: "\"What if the advice doesn't apply to my niche?\"",
    response:
      "The 7 pillars are structural — they apply to any high-ticket offer regardless of niche. The language in your report will reference your specific answers, not a generic template.",
  },
];

// ─── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <p className="text-xs uppercase tracking-[0.2em] text-yellow-400 mb-6">
          7-Pillar Offer Validation · One Report · $149
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
          Validate Your $5K–$50K Offer
          <br />
          <span className="text-yellow-400">Before You Scale</span>
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mb-4 leading-relaxed">
          Know If Your High-Ticket Offer Will Convert — Before You Spend on Ads
        </p>
        <p className="text-base text-white/50 max-w-2xl mb-10 leading-relaxed">
          Most positioning failures aren't obvious from the inside. This report surfaces the
          structural gaps — weak transformation language, thin proof, pricing friction, misaligned
          audience — so you fix the right things before your next launch.
        </p>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <Link
            href="/start"
            className="inline-block bg-yellow-400 text-black font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition-colors"
          >
            Validate My Offer →
          </Link>
          <span className="text-sm text-white/40">
            10–15 min questionnaire · Report within 60 min · $149
          </span>
        </div>

        <p className="text-xs text-white/30 tracking-wide">
          Used by consultants and programme founders charging $3k–$25k.
        </p>
      </section>

      {/* ── PROOF BAR ────────────────────────────────────────────────────── */}
      <section className="border-t border-b border-white/5 bg-white/[0.02] py-6">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            ["7", "Pillars evaluated"],
            ["<60 min", "Average delivery"],
            ["$5K–$50K", "Offer range"],
            ["100%", "Specific to your answers"],
          ].map(([stat, label]) => (
            <div key={label}>
              <div className="text-yellow-400 font-bold text-2xl">{stat}</div>
              <div className="text-white/40 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              n: "01",
              title: "Answer 12 structured questions",
              body: "We ask about your offer, audience, pricing rationale, proof, and the objections you hear most. No vague inputs.",
            },
            {
              n: "02",
              title: "Optionally upload supporting files",
              body: "Sales pages, pitch decks, testimonials — upload up to 3 files and they'll be reviewed as part of your report. Included at no extra cost.",
            },
            {
              n: "03",
              title: "Receive a prioritised report",
              body: "Each pillar is scored. Issues most likely to cost you sales are called out first. Specific, actionable findings — not generic advice.",
            },
          ].map(({ n, title, body }) => (
            <div key={n}>
              <div className="text-yellow-400 text-xs font-bold tracking-widest mb-3">{n}</div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SAMPLE REPORT PREVIEW ────────────────────────────────────────── */}
      <section className="bg-white/[0.02] border-t border-white/5 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">What your report looks like</h2>
            <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">
              Sample only
            </span>
          </div>
          <p className="text-white/40 text-sm mb-10">
            Findings below are illustrative. Your report is generated from your specific answers.
          </p>

          <div className="space-y-6">
            {SAMPLE_PILLARS.map(({ name, score, verdict, finding, fix }) => (
              <div
                key={name}
                className="border border-white/10 rounded-xl p-6 bg-white/[0.03]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{name}</h3>
                    <span
                      className="text-xs font-bold mt-1 inline-block"
                      style={{ color: SCORE_COLOR[verdict] }}
                    >
                      {verdict}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {score}
                      <span className="text-sm text-white/30">/10</span>
                    </div>
                  </div>
                </div>
                {/* Score bar */}
                <div className="h-1 bg-white/10 rounded-full mb-4">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${score * 10}%`,
                      backgroundColor: SCORE_COLOR[verdict],
                    }}
                  />
                </div>
                <p className="text-sm text-white/60 mb-3 leading-relaxed">
                  <span className="text-white/30 uppercase text-xs tracking-widest block mb-1">
                    Finding
                  </span>
                  {finding}
                </p>
                <p className="text-sm text-yellow-400/80 leading-relaxed">
                  <span className="text-yellow-400/50 uppercase text-xs tracking-widest block mb-1">
                    Fix
                  </span>
                  {fix}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/start"
              className="inline-block bg-yellow-400 text-black font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition-colors"
            >
              Get My Report →
            </Link>
            <p className="text-white/30 text-sm mt-3">$149 · Delivered within 60 minutes</p>
          </div>
        </div>
      </section>

      {/* ── OBJECTIONS ───────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold mb-10">Common objections, addressed</h2>
        <div className="space-y-6">
          {OBJECTIONS.map(({ label, response }) => (
            <div key={label} className="border-l-2 border-yellow-400/30 pl-6">
              <p className="font-semibold text-white/90 mb-2">{label}</p>
              <p className="text-white/50 text-sm leading-relaxed">{response}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-white/[0.02] border-t border-white/5 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-10">Frequently asked questions</h2>
          <div className="space-y-8">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <h3 className="font-semibold text-white mb-2">{q}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Find out what's stopping your offer from converting.
        </h2>
        <p className="text-white/50 mb-8 max-w-lg mx-auto">
          One report. Seven pillars. Specific findings. Delivered in under an hour.
        </p>
        <Link
          href="/start"
          className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-lg text-xl hover:bg-yellow-300 transition-colors"
        >
          Validate My Offer — $149 →
        </Link>
        <p className="text-white/20 text-sm mt-4">
          Stripe-secured checkout · PDF delivered by email
        </p>
      </section>

      <Footer />
    </div>
  );
}
