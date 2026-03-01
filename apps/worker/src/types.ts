export interface Env {
  OFFER_KV: KVNamespace;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  OPENAI_API_KEY?: string;
  TURNSTILE_SECRET_KEY: string;
  USE_REAL_AI: string;
  WORKER_URL: string;
  APP_URL: string;
}

export interface IntakeData {
  // Step 1
  offerName: string;
  price: string;
  offerType: string;
  deliveryFormat: string;
  durationWeeks: string;
  // Step 2
  icpRole: string;
  icpStage: string;
  icpIncomeOrBudgetRange: string;
  buyerAuthority: string;
  // Step 3
  problemStatement: string;
  costOfInaction: string;
  desiredOutcome: string;
  timeToOutcome: string;
  // Step 4
  uniqueMechanism: string;
  mainAlternatives: string;
  proofAssets: string;
  // Step 5
  weeklyTimeRequiredFromYou: string;
  capacityPerMonth: string;
  keyDependencies: string;
  // Step 6
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
