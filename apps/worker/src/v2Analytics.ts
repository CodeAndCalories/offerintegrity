/**
 * OfferIntegrity V2 Analytics Engine
 * Pure derived layer — does NOT modify scoring or pillars.
 * All inputs come from existing ReportJson shape.
 */

export interface CloseProbabilityResult {
  rangeLow: number;   // e.g. 12
  rangeHigh: number;  // e.g. 20
  confidence: "Low" | "Moderate" | "High";
  drivers: string[];
  summary: string;
}

export interface RiskPredictionResult {
  band: "Low" | "Medium" | "High";
  drivers: string[];           // 3–6 triggered risk drivers
  reductionNote: string;       // how removing one driver helps
}

export interface PriceJustificationResult {
  supportedLow: number;   // USD
  supportedHigh: number;  // USD
  priceConfidence: "Weak" | "Moderate" | "Strong";
  frictionWarnings: string[];   // 2–3
  summary: string;
}

export interface FragilityResult {
  label: "Resilient" | "Balanced" | "Fragile";
  score: number;           // internal 0-100
  drivers: string[];       // exactly 3
  stabilization: string[]; // short suggestions per driver
}

export interface PriorityFixResult {
  fixes: PriorityFix[];   // top 3
}

export interface PriorityFix {
  rank: number;
  source: "score_gap" | "risk_trigger" | "fragility" | "price_friction";
  pillar?: string;
  action: string;
  expectedLift: string;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function pillarScore(pillars: any[], id: string): number {
  return pillars.find((p: any) => p.id === id)?.score ?? 5;
}

function countHighRiskFlags(pillars: any[]): number {
  return pillars.flatMap((p: any) => p.riskFlags ?? []).filter((f: any) => f.level === "High").length;
}

function countHighRecs(pillars: any[]): number {
  return pillars.flatMap((p: any) => p.recommendations ?? []).filter((r: any) => r.priority === "High").length;
}

// ─── Feature 2: Close Probability Range ──────────────────────────────────────

export function computeCloseProbability(report: any): CloseProbabilityResult {
  const pct = report.overall.scorePercent as number; // 0–100
  const pillars = report.pillars as any[];

  const proof = pillarScore(pillars, "proof");
  const diff  = pillarScore(pillars, "differentiation");
  const ready = pillarScore(pillars, "readiness");
  const value = pillarScore(pillars, "value");

  // Base range derived from score band
  let baseLow: number, baseHigh: number;
  if (pct >= 80)      { baseLow = 28; baseHigh = 45; }
  else if (pct >= 65) { baseLow = 18; baseHigh = 30; }
  else if (pct >= 50) { baseLow = 10; baseHigh = 20; }
  else                { baseLow = 4;  baseHigh = 12; }

  // Adjustments (+/- percentage points)
  let adj = 0;
  if (proof >= 8)  adj += 4;
  else if (proof <= 4) adj -= 4;

  if (diff >= 8)   adj += 3;
  else if (diff <= 4) adj -= 3;

  if (ready >= 8)  adj += 3;
  else if (ready <= 4) adj -= 3;

  if (value >= 8)  adj += 2;
  else if (value <= 4) adj -= 2;

  const rangeLow  = Math.max(2,  Math.round(baseLow  + adj));
  const rangeHigh = Math.max(4,  Math.round(baseHigh + adj));

  // Confidence from variance tightness and score
  const spread = rangeHigh - rangeLow;
  let confidence: CloseProbabilityResult["confidence"] =
    pct >= 70 && spread <= 14 ? "High" :
    pct >= 50 && spread <= 20 ? "Moderate" : "Low";

  // Identify top 3 drivers
  const driverCandidates: { score: number; label: string }[] = [
    { score: proof,  label: "Proof & Credibility Assets" },
    { score: diff,   label: "Differentiation & Competitive Edge" },
    { score: ready,  label: "Buyer Readiness & Purchasing Power" },
    { score: value,  label: "Offer Structure & Value Justification" },
  ];

  // Sort by impact: low scores are drags, high are lifts
  driverCandidates.sort((a, b) => a.score - b.score);

  const drivers: string[] = driverCandidates.slice(0, 3).map(d =>
    d.score >= 7
      ? `${d.label} is boosting close probability`
      : `${d.label} is suppressing close rate (${d.score}/10)`
  );

  const summary = `Based on your ${pct}% overall score and pillar weights, estimated close rate on qualified calls is ${rangeLow}–${rangeHigh}%.`;

  return { rangeLow, rangeHigh, confidence, drivers, summary };
}

// ─── Feature 3: Risk Prediction Engine ───────────────────────────────────────

export function computeRiskPrediction(report: any): RiskPredictionResult {
  const pillars = report.pillars as any[];
  const pct     = report.overall.scorePercent as number;
  const price   = report.meta.price as number;

  const triggers: { weight: number; label: string }[] = [];

  // Rule set
  const proof = pillarScore(pillars, "proof");
  const diff  = pillarScore(pillars, "differentiation");
  const ready = pillarScore(pillars, "readiness");
  const sev   = pillarScore(pillars, "severity");
  const out   = pillarScore(pillars, "outcome");
  const del_  = pillarScore(pillars, "delivery");
  const val   = pillarScore(pillars, "value");

  if (proof <= 5)     triggers.push({ weight: 3, label: "Thin proof stack for price point" });
  if (diff <= 5)      triggers.push({ weight: 3, label: "Weak differentiation — commodity risk" });
  if (ready <= 5)     triggers.push({ weight: 2, label: "Buyer readiness gap — extended sales cycle likely" });
  if (sev <= 5)       triggers.push({ weight: 2, label: "Problem severity underdeveloped — urgency will be low" });
  if (out <= 5)       triggers.push({ weight: 2, label: "Vague outcome promise — buyer confidence at risk" });
  if (del_ <= 5)      triggers.push({ weight: 1, label: "Delivery feasibility concerns identified" });
  if (val <= 5)       triggers.push({ weight: 2, label: "Value justification below threshold for price" });
  if (price > 10000 && proof <= 6)
                      triggers.push({ weight: 3, label: "High price with moderate proof — objection surface is wide" });
  if (countHighRiskFlags(pillars) >= 3)
                      triggers.push({ weight: 2, label: "Multiple high-severity risk flags across pillars" });

  // Sort by weight descending, take top 6
  triggers.sort((a, b) => b.weight - a.weight);
  const topTriggers = triggers.slice(0, 6);

  // Score band
  const riskScore = topTriggers.reduce((s, t) => s + t.weight, 0);
  const band: RiskPredictionResult["band"] =
    riskScore >= 10 || pct < 45  ? "High"   :
    riskScore >= 5  || pct < 65  ? "Medium" : "Low";

  const drivers = topTriggers.length > 0
    ? topTriggers.map(t => t.label)
    : ["No significant risk triggers detected"];

  // Pick highest-weight trigger for reduction note
  const top = topTriggers[0];
  let reductionNote = "Addressing your top risk driver would move the overall band one level lower.";
  if (top) {
    reductionNote = `Resolving "${top.label}" has the highest individual risk weight and, if addressed, would likely shift your overall band from ${band} toward ${band === "High" ? "Medium" : "Low"}.`;
  }

  return { band, drivers, reductionNote };
}

// ─── Feature 5: Price Justification Index ────────────────────────────────────

export function computePriceJustification(report: any): PriceJustificationResult {
  const pillars = report.pillars as any[];
  const askPrice = report.meta.price as number;

  const proof  = pillarScore(pillars, "proof");
  const diff   = pillarScore(pillars, "differentiation");
  const val    = pillarScore(pillars, "value");
  const ready  = pillarScore(pillars, "readiness");

  // Score 0–40 composite
  const composite = proof + diff + val + ready; // max 40

  // Supported multiplier on ask price (0.5× to 1.4×)
  const mult = 0.5 + (composite / 40) * 0.9;
  const supportedLow  = Math.round((askPrice * (mult - 0.1)) / 100) * 100;
  const supportedHigh = Math.round((askPrice * (mult + 0.1)) / 100) * 100;

  const priceConfidence: PriceJustificationResult["priceConfidence"] =
    composite >= 30 ? "Strong" :
    composite >= 20 ? "Moderate" : "Weak";

  const frictionWarnings: string[] = [];
  if (proof <= 5)
    frictionWarnings.push("Proof assets are thin — buyers will hesitate at checkout without stronger social proof");
  if (diff <= 5)
    frictionWarnings.push("Unclear differentiation makes price comparison easier for buyers, depressing perceived value");
  if (val <= 5)
    frictionWarnings.push("Value stack not fully articulated — price feels like a cost rather than an investment");
  if (ready <= 5)
    frictionWarnings.push("Low buyer readiness score suggests price sensitivity will surface in objections");

  // Return top 3
  const topWarnings = frictionWarnings.slice(0, 3);

  const summary = `Your offer's proof, differentiation, value clarity, and buyer readiness support a price band of $${supportedLow.toLocaleString()}–$${supportedHigh.toLocaleString()} with ${priceConfidence.toLowerCase()} confidence.`;

  return { supportedLow, supportedHigh, priceConfidence, frictionWarnings: topWarnings, summary };
}

// ─── Feature 6: Offer Fragility Meter ────────────────────────────────────────

export function computeFragility(report: any): FragilityResult {
  const pillars = report.pillars as any[];

  // Identify weakest 3 pillars by score
  const sorted = [...pillars].sort((a: any, b: any) => a.score - b.score);
  const weakest = sorted.slice(0, 3);

  // Fragility score: how concentrated the weakness is
  const worstThreeSum = weakest.reduce((s: number, p: any) => s + p.score, 0);
  const maxPossible   = 30; // 3 pillars × 10
  const fragScore     = Math.round(100 - (worstThreeSum / maxPossible) * 100);

  const label: FragilityResult["label"] =
    fragScore >= 60 ? "Fragile"   :
    fragScore >= 35 ? "Balanced"  : "Resilient";

  const drivers = weakest.map((p: any) => `${p.name} (${p.score}/10)`);

  // Stabilization suggestions per weak pillar
  const STABILIZE: Record<string, string> = {
    proof:           "Document 1–2 client outcomes with specific before/after metrics.",
    differentiation: "Name your unique mechanism and contrast it directly with alternatives.",
    readiness:       "Define 3 trigger events that signal an in-market buyer.",
    severity:        "Quantify cost of inaction in dollars or time lost per quarter.",
    outcome:         "Rewrite your promise as 'X result in Y time without Z obstacle'.",
    delivery:        "Create a repeatable SOP so delivery doesn't depend solely on you.",
    value:           "Build a value stack that totals 10× the offer price.",
  };

  const stabilization = weakest.map((p: any) =>
    STABILIZE[p.id] ?? `Improve ${p.name} to reduce fragility.`
  );

  return { label, score: fragScore, drivers, stabilization };
}

// ─── Feature 10: Smarter Priority Fix Plan ───────────────────────────────────

export function computePriorityFixes(
  report: any,
  risk: RiskPredictionResult,
  fragility: FragilityResult,
  priceJustification: PriceJustificationResult
): PriorityFixResult {
  const pillars = report.pillars as any[];

  // Candidate pool with composite urgency score
  interface Candidate {
    urgency: number;
    source: PriorityFix["source"];
    pillar?: string;
    action: string;
    expectedLift: string;
  }

  const candidates: Candidate[] = [];

  // Score-gap candidates (pillars with score ≤ 6)
  pillars.forEach((p: any) => {
    if (p.score <= 6 && p.recommendations?.length) {
      const highRec = p.recommendations.find((r: any) => r.priority === "High") ?? p.recommendations[0];
      candidates.push({
        urgency: (10 - p.score) * 2,
        source:  "score_gap",
        pillar:  p.name,
        action:  highRec.action,
        expectedLift: highRec.expectedImpact,
      });
    }
  });

  // Risk trigger candidates (top 2)
  risk.drivers.slice(0, 2).forEach((d, i) => {
    // Map driver label to a pillar action
    const riskPillar = pillars.find((p: any) =>
      d.toLowerCase().includes(p.name.toLowerCase().split(" ")[0].toLowerCase())
    );
    if (riskPillar?.recommendations?.length) {
      const rec = riskPillar.recommendations[0];
      candidates.push({
        urgency: 14 - i * 2,
        source:  "risk_trigger",
        pillar:  riskPillar.name,
        action:  rec.action,
        expectedLift: rec.expectedImpact,
      });
    } else {
      candidates.push({
        urgency: 12 - i * 2,
        source:  "risk_trigger",
        action:  `Address: ${d}`,
        expectedLift: "Reduces overall risk band",
      });
    }
  });

  // Fragility candidates (weakest pillar stabilization)
  fragility.drivers.slice(0, 2).forEach((d, i) => {
    candidates.push({
      urgency: 10 - i,
      source:  "fragility",
      action:  fragility.stabilization[i],
      expectedLift: `Stabilizes the ${d} pillar, reducing offer fragility`,
    });
  });

  // Price friction candidates (top warning)
  if (priceJustification.frictionWarnings.length) {
    candidates.push({
      urgency: 8,
      source:  "price_friction",
      action:  priceJustification.frictionWarnings[0],
      expectedLift: "Increases price confidence and reduces checkout abandonment",
    });
  }

  // Deduplicate by action text, sort by urgency, take top 3
  const seen = new Set<string>();
  const unique = candidates.filter(c => {
    const key = c.action.slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => b.urgency - a.urgency);

  const fixes: PriorityFix[] = unique.slice(0, 3).map((c, i) => ({
    rank: i + 1,
    source:       c.source,
    pillar:       c.pillar,
    action:       c.action,
    expectedLift: c.expectedLift,
  }));

  return { fixes };
}

// ─── Convenience: compute all V2 sections at once ────────────────────────────

export interface V2Analytics {
  closeProbability:   CloseProbabilityResult;
  riskPrediction:     RiskPredictionResult;
  priceJustification: PriceJustificationResult;
  fragility:          FragilityResult;
  priorityFixes:      PriorityFixResult;
}

export function computeV2Analytics(report: any): V2Analytics {
  const closeProbability   = computeCloseProbability(report);
  const riskPrediction     = computeRiskPrediction(report);
  const priceJustification = computePriceJustification(report);
  const fragility          = computeFragility(report);
  const priorityFixes      = computePriorityFixes(report, riskPrediction, fragility, priceJustification);

  return { closeProbability, riskPrediction, priceJustification, fragility, priorityFixes };
}
