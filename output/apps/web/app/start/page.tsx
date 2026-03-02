"use client";

import { useState, useRef } from "react";
import WizardProgress from "../../components/WizardProgress";
import FieldError from "../../components/FieldError";

// ─── Types ─────────────────────────────────────────────────────────────────

interface IntakeAnswers {
  name: string;
  email: string;
  offerName: string;
  offerDescription: string;
  targetAudience: string;
  pricePoint: string;
  desiredOutcome: string;
  currentProof: string;
  mainObjections: string;
  currentConversion: string;
  biggestGap: string;
  nextLaunchDate: string;
}

const INITIAL_ANSWERS: IntakeAnswers = {
  name: "",
  email: "",
  offerName: "",
  offerDescription: "",
  targetAudience: "",
  pricePoint: "",
  desiredOutcome: "",
  currentProof: "",
  mainObjections: "",
  currentConversion: "",
  biggestGap: "",
  nextLaunchDate: "",
};

// ─── Step config ───────────────────────────────────────────────────────────

const STEPS = [
  "About you",
  "Your offer",
  "Your audience",
  "Proof & objections",
  "Conversion",
  "Files (optional)",
  "Review & pay",
];

const PRICE_LABEL = "$149";
const MAX_FILES = 3;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
const ALLOWED_EXT = [".pdf", ".docx", ".txt"];

// ─── Component ─────────────────────────────────────────────────────────────

export default function StartPage() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<IntakeAnswers>(INITIAL_ANSWERS);
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeAnswers | "files", string>>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (field: keyof IntakeAnswers) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setAnswers((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ── Validation ─────────────────────────────────────────────────────────

  function validateStep(s: number): boolean {
    const newErrors: typeof errors = {};

    if (s === 1) {
      if (!answers.name.trim()) newErrors.name = "Please enter your name.";
      if (!answers.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.email))
        newErrors.email = "Please enter a valid email address.";
    }
    if (s === 2) {
      if (!answers.offerName.trim()) newErrors.offerName = "What is your offer called?";
      if (answers.offerDescription.trim().length < 30)
        newErrors.offerDescription = "Please describe your offer in at least 30 characters.";
      if (!answers.pricePoint.trim()) newErrors.pricePoint = "What is the price of your offer?";
      if (answers.desiredOutcome.trim().length < 20)
        newErrors.desiredOutcome = "Describe the outcome your client achieves.";
    }
    if (s === 3) {
      if (answers.targetAudience.trim().length < 20)
        newErrors.targetAudience = "Describe your target audience in more detail.";
    }
    if (s === 4) {
      if (answers.currentProof.trim().length < 20)
        newErrors.currentProof = "Describe your current proof — case studies, testimonials, etc.";
      if (answers.mainObjections.trim().length < 20)
        newErrors.mainObjections = "List the main objections you hear.";
    }
    if (s === 5) {
      if (!answers.currentConversion.trim())
        newErrors.currentConversion = "Please estimate your current close rate.";
      if (answers.biggestGap.trim().length < 20)
        newErrors.biggestGap = "Describe where you think your offer is weakest.";
    }
    // Step 6 (files) is optional — no validation required

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => s + 1);
  }
  function prevStep() {
    setStep((s) => Math.max(1, s - 1));
  }

  // ── File handling ──────────────────────────────────────────────────────

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError("");
    const selected = Array.from(e.target.files ?? []);
    const combined = [...files, ...selected];

    if (combined.length > MAX_FILES) {
      setFileError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }

    const invalidType = combined.find(
      (f) => !ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXT.some((ext) => f.name.toLowerCase().endsWith(ext))
    );
    if (invalidType) {
      setFileError(`${invalidType.name} is not allowed. Upload PDF, DOCX, or TXT only.`);
      return;
    }

    const totalSize = combined.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_BYTES) {
      setFileError("Total file size must be under 10 MB.");
      return;
    }

    setFiles(combined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setFileError("");
  }

  // ── Submit ─────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const workerUrl = process.env.NEXT_PUBLIC_WORKER_URL ?? "";

      // 1. Upload files if any
      let uploadedKeys: string[] = [];
      if (files.length > 0) {
        setUploading(true);
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const upRes = await fetch(`${workerUrl}/api/upload`, {
          method: "POST",
          body: fd,
        });
        if (!upRes.ok) {
          const err = await upRes.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? "File upload failed.");
        }
        const upData = await upRes.json() as { keys: string[] };
        uploadedKeys = upData.keys ?? [];
        setUploading(false);
      }

      // 2. Submit intake + request checkout session
      const body = {
        ...answers,
        uploadedKeys,
        turnstileToken,
      };

      const res = await fetch(`${workerUrl}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Something went wrong. Please try again.");
      }

      const data = await res.json() as { url: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned.");
      }
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Unexpected error. Please try again.");
      setUploading(false);
      setSubmitting(false);
    }
  }

  // ── Render helpers ─────────────────────────────────────────────────────

  function Field({
    label,
    hint,
    field,
    type = "text",
    multiline = false,
    rows = 3,
    placeholder = "",
    children,
  }: {
    label: string;
    hint?: string;
    field: keyof IntakeAnswers;
    type?: string;
    multiline?: boolean;
    rows?: number;
    placeholder?: string;
    children?: React.ReactNode;
  }) {
    const base =
      "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors text-sm";
    return (
      <div className="mb-5">
        <label className="block text-sm font-medium text-white/80 mb-1">{label}</label>
        {hint && <p className="text-xs text-white/40 mb-2">{hint}</p>}
        {children ?? (
          multiline ? (
            <textarea
              className={base}
              rows={rows}
              value={answers[field]}
              onChange={set(field)}
              placeholder={placeholder}
            />
          ) : (
            <input
              type={type}
              className={base}
              value={answers[field]}
              onChange={set(field)}
              placeholder={placeholder}
            />
          )
        )}
        {errors[field] && <FieldError message={errors[field]!} />}
      </div>
    );
  }

  // ── Steps ──────────────────────────────────────────────────────────────

  function renderStep() {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">About you</h2>
            <Field label="Your name" field="name" placeholder="Jane Smith" />
            <Field label="Email address" field="email" type="email" placeholder="jane@example.com" hint="Your report will be sent here." />
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Your offer</h2>
            <Field label="Offer name" field="offerName" placeholder="e.g. The Agency Growth Accelerator" />
            <Field
              label="Describe your offer"
              field="offerDescription"
              multiline
              rows={4}
              placeholder="What do clients get? What's included? What's the format?"
              hint="Be specific — this drives the quality of your analysis."
            />
            <Field
              label="Price point"
              field="pricePoint"
              placeholder="e.g. $8,500 one-time / $1,500/month"
              hint="Include the currency and payment structure."
            />
            <Field
              label="Desired client outcome"
              field="desiredOutcome"
              multiline
              rows={3}
              placeholder="What specific, measurable outcome does your client achieve?"
              hint="'Build a business' is too vague. 'Go from 2 to 10 recurring clients in 90 days' is specific."
            />
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Your audience</h2>
            <Field
              label="Who is this offer for?"
              field="targetAudience"
              multiline
              rows={4}
              placeholder="Describe the specific type of person who buys this offer — their role, situation, pain, and goals."
              hint="The more specific, the better your analysis."
            />
            <Field
              label="When is your next launch or promotion? (optional)"
              field="nextLaunchDate"
              placeholder="e.g. March 2025, Q2, ongoing"
            />
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Proof & objections</h2>
            <Field
              label="What proof do you currently have?"
              field="currentProof"
              multiline
              rows={4}
              placeholder="List your case studies, testimonials, credentials, and any measurable results clients have achieved."
              hint="Include timeframes and specifics where you have them."
            />
            <Field
              label="What are the main objections you hear?"
              field="mainObjections"
              multiline
              rows={3}
              placeholder="e.g. 'The price is too high', 'I don't have time', 'I'm not sure it will work for my niche'"
            />
          </>
        );

      case 5:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Conversion & gaps</h2>
            <Field
              label="Current close rate (estimate)"
              field="currentConversion"
              placeholder="e.g. 20%, 1 in 5, unsure"
              hint="Approximate is fine. If you're not sure, say so."
            />
            <Field
              label="Where do you think your offer is weakest?"
              field="biggestGap"
              multiline
              rows={4}
              placeholder="What do you suspect is the main reason prospects don't buy?"
              hint="Your instinct here is valuable data — we'll compare it against the 7-pillar analysis."
            />
          </>
        );

      case 6:
        return (
          <>
            <h2 className="text-xl font-bold mb-2">Supporting files</h2>
            <p className="text-sm text-white/50 mb-6">
              Optional — but recommended. Upload your sales page, pitch deck, or testimonials and
              they&apos;ll be reviewed as part of your analysis.{" "}
              <span className="text-yellow-400">Included at no extra cost.</span>
            </p>

            <div className="space-y-3 mb-5">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-white">{f.name}</p>
                    <p className="text-xs text-white/30">{(f.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-xs text-red-400 hover:text-red-300 ml-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {files.length < MAX_FILES && (
              <div>
                <label className="inline-block cursor-pointer bg-white/5 border border-white/10 hover:border-yellow-400/40 rounded-lg px-5 py-3 text-sm text-white/70 transition-colors">
                  + Add file
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt"
                    multiple
                    onChange={handleFileAdd}
                  />
                </label>
                <p className="text-xs text-white/30 mt-2">
                  PDF, DOCX, or TXT · Max {MAX_FILES} files · 10 MB total
                </p>
              </div>
            )}

            {fileError && <FieldError message={fileError} />}

            <p className="text-xs text-white/20 mt-6">
              Skip this step if you don&apos;t have files ready — you can proceed without uploading.
            </p>
          </>
        );

      case 7:
        return (
          <>
            <h2 className="text-xl font-bold mb-6">Review & pay</h2>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6 space-y-2 text-sm">
              <ReviewRow label="Name" value={answers.name} />
              <ReviewRow label="Email" value={answers.email} />
              <ReviewRow label="Offer" value={answers.offerName} />
              <ReviewRow label="Price point" value={answers.pricePoint} />
              <ReviewRow label="Close rate" value={answers.currentConversion} />
              {files.length > 0 && (
                <ReviewRow label="Files" value={`${files.length} file(s) attached`} />
              )}
            </div>

            <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">7-Pillar Offer Validation Report</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Delivered to {answers.email} within 60 minutes
                    {files.length > 0 && " · Includes file review"}
                  </p>
                </div>
                <p className="text-2xl font-bold text-yellow-400">{PRICE_LABEL}</p>
              </div>
            </div>

            {/* Turnstile placeholder — widget renders here */}
            <div id="turnstile-widget" className="mb-5" />

            {submitError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{submitError}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-yellow-400 text-black font-bold py-4 rounded-lg text-lg hover:bg-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading
                ? "Uploading files…"
                : submitting
                ? "Redirecting to checkout…"
                : `Pay ${PRICE_LABEL} & Get My Report →`}
            </button>
            <p className="text-xs text-white/30 text-center mt-3">
              Stripe-secured · PDF delivered by email · No subscription
            </p>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Back to home */}
        <a href="/" className="text-xs text-white/30 hover:text-white/60 mb-8 inline-block transition-colors">
          ← OfferIntegrity
        </a>

        <WizardProgress current={step} total={STEPS.length} labels={STEPS} />

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          {renderStep()}

          {/* Navigation */}
          {step < 7 && (
            <div className="flex justify-between mt-6 pt-5 border-t border-white/5">
              {step > 1 ? (
                <button
                  onClick={prevStep}
                  className="text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <span />
              )}
              <button
                onClick={nextStep}
                className="bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-yellow-300 transition-colors"
              >
                {step === 6 ? "Review →" : "Next →"}
              </button>
            </div>
          )}

          {step === 7 && step > 1 && (
            <button
              onClick={prevStep}
              className="text-sm text-white/30 hover:text-white/60 mt-4 block transition-colors"
            >
              ← Edit answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/30">{label}</span>
      <span className="text-white/80 text-right max-w-[60%] truncate">{value || "—"}</span>
    </div>
  );
}
