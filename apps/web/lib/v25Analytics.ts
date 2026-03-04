/**
 * OfferIntegrity V2.5 Analytics Engine
 * Pure additive layer — does NOT modify scoring, pillars, or any V2 logic.
 * Inputs: existing ReportJson + optional CompetitorContext[].
 */

export interface CompetitorEntry {
  name: string;
  price: string;  // raw string input
  promise: string;
}

// ─── Feature 1: Market Saturation Signal ─────────────────────────────────────

export interface MarketSaturationResult {
  level: "Low" | "Medium" | "High";
  competitorCount: number;
  priceTierOverlap: number;    // 0–100 %
  promiseSimilarity: number;   // 0–100 %
  summary: string;
  signals: string[];
}

function parsePriceUSD(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

function priceTier(usd: number): "low" | "mid" | "high" | "ultra" {
  if (usd < 1000)  return "low";
  if (usd < 5000)  return "mid";
  if (usd < 15000) return "high";
  return "ultra";
}

function promiseSimilarityScore(offerText: string, competitorPromise: string): number {
  // Keyword overlap heuristic — no external dependencies
  const GENERIC_KEYWORDS = [
    "scale", "revenue", "leads", "clients", "business", "grow", "results",
    "success", "sales", "marketing", "coaching", "consulting", "strategy",
    "framework", "system", "program", "accelerate", "transform", "clarity",
    "launch", "build", "done-for-you", "done for you", "dfy",
  ];

  const normalize = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
  const offerWords  = new Set(normalize(offerText).split(/\s+/).filter(Boolean));
  const compWords   = new Set(normalize(competitorPromise).split(/\s+/).filter(Boolean));

  let overlap = 0;
  let generic = 0;

  for (const kw of GENERIC_KEYWORDS) {
    const inOffer = offerWords.has(kw) || offerText.toLowerCase().includes(kw);
    const inComp  = compWords.has(kw)  || competitorPromise.toLowerCase().includes(kw);
    if (inOffer && inComp) overlap++;
    if (inOffer) generic++;
  }

  // Scale: overlap/generic ratio, clamped 0–100
  if (generic === 0) return 0;
  return Math.min(100, Math.round((overlap / Math.min(generic, 8)) * 100));
}

export function computeMarketSaturation(
  report: any,
  competitors: CompetitorEntry[]
): MarketSaturationResult {
  const askPrice = report.meta.price as number;
  const offerTier = priceTier(askPrice);

  const offerDescription = [
    report.meta.offerName,
    ...(report.pillars ?? []).map((p: any) => p.whatYouHave?.join(" ") ?? ""),
  ].join(" ");

  if (!competitors || competitors.length === 0) {
    return {
      level: "Low",
      competitorCount: 0,
      priceTierOverlap: 0,
      promiseSimilarity: 0,
      summary: "No competitor context provided. Saturation level assumed Low.",
      signals: ["Add competitor data on the intake form for a richer market signal."],
    };
  }

  // Price tier overlap
  const tierMatches = competitors.filter(
    (c) => priceTier(parsePriceUSD(c.price)) === offerTier
  ).length;
  const priceTierOverlap = Math.round((tierMatches / competitors.length) * 100);

  // Promise similarity (avg across competitors)
  const similarities = competitors.map((c) =>
    promiseSimilarityScore(offerDescription, c.promise)
  );
  const promiseSimilarity = Math.round(
    similarities.reduce((a, b) => a + b, 0) / similarities.length
  );

  // Saturation level
  const saturationScore = priceTierOverlap * 0.4 + promiseSimilarity * 0.6;
  const level: MarketSaturationResult["level"] =
    saturationScore >= 60 ? "High" :
    saturationScore >= 30 ? "Medium" : "Low";

  const signals: string[] = [];
  if (priceTierOverlap >= 60)
    signals.push(`${tierMatches} of ${competitors.length} competitors are priced in the same tier — price alone won't differentiate you.`);
  if (promiseSimilarity >= 60)
    signals.push("Your promise language overlaps heavily with competitors — buyers may struggle to tell you apart.");
  if (promiseSimilarity >= 40 && promiseSimilarity < 60)
    signals.push("Moderate language overlap with competitors detected — consider sharpening your unique mechanism.");
  if (level === "Low")
    signals.push("You appear to occupy a relatively uncrowded positioning — protect it with a clear named mechanism.");
  if (competitors.length >= 4)
    signals.push(`With ${competitors.length} known alternatives, buyers have ample comparison shopping options.`);

  const summary = `With ${competitors.length} competitor(s) analyzed, your market shows ${level.toLowerCase()} saturation. ${Math.round(priceTierOverlap)}% price-tier overlap, ${Math.round(promiseSimilarity)}% promise similarity.`;

  return { level, competitorCount: competitors.length, priceTierOverlap, promiseSimilarity, summary, signals };
}

// ─── Feature 2: Differentiation Gap Analyzer ─────────────────────────────────

export interface DifferentiationGapResult {
  clarityScore: number;         // 0–100
  clarityLabel: "Strong" | "Moderate" | "Weak";
  warnings: string[];
  strengths: string[];
  recommendation: string;
}

export function computeDifferentiationGap(
  report: any,
  competitors: CompetitorEntry[],
  saturation: MarketSaturationResult
): DifferentiationGapResult {
  const pillars = report.pillars as any[];

  const diffPillar  = pillars.find((p: any) => p.id === "differentiation");
  const outPillar   = pillars.find((p: any) => p.id === "outcome");
  const proofPillar = pillars.find((p: any) => p.id === "proof");

  const diffScore  = diffPillar?.score  ?? 5;
  const outScore   = outPillar?.score   ?? 5;
  const proofScore = proofPillar?.score ?? 5;

  // Base clarity from pillar scores
  let clarityScore = Math.round(((diffScore + outScore * 0.7 + proofScore * 0.3) / (10 + 7 + 3)) * 100);

  // Penalise for saturation
  if (saturation.level === "High")   clarityScore = Math.max(0, clarityScore - 20);
  if (saturation.level === "Medium") clarityScore = Math.max(0, clarityScore - 10);

  // Bonus for a named mechanism keyword
  const mechanismText = (pillars.find((p: any) => p.id === "differentiation")?.whatYouHave ?? []).join(" ").toLowerCase();
  const hasNamedMechanism = /\bmethod\b|\bframework\b|\bprocess\b|\bsystem\b|\bprotocol\b|\bformula\b/.test(mechanismText);
  if (hasNamedMechanism) clarityScore = Math.min(100, clarityScore + 10);

  const clarityLabel: DifferentiationGapResult["clarityLabel"] =
    clarityScore >= 65 ? "Strong" :
    clarityScore >= 40 ? "Moderate" : "Weak";

  const warnings: string[] = [];
  const strengths: string[] = [];

  if (diffScore <= 5)
    warnings.push("Differentiation pillar is below threshold — your offer may read as a commodity.");
  if (saturation.promiseSimilarity >= 50 && competitors.length > 0)
    warnings.push("Promise language mirrors competitors — buyers can't see a clear reason to choose you over alternatives.");
  if (!hasNamedMechanism && diffScore < 8)
    warnings.push("No clearly named proprietary mechanism detected — unnamed processes are easily copied and forgotten.");
  if (outScore <= 5)
    warnings.push("Vague outcome promise weakens differentiation — specificity is a form of positioning.");

  if (diffScore >= 7)
    strengths.push("Differentiation pillar score indicates meaningful competitive separation.");
  if (hasNamedMechanism)
    strengths.push("Named mechanism present — this anchors buyer memory and reduces direct comparison.");
  if (saturation.level === "Low")
    strengths.push("Low market saturation gives you positioning room to own your niche.");
  if (proofScore >= 7)
    strengths.push("Strong proof stack reinforces differentiation — credibility is a moat.");

  const recommendation =
    clarityLabel === "Strong"
      ? "Your differentiation is well-articulated. Focus on making it more specific and verifiable in your sales materials."
      : clarityLabel === "Moderate"
      ? "Sharpen your unique mechanism statement and contrast it directly against the alternatives your buyers consider."
      : "Reframe your offer around a named, proprietary process. Commodity framing kills high-ticket conversion.";

  return { clarityScore, clarityLabel, warnings, strengths, recommendation };
}

// ─── Feature 3: Offer Confidence Score ───────────────────────────────────────

export interface OfferConfidenceResult {
  level: "High" | "Medium" | "Low";
  score: number;           // 0–100
  explanation: string;
  drivers: { label: string; contribution: "positive" | "negative" | "neutral"; detail: string }[];
}

export function computeOfferConfidence(
  report: any,
  differentiation: DifferentiationGapResult
): OfferConfidenceResult {
  const pillars = report.pillars as any[];
  const pct     = report.overall.scorePercent as number;

  const proofScore  = pillars.find((p: any) => p.id === "proof")?.score  ?? 5;
  const diffScore   = pillars.find((p: any) => p.id === "differentiation")?.score ?? 5;
  const readyScore  = pillars.find((p: any) => p.id === "readiness")?.score ?? 5;
  const valueScore  = pillars.find((p: any) => p.id === "value")?.score ?? 5;
  const outScore    = pillars.find((p: any) => p.id === "outcome")?.score ?? 5;

  // Weighted composite: proof 30%, diff 25%, readiness 20%, clarity 15%, value 10%
  const raw =
    (proofScore / 10) * 30 +
    (diffScore  / 10) * 25 +
    (readyScore / 10) * 20 +
    (differentiation.clarityScore / 100) * 15 +
    (valueScore / 10) * 10;

  // Blend with overall score
  const score = Math.round(raw * 0.7 + (pct / 100 * 100) * 0.3);

  const level: OfferConfidenceResult["level"] =
    score >= 65 ? "High" :
    score >= 40 ? "Medium" : "Low";

  const drivers: OfferConfidenceResult["drivers"] = [
    {
      label: "Proof Strength",
      contribution: proofScore >= 7 ? "positive" : proofScore >= 5 ? "neutral" : "negative",
      detail: proofScore >= 7
        ? `Proof pillar ${proofScore}/10 — credibility assets support buyer confidence at this price point.`
        : proofScore >= 5
        ? `Proof pillar ${proofScore}/10 — adequate but more case studies or data would increase conviction.`
        : `Proof pillar ${proofScore}/10 — thin proof stack creates buyer hesitation at checkout.`,
    },
    {
      label: "Differentiation Clarity",
      contribution: differentiation.clarityLabel === "Strong" ? "positive" : differentiation.clarityLabel === "Moderate" ? "neutral" : "negative",
      detail: `Differentiation clarity is ${differentiation.clarityLabel.toLowerCase()} (${differentiation.clarityScore}/100). ${differentiation.recommendation}`,
    },
    {
      label: "Buyer Readiness",
      contribution: readyScore >= 7 ? "positive" : readyScore >= 5 ? "neutral" : "negative",
      detail: readyScore >= 7
        ? `Readiness pillar ${readyScore}/10 — target buyers have budget, authority, and urgency.`
        : `Readiness pillar ${readyScore}/10 — buyer qualification gap may extend your sales cycle.`,
    },
    {
      label: "Outcome Specificity",
      contribution: outScore >= 7 ? "positive" : outScore >= 5 ? "neutral" : "negative",
      detail: outScore >= 7
        ? `Outcome pillar ${outScore}/10 — clear, measurable promise reduces buyer uncertainty.`
        : `Outcome pillar ${outScore}/10 — vague outcome language reduces perceived confidence in results.`,
    },
  ];

  const explanation =
    level === "High"
      ? `Your offer projects high confidence (${score}/100). Proof, differentiation, and buyer readiness are all working in your favour. Focus on converting this confidence into tighter sales copy.`
      : level === "Medium"
      ? `Your offer projects medium confidence (${score}/100). Key gaps — typically proof or differentiation — are leaving value on the table. Address the negative drivers below to move into the High tier.`
      : `Your offer projects low confidence (${score}/100). Multiple structural gaps are suppressing buyer conviction. Until proof, differentiation, and outcome clarity are improved, close rates will remain challenged.`;

  return { level, score, explanation, drivers };
}

// ─── Feature 4: Mechanism Clarity Detector ───────────────────────────────────

export interface MechanismClarityResult {
  hasNamedMechanism: boolean;
  clarityRating: "Clear" | "Vague" | "Generic";
  flags: MechanismFlag[];
  suggestedFix: string;
}

export interface MechanismFlag {
  type: "generic_coaching_language" | "unclear_delivery" | "missing_mechanism" | "vague_promise";
  severity: "High" | "Medium" | "Low";
  description: string;
}

const GENERIC_COACHING_PHRASES = [
  "help you", "work with you", "guide you", "support you", "empower you",
  "unlock your", "reach your potential", "achieve your goals", "transform your",
  "level up", "next level", "breakthrough", "mindset", "accountability partner",
  "holistic", "tailored approach", "customized", "personalized journey",
  "step-by-step", "proven system", "time-tested",
];

const VAGUE_DELIVERY_PHRASES = [
  "various strategies", "multiple techniques", "a range of tools",
  "best practices", "industry insights", "expert guidance",
  "comprehensive support", "ongoing support", "as needed",
];

export function computeMechanismClarity(report: any): MechanismClarityResult {
  const pillars = report.pillars as any[];
  const diffPillar = pillars.find((p: any) => p.id === "differentiation");
  const delPillar  = pillars.find((p: any) => p.id === "delivery");

  // Gather all mechanism-related text from report
  const mechanismSources = [
    ...(diffPillar?.whatYouHave  ?? []),
    ...(diffPillar?.gaps         ?? []),
    ...(delPillar?.whatYouHave   ?? []),
  ].join(" ").toLowerCase();

  // Check for named mechanism markers
  const MECHANISM_MARKERS = [
    /\b\w+\s+(method|framework|process|system|protocol|formula|approach|model|methodology)\b/i,
    /the\s+\w+\s+(way|path|blueprint|roadmap|playbook)\b/i,
    /\b[A-Z]{2,}\b/,  // Acronym-style (e.g. PACE, GROW)
  ];

  const hasNamedMechanism = MECHANISM_MARKERS.some((re) =>
    re.test(mechanismSources) || re.test((diffPillar?.whatYouHave ?? []).join(" "))
  );

  const flags: MechanismFlag[] = [];

  // Generic coaching language detection
  const genericHits = GENERIC_COACHING_PHRASES.filter((phrase) =>
    mechanismSources.includes(phrase)
  );
  if (genericHits.length >= 3) {
    flags.push({
      type: "generic_coaching_language",
      severity: "High",
      description: `Generic coaching language detected (e.g. "${genericHits.slice(0, 2).join('", "')}"…). This language is indistinguishable from thousands of other offers.`,
    });
  } else if (genericHits.length >= 1) {
    flags.push({
      type: "generic_coaching_language",
      severity: "Medium",
      description: `Some generic coaching language found ("${genericHits[0]}"). Replace with specific, proprietary terminology.`,
    });
  }

  // Vague delivery detection
  const vagueHits = VAGUE_DELIVERY_PHRASES.filter((phrase) =>
    mechanismSources.includes(phrase)
  );
  if (vagueHits.length >= 2) {
    flags.push({
      type: "unclear_delivery",
      severity: "High",
      description: `Vague delivery language detected (e.g. "${vagueHits[0]}"). Buyers can't picture what they'll actually receive.`,
    });
  } else if (vagueHits.length === 1) {
    flags.push({
      type: "unclear_delivery",
      severity: "Medium",
      description: `Delivery mechanism could be more specific ("${vagueHits[0]}" found). Describe exactly what happens each week/session.`,
    });
  }

  // Missing mechanism flag
  if (!hasNamedMechanism) {
    flags.push({
      type: "missing_mechanism",
      severity: "High",
      description: "No named proprietary mechanism detected. Without a named process, your offer competes on personality alone — which doesn't scale.",
    });
  }

  // Low differentiation pillar score flag
  const diffScore = diffPillar?.score ?? 5;
  if (diffScore <= 4) {
    flags.push({
      type: "vague_promise",
      severity: "High",
      description: `Differentiation pillar score is ${diffScore}/10 — the mechanism described is not sufficiently distinct from alternatives.`,
    });
  } else if (diffScore <= 6) {
    flags.push({
      type: "vague_promise",
      severity: "Medium",
      description: `Differentiation pillar score is ${diffScore}/10 — the mechanism exists but needs sharper articulation.`,
    });
  }

  const highFlags = flags.filter((f) => f.severity === "High").length;
  const clarityRating: MechanismClarityResult["clarityRating"] =
    highFlags >= 2 || !hasNamedMechanism ? "Generic" :
    flags.length >= 2 ? "Vague" : "Clear";

  const suggestedFix =
    clarityRating === "Generic"
      ? "Name your process. Write: 'My [Name] [Method/System/Framework] works by…' and fill in specific steps. Every step should be named, sequenced, and outcome-linked."
      : clarityRating === "Vague"
      ? "Your mechanism exists but needs sharpening. Describe the 3–5 specific phases, tools, or steps that make your delivery unique. Remove filler phrases like 'ongoing support' and replace with exact touchpoints."
      : "Your mechanism has clear elements. Consider making your proprietary name more memorable with an acronym or metaphor that buyers will repeat to others.";

  return { hasNamedMechanism, clarityRating, flags, suggestedFix };
}

// ─── Convenience: compute all V2.5 sections at once ──────────────────────────

export interface V25Analytics {
  marketSaturation:      MarketSaturationResult;
  differentiationGap:    DifferentiationGapResult;
  offerConfidence:       OfferConfidenceResult;
  mechanismClarity:      MechanismClarityResult;
}

export function computeV25Analytics(
  report: any,
  competitors: CompetitorEntry[] = []
): V25Analytics {
  const marketSaturation   = computeMarketSaturation(report, competitors);
  const differentiationGap = computeDifferentiationGap(report, competitors, marketSaturation);
  const offerConfidence    = computeOfferConfidence(report, differentiationGap);
  const mechanismClarity   = computeMechanismClarity(report);

  return { marketSaturation, differentiationGap, offerConfidence, mechanismClarity };
}
