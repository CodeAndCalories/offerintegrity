"use client";
export const runtime = "edge";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { createCheckout } from "@/lib/api";

type IntakeData = Record<string, string>;

type Field = {
  key: string;
  label: string;
  required: boolean;
  type: string;
  placeholder?: string;
  maxLen?: number;
  options?: string[];
};

type Step = {
  id: number;
  title: string;
  subtitle: string;
  fields: Field[];
  isUpload?: boolean;
  isCompetitor?: boolean;
  isLast?: boolean;
};

const INTAKE_STEPS: Step[] = [
  {
    id: 1,
    title: "Offer Basics",
    subtitle: "What are you selling?",
    fields: [
      { key: "offerName", label: "Offer Name", placeholder: "e.g. The Revenue Acceleration Program", required: true, type: "text" },
      { key: "price", label: "Price (USD)", placeholder: "e.g. 5000", required: true, type: "number" },
      { key: "offerType", label: "Offer Type", required: true, type: "select", options: ["coaching", "consulting", "done-for-you", "course", "hybrid"] },
      { key: "deliveryFormat", label: "Delivery Format", required: true, type: "select", options: ["1:1", "group", "async", "mixed"] },
      { key: "durationWeeks", label: "Duration (weeks)", placeholder: "e.g. 12", required: true, type: "number" },
    ],
  },
  {
    id: 2,
    title: "Ideal Buyer",
    subtitle: "Who is this for?",
    fields: [
      { key: "icpRole", label: "Buyer Role / Title", placeholder: "e.g. Founder, Sales Director, CMO", required: true, type: "text" },
      { key: "icpStage", label: "Buyer Stage", placeholder: "e.g. $500k–$2M ARR, series A, early-stage", required: true, type: "text" },
      { key: "icpIncomeOrBudgetRange", label: "Income or Budget Range", placeholder: "e.g. $500k–$2M revenue, $10k–$50k budget", required: true, type: "text" },
      { key: "buyerAuthority", label: "Purchasing Authority", required: true, type: "select", options: ["self", "manager", "owner", "committee"] },
    ],
  },
  {
    id: 3,
    title: "Problem & Outcome",
    subtitle: "What transformation do you deliver?",
    fields: [
      { key: "problemStatement", label: "Problem Statement", placeholder: "Describe the core problem your buyer is experiencing...", required: true, type: "textarea", maxLen: 1200 },
      { key: "costOfInaction", label: "Cost of Inaction", placeholder: "What does it cost them (time, money, opportunity) to not solve this?", required: false, type: "textarea", maxLen: 1200 },
      { key: "desiredOutcome", label: "Desired Outcome", placeholder: "What specific, measurable result do they achieve?", required: true, type: "textarea", maxLen: 1200 },
      { key: "timeToOutcome", label: "Time to Outcome", placeholder: "e.g. 90 days, 6 months", required: true, type: "text" },
    ],
  },
  {
    id: 4,
    title: "Differentiation & Proof",
    subtitle: "Why you? Why this?",
    fields: [
      { key: "uniqueMechanism", label: "Unique Mechanism", placeholder: "What's the proprietary method, framework, or process that makes your approach work?", required: true, type: "textarea", maxLen: 1200 },
      { key: "mainAlternatives", label: "Main Alternatives", placeholder: "What else do buyers try before (or instead of) working with you?", required: false, type: "textarea", maxLen: 1200 },
      { key: "proofAssets", label: "Proof Assets", placeholder: "e.g. 3 case studies with revenue results, 12 testimonials, featured in Forbes...", required: false, type: "textarea", maxLen: 1200 },
    ],
  },
  {
    id: 5,
    title: "Delivery & Capacity",
    subtitle: "Can you deliver at scale?",
    fields: [
      { key: "weeklyTimeRequiredFromYou", label: "Weekly Time Required From You", placeholder: "e.g. 4 hours per client per week", required: true, type: "text" },
      { key: "capacityPerMonth", label: "Capacity Per Month (clients)", placeholder: "e.g. 5 clients", required: true, type: "text" },
      { key: "keyDependencies", label: "Key Dependencies", placeholder: "Anything external required to deliver? (tools, contractors, third parties)", required: false, type: "textarea", maxLen: 1200 },
    ],
  },
  {
    id: 6,
    title: "Launch Plan",
    subtitle: "How will you sell it?",
    fields: [
      { key: "primaryAcquisitionChannel", label: "Primary Acquisition Channel", placeholder: "e.g. LinkedIn outbound, referrals, paid ads, podcast, email list", required: true, type: "text" },
      { key: "expectedSalesCycle", label: "Expected Sales Cycle", placeholder: "e.g. 2-week, 30-day, single call close", required: true, type: "text" },
      { key: "currentAudienceSize", label: "Current Audience Size", placeholder: "e.g. 2,000 LinkedIn followers, 500 email subscribers, no audience yet", required: false, type: "text" },
    ],
  },
  {
    id: 7,
    title: "Supporting Files",
    subtitle: "Optional: upload assets for a richer analysis",
    fields: [],
    isUpload: true,
  },
  {
    id: 8,
    title: "Competitor Context",
    subtitle: "Optional: tell us what your buyers compare you to",
    fields: [],
    isCompetitor: true,
  },
  {
    id: 9,
    title: "Your Details",
    subtitle: "Where should we send your report?",
    fields: [
      { key: "email", label: "Email Address", placeholder: "you@yourcompany.com", required: true, type: "email" },
    ],
    isLast: true,
  },
];

const ALLOWED_UPLOAD_TYPES = ["application/pdf", "image/png", "image/jpeg"];
const ALLOWED_UPLOAD_EXT = [".pdf", ".png", ".jpg", ".jpeg"];
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 3;

export default function StartPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [consent, setConsent] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState("");
  const [competitors, setCompetitors] = useState<{ name: string; price: string; promise: string }[]>([
    { name: "", price: "", promise: "" },
  ]);

  const totalSteps = INTAKE_STEPS.length;
  const currentStep = INTAKE_STEPS[step - 1];

  function handleChange(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function validateStep(): boolean {
    const newErrors: Record<string, string> = {};
    for (const field of currentStep.fields) {
      if (field.required && !data[field.key]?.trim()) {
        newErrors[field.key] = "This field is required";
      }
    }
    if (currentStep.isLast) {
      if (!consent) newErrors.consent = "You must agree to proceed";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError("");
    const incoming = Array.from(e.target.files || []);
    const combined = [...uploadFiles];
    for (const f of incoming) {
      if (combined.length >= MAX_FILES) {
        setUploadError(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_UPLOAD_EXT.includes(ext) && !ALLOWED_UPLOAD_TYPES.includes(f.type)) {
        setUploadError(`File type not allowed: ${f.name}. Accepted: PDF, PNG, JPG.`);
        e.target.value = "";
        return;
      }
      if (f.size > MAX_TOTAL_BYTES) {
        setUploadError(`File too large: ${f.name}. Max 10MB per upload.`);
        e.target.value = "";
        return;
      }
      combined.push(f);
    }
    const totalBytes = combined.reduce((s, f) => s + f.size, 0);
    if (totalBytes > MAX_TOTAL_BYTES) {
      setUploadError("Total file size exceeds 10MB limit.");
      e.target.value = "";
      return;
    }
    setUploadFiles(combined);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setUploadFiles((prev) => prev.filter((_, i) => i !== idx));
    setUploadError("");
  }

  const initTurnstile = () => {
    if (typeof window !== "undefined" && (window as any).turnstile && turnstileRef.current) {
      if (!turnstileToken && turnstileRef.current.children.length === 0) {
        (window as any).turnstile.render(turnstileRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          theme: "dark",
        });
      }
    }
  };

  if (currentStep.isLast) {
    setTimeout(initTurnstile, 100);
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    if (!turnstileToken && process.env.NODE_ENV !== "development") {
      setGlobalError("Please complete the bot verification.");
      return;
    }
    setLoading(true);
    setGlobalError("");
    try {
      let uploadedKeys: string[] = [];

      if (uploadFiles.length > 0) {
        const WORKER_URL = (() => {
          const url = process.env.NEXT_PUBLIC_WORKER_URL;
          if (!url) {
            if (process.env.NODE_ENV === "production") {
              throw new Error(
                "Configuration error: NEXT_PUBLIC_WORKER_URL is not set. Contact support."
              );
            }
            return "http://localhost:8787";
          }
          return url;
        })();
        const formData = new FormData();
        formData.append("turnstileToken", turnstileToken || "dev-bypass");
        for (const file of uploadFiles) {
          formData.append("files", file);
        }
        const upRes = await fetch(`${WORKER_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });
        if (!upRes.ok) {
          const upErr = await upRes.json() as { error: string };
          throw new Error(upErr.error || "File upload failed");
        }
        const upData = await upRes.json() as { keys: string[] };
        uploadedKeys = upData.keys;
      }

      const { checkoutUrl } = await createCheckout({
        intake: data,
        email: data.email,
        turnstileToken: turnstileToken || "dev-bypass",
        uploadedFileKeys: uploadedKeys,
        competitors: competitors.filter((c) => c.name.trim() !== ""),
      });
      window.location.href = checkoutUrl;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setGlobalError(msg);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-parchment">
      <Nav />
      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">

        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="mono text-xs text-parchment-muted tracking-wider">Step {step} of {totalSteps}</p>
            <p className="mono text-xs text-gold">{Math.round((step / totalSteps) * 100)}%</p>
          </div>
          <div className="h-px bg-[#1a1a1a] relative">
            <div className="absolute top-0 left-0 h-full bg-gold transition-all duration-500" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-3">
            {INTAKE_STEPS.map((s) => (
              <div key={s.id} className={`h-1.5 w-1.5 rounded-full transition-colors ${s.id < step ? "bg-gold" : s.id === step ? "bg-gold-light" : "bg-[#2a2a2a]"}`} />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div key={step} className="fade-up">
          <p className="mono text-xs text-gold tracking-[0.2em] uppercase mb-2">{currentStep.subtitle}</p>
          <h1 className="text-3xl font-light mb-10">{currentStep.title}</h1>

          <div className="space-y-8">
            {/* Regular fields */}
            {currentStep.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-parchment-dim mb-2 tracking-wide">
                  {field.label}
                  {field.required && <span className="text-gold ml-1">*</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    value={data[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full bg-ink-soft border border-[#2a2a2a] text-parchment px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors appearance-none"
                  >
                    <option value="">Select…</option>
                    {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : field.type === "textarea" ? (
                  <div>
                    <textarea
                      value={data[field.key] || ""}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.maxLen}
                      rows={4}
                      className="w-full bg-ink-soft border border-[#2a2a2a] text-parchment px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                    />
                    {field.maxLen && (
                      <p className="mono text-xs text-parchment-muted mt-1 text-right">
                        {(data[field.key] || "").length}/{field.maxLen}
                      </p>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={data[field.key] || ""}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-ink-soft border border-[#2a2a2a] text-parchment px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                )}
                {errors[field.key] && <p className="text-xs text-red-400 mt-1">{errors[field.key]}</p>}
              </div>
            ))}

            {/* Step 7: Upload step */}
            {currentStep.isUpload && (
              <div className="space-y-6">
                <div className="border border-[#2a2a2a] bg-ink-soft p-6">
                  <p className="mono text-xs text-gold tracking-[0.2em] uppercase mb-3">Included with your $39 report</p>
                  <p className="text-sm text-parchment-dim leading-relaxed mb-6">
                    You can optionally upload up to {MAX_FILES} supporting files — sales decks, case studies, landing page screenshots, or testimonials. These are used to enrich your analysis and are <strong className="text-parchment font-normal">automatically deleted after 7 days</strong>.
                  </p>
                  <p className="text-xs text-parchment-muted mb-4">
                    Accepted: PDF, PNG, JPG &nbsp;·&nbsp; Max {MAX_FILES} files &nbsp;·&nbsp; 10MB total
                  </p>

                  <label className="block">
                    <div className="border border-dashed border-[#3a3a3a] hover:border-gold transition-colors cursor-pointer p-6 text-center">
                      <p className="text-sm text-parchment-muted">
                        <span className="text-gold">Choose files</span> or drag and drop
                      </p>
                      <p className="text-xs text-parchment-muted mt-1">PDF, PNG, JPG up to 10MB total</p>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={uploadFiles.length >= MAX_FILES}
                      />
                    </div>
                  </label>

                  {uploadFiles.length > 0 && (
                    <ul className="mt-4 space-y-2">
                      {uploadFiles.map((f, idx) => (
                        <li key={f.name + idx} className="flex items-center justify-between text-xs text-parchment-dim bg-ink p-3 border border-[#2a2a2a]">
                          <span className="flex items-center gap-2">
                            <span className="text-gold">↳</span>
                            {f.name}
                            <span className="text-parchment-muted">({(f.size / 1024).toFixed(0)}KB)</span>
                          </span>
                          <button
                            onClick={() => removeFile(idx)}
                            className="text-parchment-muted hover:text-red-400 transition-colors ml-4 shrink-0"
                            aria-label="Remove file"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {uploadError && <p className="text-xs text-red-400 mt-3">{uploadError}</p>}

                  {uploadFiles.length >= MAX_FILES && (
                    <p className="text-xs text-parchment-muted mt-3 italic">Maximum {MAX_FILES} files selected.</p>
                  )}
                </div>

                <p className="text-xs text-parchment-muted italic">
                  Skip this step if you don't have supporting files — your report will be generated from your intake answers alone.
                </p>
              </div>
            )}

            {/* Step 8: Competitor Context (skippable) */}
            {currentStep.isCompetitor && (
              <div className="space-y-6">
                <div className="border border-[#2a2a2a] bg-ink-soft p-6">
                  <p className="mono text-xs text-gold tracking-[0.2em] uppercase mb-3">Optional — V2.5 Intelligence</p>
                  <p className="text-sm text-parchment-dim leading-relaxed mb-6">
                    Enter up to 5 competitors your buyers typically compare you against. We'll use this to compute your market saturation level and differentiation gap. This step is completely optional — skip it if you prefer.
                  </p>

                  <div className="space-y-4">
                    {competitors.map((comp, idx) => (
                      <div key={idx} className="border border-[#2a2a2a] p-4 space-y-3 relative">
                        <p className="mono text-xs text-parchment-muted tracking-widest uppercase">
                          Competitor {idx + 1}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-parchment-dim mb-1">Name</label>
                            <input
                              type="text"
                              value={comp.name}
                              onChange={(e) => {
                                const updated = [...competitors];
                                updated[idx] = { ...updated[idx], name: e.target.value };
                                setCompetitors(updated);
                              }}
                              placeholder="e.g. John Smith Consulting"
                              className="w-full bg-ink border border-[#2a2a2a] text-parchment px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-parchment-dim mb-1">Their Price (USD)</label>
                            <input
                              type="text"
                              value={comp.price}
                              onChange={(e) => {
                                const updated = [...competitors];
                                updated[idx] = { ...updated[idx], price: e.target.value };
                                setCompetitors(updated);
                              }}
                              placeholder="e.g. 3000"
                              className="w-full bg-ink border border-[#2a2a2a] text-parchment px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-parchment-dim mb-1">Their Promise / Positioning</label>
                          <input
                            type="text"
                            value={comp.promise}
                            onChange={(e) => {
                              const updated = [...competitors];
                              updated[idx] = { ...updated[idx], promise: e.target.value };
                              setCompetitors(updated);
                            }}
                            placeholder="e.g. Scale your agency to 7 figures with our proven framework"
                            className="w-full bg-ink border border-[#2a2a2a] text-parchment px-3 py-2 text-sm focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                        {competitors.length > 1 && (
                          <button
                            onClick={() => setCompetitors(competitors.filter((_, i) => i !== idx))}
                            className="absolute top-3 right-3 text-parchment-muted hover:text-red-400 transition-colors text-xs mono"
                            aria-label="Remove competitor"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {competitors.length < 5 && (
                    <button
                      onClick={() => setCompetitors([...competitors, { name: "", price: "", promise: "" }])}
                      className="mt-4 text-xs text-gold hover:text-gold-light transition-colors mono tracking-widest uppercase"
                    >
                      + Add Competitor
                    </button>
                  )}
                </div>

                <p className="text-xs text-parchment-muted italic">
                  Skip this step if you don't have competitor data — your saturation analysis will default to Low with no competitor context.
                </p>
              </div>
            )}

            {/* Final step: consent + turnstile */}
            {currentStep.isLast && (
              <>
                <div>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      className={`mt-0.5 w-4 h-4 border shrink-0 flex items-center justify-center transition-colors ${consent ? "bg-gold border-gold" : "border-[#3a3a3a] group-hover:border-gold"}`}
                      onClick={() => setConsent(!consent)}
                    >
                      {consent && <span className="text-ink text-xs leading-none">✓</span>}
                    </div>
                    <span className="text-sm text-parchment-dim leading-relaxed">
                      I agree that my intake responses will be analyzed by AI to generate my report. I understand this is a one-time purchase and my report will be delivered immediately.
                    </span>
                  </label>
                  {errors.consent && <p className="text-xs text-red-400 mt-2">{errors.consent}</p>}
                </div>
                <div>
                  <div ref={turnstileRef} />
                  {!turnstileToken && (
                    <p className="text-xs text-parchment-muted mt-2">Complete the verification above before proceeding.</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="text-sm text-parchment-muted hover:text-parchment transition-colors disabled:opacity-30 disabled:cursor-not-allowed tracking-wider uppercase"
            >
              ← Back
            </button>

            {step < totalSteps ? (
              <button onClick={handleNext} className="bg-gold text-ink px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors">
                {currentStep.isUpload
                  ? (uploadFiles.length > 0 ? `Continue with ${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} →` : "Skip & Continue →")
                  : currentStep.isCompetitor
                  ? (competitors.some((c) => c.name.trim()) ? "Continue →" : "Skip & Continue →")
                  : "Continue →"}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gold text-ink px-8 py-3 text-sm tracking-widest uppercase hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                    Processing…
                  </>
                ) : (
                  "Proceed to Payment — $39"
                )}
              </button>
            )}
          </div>

          {globalError && (
            <div className="mt-6 p-4 border border-red-800 bg-red-950/30">
              <p className="text-sm text-red-400">{globalError}</p>
            </div>
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-[#1a1a1a]">
          <div className="flex flex-wrap gap-6 text-xs text-parchment-muted">
            <span>🔒 Stripe Checkout — PCI Compliant</span>
            <span>📄 Report generated immediately after payment</span>
            <span>✉️ Private report link (available for 90 days)</span>
            <span>🗑️ Uploaded supporting files deleted after 7 days</span>
          </div>
        </div>
      </div>
    </main>
  );
}
