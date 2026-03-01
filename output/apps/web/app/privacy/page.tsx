import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How OfferIntegrity collects, uses, and protects your data.",
  alternates: { canonical: "https://offerintegrity.io/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-sm leading-relaxed">
      <Link href="/" className="text-xs uppercase tracking-widest text-gold opacity-70 hover:opacity-100">
        ← Back
      </Link>

      <h1 className="mt-8 mb-2 text-2xl font-semibold">Privacy Policy</h1>
      <p className="text-xs opacity-50 mb-10">Last updated: June 2025</p>

      <Section title="Who we are">
        OfferIntegrity (&ldquo;we&rdquo;, &ldquo;our&rdquo;) operates the website{" "}
        <a href="https://offerintegrity.io" className="underline">offerintegrity.io</a>. We
        provide a paid offer-validation report service for founders and consultants.
      </Section>

      <Section title="What we collect">
        When you purchase a report we collect: your name, email address, and the intake
        questionnaire answers you submit. We also receive standard payment data via Stripe
        (we never see or store your full card number). We may collect basic traffic analytics
        via Cloudflare Web Analytics (cookieless).
      </Section>

      <Section title="How we use your data">
        Your intake data is used solely to generate your personalised report. Your email is
        used to deliver the report and, only if you opt in, occasional product updates. We do
        not sell, rent, or share your personal data with third parties for marketing.
      </Section>

      <Section title="Third-party processors">
        <ul className="list-disc ml-4 mt-1 space-y-1">
          <li><strong>Stripe</strong> — payment processing (PCI-DSS compliant)</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Cloudflare</strong> — hosting, edge network, analytics</li>
          <li><strong>OpenAI</strong> — AI-assisted report generation (data is not used for model training per our API agreement)</li>
        </ul>
      </Section>

      <Section title="Data retention">
        Report data is stored in Cloudflare KV with no automatic expiry. You may request
        deletion at any time by emailing us.
      </Section>

      <Section title="Your rights">
        You have the right to access, correct, or delete your personal data. To exercise
        these rights, email{" "}
        <a href="mailto:privacy@offerintegrity.io" className="underline">
          privacy@offerintegrity.io
        </a>.
      </Section>

      <Section title="Cookies">
        We do not use tracking cookies. Cloudflare Web Analytics is cookieless. Stripe may
        set a cookie for fraud-prevention purposes on the checkout page.
      </Section>

      <Section title="Changes">
        We may update this policy. Material changes will be noted at the top of this page.
        Continued use of the service after changes constitutes acceptance.
      </Section>

      <Section title="Contact">
        <a href="mailto:privacy@offerintegrity.io" className="underline">
          privacy@offerintegrity.io
        </a>
      </Section>

      <div className="mt-12 border-t border-white/10 pt-6 text-xs opacity-40">
        <Link href="/terms">Terms of Service</Link>
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
