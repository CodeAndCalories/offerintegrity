import { ReportJson } from "./types";

// Generate a simple text-based PDF using raw PDF syntax
// This avoids external dependencies while working in a Worker environment
export function generatePDF(report: ReportJson): Uint8Array {
  const lines: string[] = [];

  const verdictColor = getVerdictColor(report.overall.verdict);

  // Build text content
  lines.push("OFFER INTEGRITY REPORT");
  lines.push("=" .repeat(60));
  lines.push(`Offer: ${report.meta.offerName}`);
  lines.push(`Price: $${report.meta.price.toLocaleString()} USD`);
  lines.push(`Generated: ${new Date(report.meta.generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  lines.push("");

  // ── UI-1: Executive Summary ──────────────────────────────────────────────
  const pct: number = report.overall.scorePercent;
  const scoreTot: number = report.overall.scoreTotal;

  // Grade
  function ui1Grade(p: number): string {
    if (p >= 90) return "A+"; if (p >= 83) return "A"; if (p >= 77) return "A-";
    if (p >= 72) return "B+"; if (p >= 65) return "B"; if (p >= 58) return "B-";
    if (p >= 50) return "C+"; if (p >= 43) return "C"; if (p >= 36) return "C-";
    return "D";
  }
  function ui1GradeTagline(p: number): string {
    if (p >= 90) return "Exceptional — ready to scale";
    if (p >= 83) return "Strong — minor polish needed";
    if (p >= 77) return "Solid — a few gaps to close";
    if (p >= 72) return "Above average — refine before scaling";
    if (p >= 65) return "Promising — targeted work required";
    if (p >= 58) return "Moderate — notable gaps present";
    if (p >= 50) return "Below average — significant rework needed";
    if (p >= 43) return "Weak — foundational issues";
    if (p >= 36) return "High risk — do not scale";
    return "Do not launch — critical failures";
  }

  const pillars: any[] = report.pillars;
  const sorted = [...pillars].sort((a: any, b: any) => b.score - a.score);
  const topPillar  = sorted[0];
  const weakPillar = sorted[sorted.length - 1];
  const grade = ui1Grade(pct);

  // Close probability
  let cpLow: number, cpHigh: number;
  if (pct >= 80)      { cpLow = 28; cpHigh = 45; }
  else if (pct >= 65) { cpLow = 18; cpHigh = 30; }
  else if (pct >= 50) { cpLow = 10; cpHigh = 20; }
  else                { cpLow = 4;  cpHigh = 12; }

  function ps(id: string): number {
    return (pillars.find((p: any) => p.id === id) as any)?.score ?? 5;
  }
  const confScore = (ps("proof") + ps("differentiation") + ps("readiness")) / 3;
  const confidence = confScore >= 7 ? "High" : confScore >= 5 ? "Moderate" : "Low";

  lines.push("EXECUTIVE SUMMARY");
  lines.push("=" .repeat(60));
  lines.push(`Grade: ${grade}  |  Score: ${scoreTot}/70 (${pct}%)  |  Verdict: ${report.overall.verdict}`);
  lines.push(`Grade Meaning: ${ui1GradeTagline(pct)}`);
  lines.push("");
  const verdictMap: Record<string, string> = {
    "Launch Ready":           "is positioned to launch and convert at premium pricing",
    "Refine Before Scaling":  "shows meaningful potential but requires targeted refinement before scaling",
    "High Risk":              "carries significant structural risk that will suppress conversion rates",
    "Do Not Launch":          "has critical gaps that make it unready for market",
  };
  lines.push(`${report.meta.offerName} ($${report.meta.price.toLocaleString()}) scores ${scoreTot}/70 — Grade ${grade} — and ${verdictMap[report.overall.verdict] ?? "requires review"}.`);
  lines.push(`Top Strength: ${topPillar.name} (${topPillar.score}/10)`);
  lines.push(`Top Risk:     ${weakPillar.name} (${weakPillar.score}/10)`);
  const topRec = (weakPillar.recommendations ?? []).find((r: any) => r.priority === "High") ?? weakPillar.recommendations?.[0];
  if (topRec) lines.push(`Key Action:   ${topRec.action}`);
  lines.push(`Close Probability: ${cpLow}–${cpHigh}%  (Confidence: ${confidence})`);

  // Price positioning sentence if competitor data present
  const rawCompetitors: { name: string; price: string; promise: string }[] =
    (report as any)._competitors ?? [];
  const benchPrices = rawCompetitors
    .map((c) => parseFloat(c.price.replace(/[^0-9.]/g, "")) || 0)
    .filter((p) => p > 0);
  if (benchPrices.length > 0) {
    const benchAvg = Math.round(benchPrices.reduce((a, b) => a + b, 0) / benchPrices.length);
    const userP = report.meta.price as number;
    const posLabel =
      userP >= benchAvg * 1.25 ? "Premium" :
      userP <= benchAvg * 0.75 ? "Budget" : "Market";
    const posImplication: Record<string, string> = {
      Premium: `premium pricing (${((userP / benchAvg - 1) * 100).toFixed(0)}% above avg) — buyers expect stronger proof and differentiation.`,
      Market:  `market-rate pricing (near the $${benchAvg.toLocaleString()} competitor average) — differentiation quality will determine wins.`,
      Budget:  `below-market pricing ($${benchAvg.toLocaleString()} avg) — consider raising price alongside stronger proof.`,
    };
    lines.push(`Price Position: ${posLabel} — ${posImplication[posLabel]}`);
  }
  lines.push("");

  // ── UI-1: Pillar Ranking ─────────────────────────────────────────────────
  lines.push("PILLAR RANKING");
  lines.push("-".repeat(40));
  lines.push("Strongest Areas:");
  sorted.slice(0, 3).forEach((p: any, i: number) =>
    lines.push(`  ${i + 1}. ${p.name.padEnd(26)} ${scoreBar(p.score)}`)
  );
  lines.push("Weakest Areas:");
  sorted.slice(-3).reverse().forEach((p: any, i: number) =>
    lines.push(`  ${i + 1}. ${p.name.padEnd(26)} ${scoreBar(p.score)}`)
  );
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("OVERALL SCORE");
  lines.push("-".repeat(40));
  lines.push(`Score: ${report.overall.scoreTotal}/70 (${report.overall.scorePercent}%)`);
  lines.push(`Verdict: ${report.overall.verdict}`);
  lines.push("");
  lines.push("TOP STRENGTHS:");
  report.overall.topStrengths.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
  lines.push("");
  lines.push("TOP RISKS:");
  report.overall.topRisks.forEach((r, i) => lines.push(`  ${i + 1}. ${r}`));
  lines.push("");
  lines.push("PILLAR SCORES");
  lines.push("=" .repeat(60));

  report.pillars.forEach((p) => {
    lines.push("");
    lines.push(`${p.name.toUpperCase()} — ${p.score}/10`);
    lines.push(scoreBar(p.score));
    lines.push(`Why it matters: ${p.whyItMatters}`);
    if (p.whatYouHave.length > 0) {
      lines.push("What you have:");
      p.whatYouHave.forEach((w) => lines.push(`  + ${w}`));
    }
    if (p.gaps.length > 0) {
      lines.push("Gaps:");
      p.gaps.forEach((g) => lines.push(`  - ${g}`));
    }
    if (p.recommendations.length > 0) {
      lines.push("Recommendations:");
      p.recommendations.forEach((r) => lines.push(`  [${r.priority}] ${r.action}`));
    }
    if (p.riskFlags.length > 0) {
      lines.push("Risk Flags:");
      p.riskFlags.forEach((rf) => lines.push(`  [${rf.level}] ${rf.flag}: ${rf.reason}`));
    }
  });

  lines.push("");
  lines.push("=" .repeat(60));
  lines.push("30-DAY ACTION PLAN");
  lines.push("=" .repeat(60));
  lines.push("");
  lines.push("NEXT 7 DAYS:");
  report.recommendationPlan.next7Days.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
  lines.push("");
  lines.push("NEXT 14 DAYS:");
  report.recommendationPlan.next14Days.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
  lines.push("");
  lines.push("NEXT 30 DAYS:");
  report.recommendationPlan.next30Days.forEach((a, i) => lines.push(`  ${i + 1}. ${a}`));
  lines.push("");
  lines.push("=" .repeat(60));
  lines.push("Generated by OfferIntegrity.io");

  // V2 Intelligence summary (appended if present)
  if ((report as any).v2) {
    const v2 = (report as any).v2;
    lines.push("");
    lines.push("=".repeat(60));
    lines.push("V2 INTELLIGENCE SUMMARY");
    lines.push("=".repeat(60));
    if (v2.closeProbabilityRange)
      lines.push(`  Close Probability Range : ${v2.closeProbabilityRange}`);
    if (v2.riskBand)
      lines.push(`  Overall Risk Band       : ${v2.riskBand}`);
    if (v2.supportedPriceBand)
      lines.push(`  Supported Price Band    : ${v2.supportedPriceBand}`);
    if (v2.fragilityLabel)
      lines.push(`  Offer Fragility         : ${v2.fragilityLabel}`);
    lines.push("");
  }

  // V2.5 Market Intelligence summary (appended if present)
  if ((report as any).v25) {
    const v25 = (report as any).v25;
    lines.push("");
    lines.push("=".repeat(60));
    lines.push("V2.5 MARKET INTELLIGENCE SUMMARY");
    lines.push("=".repeat(60));
    lines.push("");

    lines.push("MARKET SATURATION");
    lines.push("-".repeat(40));
    if (v25.marketSaturationLevel)
      lines.push(`  Saturation Level        : ${v25.marketSaturationLevel}`);
    if (v25.marketSaturationSummary)
      lines.push(`  Summary                 : ${v25.marketSaturationSummary}`);
    if (v25.saturationSignals?.length) {
      lines.push("  Market Signals:");
      (v25.saturationSignals as string[]).forEach((s: string) => lines.push(`    - ${s}`));
    }
    lines.push("");

    lines.push("DIFFERENTIATION GAP");
    lines.push("-".repeat(40));
    if (v25.differentiationClarityLabel)
      lines.push(`  Clarity                 : ${v25.differentiationClarityLabel} (${v25.differentiationClarityScore ?? "—"}/100)`);
    if (v25.differentiationWarnings?.length) {
      lines.push("  Warnings:");
      (v25.differentiationWarnings as string[]).forEach((w: string) => lines.push(`    ! ${w}`));
    }
    lines.push("");

    lines.push("OFFER CONFIDENCE SCORE");
    lines.push("-".repeat(40));
    if (v25.offerConfidenceLevel)
      lines.push(`  Confidence              : ${v25.offerConfidenceLevel} (${v25.offerConfidenceScore ?? "—"}/100)`);
    if (v25.offerConfidenceExplanation)
      lines.push(`  Explanation             : ${v25.offerConfidenceExplanation}`);
    lines.push("");

    lines.push("MECHANISM CLARITY");
    lines.push("-".repeat(40));
    if (v25.mechanismClarityRating)
      lines.push(`  Clarity Rating          : ${v25.mechanismClarityRating}`);
    if (v25.mechanismFlags?.length) {
      lines.push("  Flags:");
      (v25.mechanismFlags as string[]).forEach((f: string) => lines.push(`    ${f}`));
    }
    if (v25.mechanismSuggestedFix)
      lines.push(`  Suggested Fix           : ${v25.mechanismSuggestedFix}`);
    lines.push("");
  }

  // Price Benchmark block (appended if competitor data was stored)
  const pdfCompetitors: { name: string; price: string; promise: string }[] =
    (report as any)._competitors ?? [];
  const pdfPrices = pdfCompetitors
    .map((c) => parseFloat(c.price.replace(/[^0-9.]/g, "")) || 0)
    .filter((p) => p > 0);
  lines.push("");
  lines.push("=".repeat(60));
  lines.push("PRICE BENCHMARK");
  lines.push("=".repeat(60));
  lines.push("");
  if (pdfPrices.length === 0) {
    lines.push("  No competitor data provided — price positioning not benchmarked.");
  } else {
    const pdfAvg    = Math.round(pdfPrices.reduce((a, b) => a + b, 0) / pdfPrices.length);
    const pdfSorted = [...pdfPrices].sort((a, b) => a - b);
    const pdfMid    = Math.floor(pdfSorted.length / 2);
    const pdfMedian = Math.round(
      pdfSorted.length % 2 === 0
        ? (pdfSorted[pdfMid - 1] + pdfSorted[pdfMid]) / 2
        : pdfSorted[pdfMid]
    );
    const userP2 = report.meta.price as number;
    const posLabel2 =
      userP2 >= pdfAvg * 1.25 ? "Premium" :
      userP2 <= pdfAvg * 0.75 ? "Budget" : "Market";
    const posImplication2: Record<string, string> = {
      Premium: "Buyers expect stronger proof, clearer differentiation, and higher-touch delivery to justify the premium.",
      Market:  "Differentiation and proof quality, not price, will determine who wins the deal.",
      Budget:  "May attract price-sensitive buyers. Consider raising price alongside stronger proof to protect perceived value.",
    };
    lines.push(`  Your Price              : $${userP2.toLocaleString()}`);
    lines.push(`  Avg Competitor Price    : $${pdfAvg.toLocaleString()}`);
    lines.push(`  Median Competitor Price : $${pdfMedian.toLocaleString()}`);
    lines.push(`  Competitors Analyzed    : ${pdfPrices.length}`);
    lines.push(`  Positioning             : ${posLabel2}`);
    lines.push("");
    lines.push(`  Implication: ${posImplication2[posLabel2]}`);
  }
  lines.push("");

  const textContent = lines.join("\n");

  // Build minimal valid PDF
  return buildMinimalPDF(textContent, report);
}

function scoreBar(score: number): string {
  const filled = Math.round(score);
  const empty = 10 - filled;
  return `  [${"█".repeat(filled)}${"░".repeat(empty)}] ${score}/10`;
}

function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case "Launch Ready": return "0.2 0.7 0.3";
    case "Refine Before Scaling": return "0.9 0.7 0.1";
    case "High Risk": return "0.9 0.4 0.1";
    case "Do Not Launch": return "0.8 0.1 0.1";
    default: return "0.5 0.5 0.5";
  }
}

function buildMinimalPDF(text: string, report: ReportJson): Uint8Array {
  // We'll build a proper minimal PDF from scratch
  const encoder = new TextEncoder();

  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const lineHeight = 14;
  const fontSize = 10;
  const maxWidth = pageWidth - margin * 2;

  // Split text into lines that fit
  const rawLines = text.split("\n");
  const allLines: string[] = [];
  for (const line of rawLines) {
    // Rough char width estimate: ~6px per char at font size 10
    const maxChars = Math.floor(maxWidth / 5.5);
    if (line.length <= maxChars) {
      allLines.push(line);
    } else {
      // Word wrap
      const words = line.split(" ");
      let current = "";
      for (const word of words) {
        if ((current + " " + word).trim().length <= maxChars) {
          current = (current + " " + word).trim();
        } else {
          if (current) allLines.push(current);
          current = word;
        }
      }
      if (current) allLines.push(current);
    }
  }

  // Paginate
  const linesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);
  const pages: string[][] = [];
  for (let i = 0; i < allLines.length; i += linesPerPage) {
    pages.push(allLines.slice(i, i + linesPerPage));
  }

  // Build PDF objects
  const objects: string[] = [];
  const offsets: number[] = [];
  let pos = 0;

  function addObj(content: string): number {
    const idx = objects.length + 1;
    offsets.push(pos);
    const obj = `${idx} 0 obj\n${content}\nendobj\n`;
    objects.push(obj);
    pos += encoder.encode(obj).length;
    return idx;
  }

  // We'll accumulate bytes
  const parts: string[] = [];
  const header = "%PDF-1.4\n";
  parts.push(header);
  pos = encoder.encode(header).length;

  // Reset and use parts array approach
  // Simpler: build as string then convert
  let pdf = "%PDF-1.4\n";
  const xrefOffsets: number[] = [];

  function escPDF(s: string): string {
    return s
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  const pdfObjects: Array<{ id: number; content: string }> = [];
  let objId = 1;

  // Font
  const fontId = objId++;
  pdfObjects.push({
    id: fontId,
    content: `<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>`,
  });

  const fontBoldId = objId++;
  pdfObjects.push({
    id: fontBoldId,
    content: `<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold >>`,
  });

  // Page content objects and page objects
  const pageIds: number[] = [];
  const contentIds: number[] = [];

  for (const pageLines of pages) {
    let stream = "BT\n";
    stream += `/F1 10 Tf\n`;
    stream += `${margin} ${pageHeight - margin - lineHeight} Td\n`;
    stream += `${lineHeight} TL\n`;

    for (const line of pageLines) {
      // Bold for headers (lines with = or starting with uppercase words)
      const isBold = line.startsWith("=") || line.startsWith("-") ||
        /^[A-Z][A-Z\s&\/—]+:?$/.test(line.trim());

      if (isBold) {
        stream += `/F2 10 Tf\n`;
      } else {
        stream += `/F1 10 Tf\n`;
      }
      stream += `(${escPDF(line)}) Tj T*\n`;
    }
    stream += "ET";

    const contentId = objId++;
    const streamBytes = encoder.encode(stream);
    pdfObjects.push({
      id: contentId,
      content: `<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream`,
    });
    contentIds.push(contentId);

    const pageId = objId++;
    pageIds.push(pageId);
  }

  const pagesId = objId++;
  const catalogId = objId++;

  // Add page objects
  for (let i = 0; i < pages.length; i++) {
    pdfObjects.push({
      id: pageIds[i],
      content: `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentIds[i]} 0 R /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontBoldId} 0 R >> >> >>`,
    });
  }

  const pageRefs = pageIds.map((id) => `${id} 0 R`).join(" ");
  pdfObjects.push({
    id: pagesId,
    content: `<< /Type /Pages /Kids [${pageRefs}] /Count ${pageIds.length} >>`,
  });

  pdfObjects.push({
    id: catalogId,
    content: `<< /Type /Catalog /Pages ${pagesId} 0 R >>`,
  });

  // Sort by id
  pdfObjects.sort((a, b) => a.id - b.id);

  // Build PDF string
  const offsetMap: number[] = new Array(objId).fill(0);
  let bytePos = encoder.encode(pdf).length;

  for (const obj of pdfObjects) {
    offsetMap[obj.id] = bytePos;
    const objStr = `${obj.id} 0 obj\n${obj.content}\nendobj\n`;
    pdf += objStr;
    bytePos += encoder.encode(objStr).length;
  }

  // xref
  const xrefPos = bytePos;
  pdf += `xref\n0 ${objId}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < objId; i++) {
    pdf += `${String(offsetMap[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objId} /Root ${catalogId} 0 R >>\n`;
  pdf += `startxref\n${xrefPos}\n%%EOF`;

  return encoder.encode(pdf);
}
