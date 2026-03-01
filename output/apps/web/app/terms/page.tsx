import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the OfferIntegrity report service.",
  alternates: { canonical: "https://offerintegrity.io/terms" },
};

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <Link href="/" className="text-xs uppercase tracking-widest text-gold opacity-70 hover:opacity-100">
        ← Back
      </Link>

      <h1 className="mt-8 mb-2 text-2xl font-semibold">Terms of Service</h1>
      <p className="text-xs opacity-50 mb-10">Last updated: June 2025</p>

      <Section title="1. The service">
        OfferIntegrity provides a one-time, AI-assisted offer validation report based on the
        intake information you supply. The report is informational and analytical in nature.
        It does not constitute legal, financial, or business consulting advice.
      </Section>

      <Section title="2. Payment and refunds">
        Payment is processed via Stripe. The fee is charged once at checkout. Because the
        report is generated immediately upon payment confirmation, we do not offer refunds
        once your report has been delivered. If you experience a technical issue that
        prevents delivery, contact us within 7 days and we will resolve it or issue a full
        refund at our discretion.
      </Section>

      <Section title="3. Accuracy and limitations">
        Report quality depends on the accuracy and completeness of your intake answers. We
        make no guarantees about specific business outcomes. Results will vary. You are
        responsible for how you act on the report&apos;s recommendations.
      </Section>

      <Section title="4. Intellectual property">
        Your report is generated for your personal or business use. You may share or
        republish your own report. You may not resell or redistribute the underlying
        methodology or template. The OfferIntegrity name, logo, and brand are our
        intellectual property.
      </Section>

      <Section title="5. Acceptable use">
        You agree not to submit false or misleading intake data, attempt to scrape or reverse
        engineer the service, or use the service in any way that violates applicable law.
      </Section>

      <Section title="6. Limitation of liability">
        To the maximum extent permitted by law, OfferIntegrity&apos;s liability for any claim
        related to the service is limited to the amount you paid for that report.
      </Section>

      <Section title="7. Governing law">
        These terms are governed by the laws of England and Wales. Any disputes shall be
        subject to the exclusive jurisdiction of the courts of England and Wales.
      </Section>

      <Section title="8. Contact">
        <a href="mailto:hello@offerintegrity.io" className="underline">
          hello@offerintegrity.io
        </a>
      </Section>

      <div className="mt-12 border-t border-white/10 pt-6 text-xs opacity-40">
        <Link href="/privacy">Privacy Policy</Link>
        {" · "}
        <Link href="/">Home</Link>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold mb-2">{title}</h2>
      <div className="opacity-70">{children}</div>
    </section>
  );
}
