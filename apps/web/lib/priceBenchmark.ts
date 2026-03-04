/**
 * OfferIntegrity Step 2 — Price Benchmark
 * Pure derived display layer. No scoring changes. No external dependencies.
 * Computes average, median, and positioning label from competitor price data.
 */

export type PricePositionLabel = "Premium" | "Market" | "Budget";

export interface PriceBenchmarkResult {
  hasData: boolean;
  competitorCount: number;
  avgPrice: number;
  medianPrice: number;
  userPrice: number;
  positionLabel: PricePositionLabel | null;
  /** Formatted strings for display */
  avgPriceFormatted: string;
  medianPriceFormatted: string;
  userPriceFormatted: string;
  /** Short implication sentence for the label */
  positionImplication: string;
  /** One-sentence description for the exec summary */
  execSentence: string;
}

function parsePriceUSD(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

function formatUSD(n: number): string {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

const IMPLICATIONS: Record<PricePositionLabel, string> = {
  Premium:
    "Your price sits above the market average — buyers expect correspondingly stronger proof, outcome specificity, and a named mechanism to justify the premium.",
  Market:
    "Your price is in line with the market — differentiation and proof become the deciding factor since price alone won't tip the decision.",
  Budget:
    "Your price is below the market average — this may attract volume but can signal lower perceived value at the high-ticket tier; consider whether ROI framing could support a higher anchor.",
};

export function computePriceBenchmark(
  userPrice: number,
  competitors: { name: string; price: string; promise: string }[]
): PriceBenchmarkResult {
  if (!competitors || competitors.length === 0) {
    return {
      hasData: false,
      competitorCount: 0,
      avgPrice: 0,
      medianPrice: 0,
      userPrice,
      positionLabel: null,
      avgPriceFormatted: "—",
      medianPriceFormatted: "—",
      userPriceFormatted: formatUSD(userPrice),
      positionImplication: "",
      execSentence: "",
    };
  }

  const prices = competitors
    .map((c) => parsePriceUSD(c.price))
    .filter((p) => p > 0);

  if (prices.length === 0) {
    return {
      hasData: false,
      competitorCount: competitors.length,
      avgPrice: 0,
      medianPrice: 0,
      userPrice,
      positionLabel: null,
      avgPriceFormatted: "—",
      medianPriceFormatted: "—",
      userPriceFormatted: formatUSD(userPrice),
      positionImplication: "",
      execSentence: "",
    };
  }

  const avgPrice = Math.round(
    prices.reduce((a, b) => a + b, 0) / prices.length
  );
  const medianPrice = median(prices);

  let positionLabel: PricePositionLabel;
  if (userPrice >= avgPrice * 1.25) {
    positionLabel = "Premium";
  } else if (userPrice <= avgPrice * 0.75) {
    positionLabel = "Budget";
  } else {
    positionLabel = "Market";
  }

  const positionImplication = IMPLICATIONS[positionLabel];

  const execSentence = `Priced at ${formatUSD(userPrice)} against a competitor average of ${formatUSD(avgPrice)}, this offer is positioned as ${positionLabel} — ${
    positionLabel === "Premium"
      ? "a premium that demands airtight proof and a clear named mechanism."
      : positionLabel === "Budget"
      ? "a budget option that risks undervaluing the delivery; consider ROI anchoring to justify the investment."
      : "a market-rate offer where differentiation and proof are the key conversion levers."
  }`;

  return {
    hasData: true,
    competitorCount: competitors.length,
    avgPrice,
    medianPrice,
    userPrice,
    positionLabel,
    avgPriceFormatted: formatUSD(avgPrice),
    medianPriceFormatted: formatUSD(medianPrice),
    userPriceFormatted: formatUSD(userPrice),
    positionImplication,
    execSentence,
  };
}
