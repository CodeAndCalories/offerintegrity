export interface Env {
  OFFER_KV: KVNamespace;
  OFFER_R2?: R2Bucket;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  OPENAI_API_KEY?: string;
  TURNSTILE_SECRET_KEY: string;
  USE_REAL_AI: string;
  WORKER_URL: string;
  APP_URL: string;
  PRICE_ID?: string; // Optional Stripe Price ID for $149; falls back to price_data if not set
}

export interface IntakeData {
  offerName: string;
  price: string;
  offerType: string;
  deliveryFormat: string;
  durationWeeks: string;
  icpRole: string;
  icpStage: string;
  icpIncomeOrBudgetRange: string;
  buyerAuthority: string;
  problemStatement: string;
  costOfInaction: string;
  desiredOutcome: string;
  timeToOutcome: string;
  uniqueMechanism: string;
  mainAlternatives: string;
  proofAssets: string;
  weeklyTimeRequiredFromYou: string;
  capacityPerMonth: string;
  keyDependencies: string;
  primaryAcquisitionChannel: string;
  expectedSalesCycle: string;
  currentAudienceSize: string;
}

export interface KVRecord {
  intake: IntakeData;
  reportJson?: ReportJson;
  createdAt: string;
  email: string;
  paid: boolean;
  generated: boolean;
  usageCount: number;
  stripeSessionId: string;
  uploadedFileKeys?: string[]; // R2 object keys for optional uploaded files
}

export interface ReportJson {
  meta: {
    offerName: string;
    price: number;
    generatedAt: string;
    currency: "USD";
  };
  overall: {
    scoreTotal: number;
    scorePercent: number;
    verdict: "Launch Ready" | "Refine Before Scaling" | "High Risk" | "Do Not Launch";
    topRisks: string[];
    topStrengths: string[];
  };
  pillars: PillarResult[];
  recommendationPlan: {
    next7Days: string[];
    next14Days: string[];
    next30Days: string[];
  };
  supportingAssets?: {
    filesReviewed: string[];
    heuristicFlags: string[];
  };
  /** V2 computed analytics — derived at render time; also stored for PDF */
  v2?: {
    closeProbabilityRange?: string;   // e.g. "12–20% (Moderate)"
    riskBand?: string;                // e.g. "Medium"
    supportedPriceBand?: string;      // e.g. "$4,500–$5,500 (Moderate)"
    fragilityLabel?: string;          // e.g. "Balanced"
  };
}

export interface PillarResult {
  id: string;
  name: string;
  score: number;
  whyItMatters: string;
  whatYouHave: string[];
  gaps: string[];
  recommendations: {
    priority: "High" | "Medium" | "Low";
    action: string;
    expectedImpact: string;
  }[];
  riskFlags: {
    level: "High" | "Medium" | "Low";
    flag: string;
    reason: string;
  }[];
}
