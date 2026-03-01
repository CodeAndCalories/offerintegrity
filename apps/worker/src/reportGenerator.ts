import { IntakeData, ReportJson } from "./types";

export async function generateReport(
  intake: IntakeData,
  useRealAI: boolean,
  openAIKey?: string
): Promise<ReportJson> {
  if (useRealAI && openAIKey) {
    return generateWithAI(intake, openAIKey);
  }
  return generateMock(intake);
}

function generateMock(intake: IntakeData): ReportJson {
  const price = parseFloat(intake.price) || 5000;
  const now = new Date().toISOString();

  const pillarScores = [7, 6, 8, 5, 6, 7, 8];
  const total = pillarScores.reduce((a, b) => a + b, 0);
  const percent = Math.round((total / 70) * 100);

  let verdict: ReportJson["overall"]["verdict"];
  if (percent >= 80) verdict = "Launch Ready";
  else if (percent >= 60) verdict = "Refine Before Scaling";
  else if (percent >= 40) verdict = "High Risk";
  else verdict = "Do Not Launch";

  return {
    meta: {
      offerName: intake.offerName || "Your Offer",
      price,
      generatedAt: now,
      currency: "USD",
    },
    overall: {
      scoreTotal: total,
      scorePercent: percent,
      verdict,
      topRisks: [
        "Proof assets may not be compelling enough for a high-ticket purchase",
        "Competitive differentiation needs sharper articulation",
        "Sales cycle length vs. current audience size creates pipeline risk",
      ],
      topStrengths: [
        "Clearly defined desired outcome with measurable result",
        "Delivery format matches buyer expectations",
        "Pricing is in range for the stated buyer segment",
      ],
    },
    pillars: [
      {
        id: "severity",
        name: "Problem Severity & Cost of Inaction",
        score: 7,
        whyItMatters:
          "High-ticket buyers must feel the pain acutely enough to justify investment. Weak problem framing is the #1 reason deals stall.",
        whatYouHave: [
          `Problem identified: "${intake.problemStatement?.slice(0, 80) || "stated problem"}"`,
          "Cost of inaction articulated",
        ],
        gaps: [
          "Cost of inaction could be quantified in dollar or time terms",
          "Urgency trigger not clearly defined",
        ],
        recommendations: [
          {
            priority: "High",
            action: "Add a specific dollar or time cost to your inaction statement (e.g. '$200k/year in lost revenue')",
            expectedImpact: "Increases perceived urgency and justifies price",
          },
          {
            priority: "Medium",
            action: "Add a before/after case study tied directly to the problem",
            expectedImpact: "Reduces skepticism from cold prospects",
          },
        ],
        riskFlags: [
          {
            level: "Medium",
            flag: "Inaction cost is qualitative",
            reason: "Without quantification, buyers can rationalize delay",
          },
        ],
      },
      {
        id: "readiness",
        name: "Buyer Readiness & Purchasing Power",
        score: 6,
        whyItMatters:
          "Even a perfect offer fails when sold to buyers who can't decide or can't pay. Misaligned ICP is the fastest path to a long sales cycle.",
        whatYouHave: [
          `Target role: ${intake.icpRole || "defined"}`,
          `Buyer stage: ${intake.icpStage || "defined"}`,
          `Budget range: ${intake.icpIncomeOrBudgetRange || "stated"}`,
        ],
        gaps: [
          "Buyer authority level may introduce approval friction",
          "No stated trigger event that creates urgency to buy now",
        ],
        recommendations: [
          {
            priority: "High",
            action: "Define 2-3 trigger events that indicate a buyer is 'in-market' right now",
            expectedImpact: "Improves lead qualification and conversion rate",
          },
          {
            priority: "Low",
            action: "Create a buyer checklist to pre-qualify on calls",
            expectedImpact: "Reduces time wasted on unqualified discovery",
          },
        ],
        riskFlags: [
          {
            level: "Medium",
            flag: `Buyer authority: ${intake.buyerAuthority}`,
            reason: "Non-owner buyers may require additional approval steps, extending the sales cycle",
          },
        ],
      },
      {
        id: "outcome",
        name: "Outcome Specificity & Tangibility",
        score: 8,
        whyItMatters:
          "High-ticket buyers buy outcomes, not deliverables. Vague outcomes kill conversion; specific, time-bound outcomes build confidence.",
        whatYouHave: [
          `Desired outcome: "${intake.desiredOutcome?.slice(0, 80) || "defined"}"`,
          `Time to outcome: ${intake.timeToOutcome || "stated"}`,
        ],
        gaps: ["Outcome could include a specific metric or benchmark"],
        recommendations: [
          {
            priority: "Medium",
            action: "Express your outcome as 'X result in Y timeframe without Z obstacle'",
            expectedImpact: "Makes the promise concrete and memorable",
          },
        ],
        riskFlags: [],
      },
      {
        id: "differentiation",
        name: "Differentiation & Competitive Edge",
        score: 5,
        whyItMatters:
          "At high ticket prices, buyers comparison-shop. Without a clear, defensible unique mechanism, you compete on price.",
        whatYouHave: [
          `Unique mechanism: "${intake.uniqueMechanism?.slice(0, 80) || "stated"}"`,
          `Alternatives identified: ${intake.mainAlternatives || "yes"}`,
        ],
        gaps: [
          "Unique mechanism needs a proprietary-sounding name",
          "No clear articulation of why alternatives fail",
        ],
        recommendations: [
          {
            priority: "High",
            action: "Give your unique mechanism a proprietary name (e.g. 'The Revenue Sequencing Method')",
            expectedImpact: "Instantly differentiates and is harder to commoditize",
          },
          {
            priority: "High",
            action: "Write a direct comparison showing why alternatives leave buyers stuck",
            expectedImpact: "Preempts objections and positions you as the obvious choice",
          },
        ],
        riskFlags: [
          {
            level: "High",
            flag: "Unnamed mechanism",
            reason: "Unnamed processes are forgettable and easier for competitors to copy",
          },
        ],
      },
      {
        id: "proof",
        name: "Proof & Credibility Assets",
        score: 6,
        whyItMatters:
          "At $3k+, buyers need to trust you before they trust your offer. Proof collapses skepticism faster than any copy.",
        whatYouHave: [`Proof assets: ${intake.proofAssets || "listed"}`],
        gaps: [
          "Case studies should show before/after with specific metrics",
          "Social proof from recognizable names or brands amplifies trust",
        ],
        recommendations: [
          {
            priority: "High",
            action: "Document 1-3 client wins with specific metrics (revenue, time saved, leads generated)",
            expectedImpact: "Dramatically increases conversion on sales calls",
          },
          {
            priority: "Medium",
            action: "Add a short video testimonial to your sales page",
            expectedImpact: "Video proof converts 2-3x better than text testimonials",
          },
        ],
        riskFlags: [
          {
            level: "Medium",
            flag: "Proof assets may be thin for price point",
            reason: `At $${price.toLocaleString()}, buyers expect substantial social proof`,
          },
        ],
      },
      {
        id: "delivery",
        name: "Delivery Feasibility & Capacity",
        score: 7,
        whyItMatters:
          "Overselling delivery capacity leads to burnout, churn, and refund requests. Sustainable capacity is a revenue multiplier.",
        whatYouHave: [
          `Weekly time commitment: ${intake.weeklyTimeRequiredFromYou || "stated"}`,
          `Capacity per month: ${intake.capacityPerMonth || "stated"}`,
        ],
        gaps: ["Key dependencies could create delivery risk if not systematized"],
        recommendations: [
          {
            priority: "Medium",
            action: `Document your delivery process into a repeatable SOP before hitting ${intake.capacityPerMonth || "max"} clients`,
            expectedImpact: "Enables delegation and reduces delivery risk",
          },
        ],
        riskFlags:
          intake.keyDependencies
            ? [
                {
                  level: "Low",
                  flag: "External dependencies identified",
                  reason: "Dependencies on third parties can create delivery delays",
                },
              ]
            : [],
      },
      {
        id: "value",
        name: "Offer Structure & Value Justification",
        score: 8,
        whyItMatters:
          "Buyers must feel they're getting 10x value. The stacking of deliverables and bonuses anchors perceived value above price.",
        whatYouHave: [
          `Price: $${price.toLocaleString()}`,
          `Format: ${intake.deliveryFormat || "stated"}`,
          `Duration: ${intake.durationWeeks || "stated"} weeks`,
        ],
        gaps: ["Value stack not fully itemized with individual component values"],
        recommendations: [
          {
            priority: "Medium",
            action: "Create a value stack that itemizes each component with an individual dollar value totaling 10x price",
            expectedImpact: "Makes the price feel like a bargain rather than an expense",
          },
        ],
        riskFlags: [],
      },
    ],
    recommendationPlan: {
      next7Days: [
        "Name and document your unique mechanism",
        "Quantify cost of inaction with a specific dollar or time figure",
        "Collect at least 1 metric-based testimonial from a past client",
      ],
      next14Days: [
        "Rewrite your offer headline using the 'X result in Y time without Z obstacle' framework",
        "Draft a 1-page comparison showing why alternatives fail",
        "Define 3 trigger events that indicate a buyer is in-market",
      ],
      next30Days: [
        "Create a 10x value stack with itemized components",
        "Record a short 60-second video testimonial with your best client",
        "Document your delivery process into a repeatable SOP",
      ],
    },
  };
}

async function generateWithAI(intake: IntakeData, apiKey: string): Promise<ReportJson> {
  const prompt = `You are an expert high-ticket offer strategist. Analyze the following offer and return ONLY a JSON object matching the exact schema provided. No markdown, no explanation, just raw JSON.

OFFER DATA:
${JSON.stringify(intake, null, 2)}

REQUIRED JSON SCHEMA:
{
  "meta": { "offerName": string, "price": number, "generatedAt": ISO string, "currency": "USD" },
  "overall": {
    "scoreTotal": number (0-70, sum of all pillar scores),
    "scorePercent": number (0-100),
    "verdict": "Launch Ready" | "Refine Before Scaling" | "High Risk" | "Do Not Launch",
    "topRisks": string[] (3-5 items),
    "topStrengths": string[] (3-5 items)
  },
  "pillars": [7 pillars: severity, readiness, outcome, differentiation, proof, delivery, value],
  each pillar: { id, name, score (0-10), whyItMatters, whatYouHave: string[], gaps: string[], recommendations: [{priority, action, expectedImpact}], riskFlags: [{level, flag, reason}] },
  "recommendationPlan": { "next7Days": string[], "next14Days": string[], "next30Days": string[] }
}

Score each pillar 0-10 based on the intake. Be direct, specific, and actionable. Return only valid JSON.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json() as any;
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("No content from OpenAI");

  const report = JSON.parse(content) as ReportJson;
  // Ensure generatedAt is set
  report.meta.generatedAt = new Date().toISOString();
  return report;
}
