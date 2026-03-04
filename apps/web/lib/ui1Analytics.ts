/**
 * OfferIntegrity UI-1 Derived Display Layer
 * Pure template/math logic — no AI, no external APIs.
 * Does NOT touch scoring, pillar math, V2, or V2.5 analytics.
 */

// ─── Grade Badge ─────────────────────────────────────────────────────────────

export type GradeLetter = "A" | "B" | "C" | "D";
export type GradeModifier = "+" | "" | "-";

export interface OfferGrade {
  letter: GradeLetter;
  modifier: GradeModifier;
  label: string;        // e.g. "B+"
  color: "emerald" | "gold" | "amber" | "red";
  tagline: string;      // one-line qualifier
}

export function computeOfferGrade(scorePercent: number): OfferGrade {
  // pct = scoreTotal / 70 * 100
  const pct = scorePercent;

  let letter: GradeLetter;
  let modifier: GradeModifier;
  let color: OfferGrade["color"];
  let tagline: string;

  if (pct >= 90) {
    letter = "A"; modifier = "+"; color = "emerald";
    tagline = "Exceptional — ready to scale";
  } else if (pct >= 83) {
    letter = "A"; modifier = ""; color = "emerald";
    tagline = "Strong — minor polish needed";
  } else if (pct >= 77) {
    letter = "A"; modifier = "-"; color = "emerald";
    tagline = "Solid — a few gaps to close";
  } else if (pct >= 72) {
    letter = "B"; modifier = "+"; color = "gold";
    tagline = "Above average — refine before scaling";
  } else if (pct >= 65) {
    letter = "B"; modifier = ""; color = "gold";
    tagline = "Promising — targeted work required";
  } else if (pct >= 58) {
    letter = "B"; modifier = "-"; color = "gold";
    tagline = "Moderate — notable gaps present";
  } else if (pct >= 50) {
    letter = "C"; modifier = "+"; color = "amber";
    tagline = "Below average — significant rework needed";
  } else if (pct >= 43) {
    letter = "C"; modifier = ""; color = "amber";
    tagline = "Weak — foundational issues";
  } else if (pct >= 36) {
    letter = "C"; modifier = "-"; color = "amber";
    tagline = "High risk — do not scale";
  } else {
    letter = "D"; modifier = ""; color = "red";
    tagline = "Do not launch — critical failures";
  }

  return { letter, modifier, color, label: `${letter}${modifier}`, tagline };
}

// ─── Pillar Ranking ───────────────────────────────────────────────────────────

export interface RankedPillar {
  name: string;
  score: number;
  pct: number; // 0–100
}

export interface PillarRanking {
  strongest: RankedPillar[];   // top 3
  weakest: RankedPillar[];     // bottom 3
}

export function computePillarRanking(pillars: any[]): PillarRanking {
  const ranked: RankedPillar[] = [...pillars]
    .map((p: any) => ({ name: p.name, score: p.score, pct: Math.round((p.score / 10) * 100) }))
    .sort((a, b) => b.score - a.score);

  return {
    strongest: ranked.slice(0, 3),
    weakest: ranked.slice(-3).reverse(),
  };
}

// ─── Close Probability Meter ─────────────────────────────────────────────────

export interface CloseProbMeter {
  low: number;
  high: number;
  midpoint: number;       // for meter fill
  confidence: "Low" | "Moderate" | "High";
  confidenceColor: "red" | "amber" | "emerald";
  rangeLabel: string;     // "18 – 30%"
  summary: string;
}

export function computeCloseProbMeter(report: any): CloseProbMeter {
  const pct = report.overall.scorePercent as number;
  const pillars = report.pillars as any[];

  function ps(id: string): number {
    return pillars.find((p: any) => p.id === id)?.score ?? 5;
  }

  const proof = ps("proof");
  const diff  = ps("differentiation");
  const ready = ps("readiness");

  // Base range by score band
  let low: number, high: number;
  if (pct >= 80)      { low = 28; high = 45; }
  else if (pct >= 65) { low = 18; high = 30; }
  else if (pct >= 50) { low = 10; high = 20; }
  else                { low = 4;  high = 12; }

  // Confidence from proof + diff + readiness
  const confidenceScore = (proof + diff + ready) / 3;
  let confidence: "Low" | "Moderate" | "High";
  let confidenceColor: "red" | "amber" | "emerald";
  if (confidenceScore >= 7)      { confidence = "High";     confidenceColor = "emerald"; }
  else if (confidenceScore >= 5) { confidence = "Moderate"; confidenceColor = "amber"; }
  else                           { confidence = "Low";      confidenceColor = "red"; }

  const midpoint = Math.round((low + high) / 2);

  const summaries: Record<string, string> = {
    High:     "Strong proof, differentiation, and buyer readiness underpin this estimate.",
    Moderate: "Core elements are present but proof or readiness is limiting confidence.",
    Low:      "Weak proof, undifferentiated positioning, or unqualified buyers suppress close rates.",
  };

  return {
    low, high, midpoint,
    confidence, confidenceColor,
    rangeLabel: `${low}–${high}%`,
    summary: summaries[confidence],
  };
}

// ─── Price Benchmark ──────────────────────────────────────────────────────────

export type PricePositionLabel = "Premium" | "Market" | "Budget";

export interface PriceBenchmarkResult {
  hasData: boolean;
  competitorCount: number;
  avgPrice: number;
  medianPrice: number;
  userPrice: number;
  positionLabel: PricePositionLabel;
  positionImplication: string;
  competitorPrices: number[];   // parsed USD values (for display)
}

function parsePriceUSD(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export function computePriceBenchmark(
  report: any,
  competitors: { name: string; price: string; promise: string }[] = []
): PriceBenchmarkResult {
  const userPrice: number = report.meta.price as number;

  if (!competitors || competitors.length === 0) {
    return {
      hasData: false,
      competitorCount: 0,
      avgPrice: 0,
      medianPrice: 0,
      userPrice,
      positionLabel: "Market",
      positionImplication: "No competitor data provided — positioning cannot be benchmarked.",
      competitorPrices: [],
    };
  }

  const prices = competitors.map((c) => parsePriceUSD(c.price)).filter((p) => p > 0);
  if (prices.length === 0) {
    return {
      hasData: false,
      competitorCount: competitors.length,
      avgPrice: 0,
      medianPrice: 0,
      userPrice,
      positionLabel: "Market",
      positionImplication: "Competitor prices could not be parsed — check input format.",
      competitorPrices: [],
    };
  }

  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  let positionLabel: PricePositionLabel;
  let positionImplication: string;

  if (userPrice >= avg * 1.25) {
    positionLabel = "Premium";
    positionImplication =
      "Your price sits above the market average — buyers will expect stronger proof, clearer differentiation, and higher-touch delivery to justify the premium.";
  } else if (userPrice <= avg * 0.75) {
    positionLabel = "Budget";
    positionImplication =
      "Your price is below market average — this may attract price-sensitive buyers but could undermine perceived value at the premium end. Consider raising price alongside stronger proof.";
  } else {
    positionLabel = "Market";
    positionImplication =
      "Your price is in line with the market average — differentiation and proof quality, not price, will determine who wins the deal.";
  }

  return {
    hasData: true,
    competitorCount: prices.length,
    avgPrice: Math.round(avg),
    medianPrice: Math.round(median),
    userPrice,
    positionLabel,
    positionImplication,
    competitorPrices: prices,
  };
}

// ─── Executive Summary Card ───────────────────────────────────────────────────

export interface ExecSummary {
  sentences: string[];  // 3–5 sentences
  topStrengthPillar: string;
  topRiskPillar: string;
  priceBenchmark?: PriceBenchmarkResult;  // injected if competitor data present
}

export function computeExecSummary(
  report: any,
  competitors: { name: string; price: string; promise: string }[] = []
): ExecSummary {
  const pillars: any[] = report.pillars;
  const overall = report.overall;
  const pct: number = overall.scorePercent;
  const score: number = overall.scoreTotal;
  const verdict: string = overall.verdict;
  const offerName: string = report.meta.offerName;
  const price: number = report.meta.price;

  const sorted = [...pillars].sort((a, b) => b.score - a.score);
  const topPillar = sorted[0];
  const bottomPillar = sorted[sorted.length - 1];

  const grade = computeOfferGrade(pct);
  const priceStr = `$${price.toLocaleString()}`;

  // Sentence 1: overview
  const verdictMap: Record<string, string> = {
    "Launch Ready":            "is positioned to launch and convert at premium pricing",
    "Refine Before Scaling":   "shows meaningful potential but requires targeted refinement before scaling",
    "High Risk":               "carries significant structural risk that will suppress conversion rates",
    "Do Not Launch":           "has critical gaps that make it unready for market",
  };
  const s1 = `${offerName} (${priceStr}) scores ${score}/70 — Grade ${grade.label} — and ${verdictMap[verdict] ?? "requires review"}.`;

  // Sentence 2: top strength
  const strengthMap: Record<string, string> = {
    "Problem Severity":   "The offer's problem framing is its clearest asset, creating urgency that draws serious buyers.",
    "Buyer Readiness":    "Buyer qualification and readiness signals are strong, reducing wasted sales conversations.",
    "Outcome Specificity":"The outcome promise is specific and time-bound, giving buyers a clear picture of success.",
    "Differentiation":    "The offer's differentiation is its standout advantage, making comparison-shopping difficult.",
    "Proof & Credibility":"Strong social proof and credibility markers build buyer confidence before the sales call.",
    "Delivery Feasibility":"The delivery model is operationally sound, supporting consistent client results at scale.",
    "Value Justification":"The value justification is compelling and makes the price feel like an investment, not a cost.",
  };
  const s2 = strengthMap[topPillar.name] ?? `${topPillar.name} is the strongest pillar at ${topPillar.score}/10.`;

  // Sentence 3: top risk
  const riskMap: Record<string, string> = {
    "Problem Severity":   "The primary weakness is problem framing — without a sharper pain narrative, buyers will hesitate.",
    "Buyer Readiness":    "Buyer readiness is the critical gap; unqualified prospects entering the pipeline will drag close rates down.",
    "Outcome Specificity":"Vague outcome promises are the core liability — specificity is the single fastest lever to pull.",
    "Differentiation":    "Weak differentiation exposes the offer to commoditization; buyers need a structural reason to choose it.",
    "Proof & Credibility":"Thin proof reduces buyer confidence at the point of decision — one quantified case study would change this.",
    "Delivery Feasibility":"Delivery feasibility concerns create downstream refund and retention risk that will erode referrals.",
    "Value Justification":"Price justification is the primary blocker — without ROI framing, buyers anchor on the number, not the return.",
  };
  const s3 = riskMap[bottomPillar.name] ?? `${bottomPillar.name} is the weakest pillar at ${bottomPillar.score}/10 and requires immediate attention.`;

  // Sentence 4: recommendation
  const recs = bottomPillar.recommendations ?? [];
  const topRec = recs.find((r: any) => r.priority === "High") ?? recs[0];
  const s4 = topRec
    ? `The highest-leverage action is to ${topRec.action.charAt(0).toLowerCase()}${topRec.action.slice(1)}`
    : `Focus remediation effort on ${bottomPillar.name} first for the fastest score improvement.`;

  // Sentence 5: closing context
  const closeMeter = computeCloseProbMeter(report);
  const s5 = `With estimated close probability in the ${closeMeter.rangeLabel} range (confidence: ${closeMeter.confidence}), the offer is ${pct >= 65 ? "competitive" : "not yet market-ready"} for its price point.`;

  // Sentence 6 (optional): price positioning if competitor data present
  const sentences = [s1, s2, s3, s4, s5];
  const benchmark = computePriceBenchmark(report, competitors);
  if (benchmark.hasData) {
    const avgStr = `$${benchmark.avgPrice.toLocaleString()}`;
    const posMap: Record<PricePositionLabel, string> = {
      Premium: `At ${benchmark.positionLabel} positioning (${(report.meta.price / benchmark.avgPrice * 100 - 100).toFixed(0)}% above the $${benchmark.avgPrice.toLocaleString()} competitor average), buyers will demand proportionally stronger proof and clearer differentiation.`,
      Market:  `At ${benchmark.positionLabel} positioning (near the ${avgStr} competitor average), your close rate will hinge on differentiation quality and proof, not price.`,
      Budget:  `At ${benchmark.positionLabel} positioning (below the ${avgStr} competitor average), consider raising the price alongside stronger proof to avoid attracting the wrong buyer.`,
    };
    sentences.push(posMap[benchmark.positionLabel]);
  }

  return {
    sentences,
    topStrengthPillar: topPillar.name,
    topRiskPillar: bottomPillar.name,
    priceBenchmark: benchmark,
  };
}
