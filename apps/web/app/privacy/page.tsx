export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-200 px-6 py-20">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-4xl font-semibold text-white">Privacy Policy</h1>

        <p>
          OfferIntegrity.io respects your privacy. We collect only the
          information necessary to generate your validation report and
          process payments securely.
        </p>

        <h2 className="text-2xl font-semibold text-white">Information We Collect</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Email address</li>
          <li>Offer submission details</li>
          <li>Payment information (processed securely via Stripe)</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white">How We Use Your Data</h2>
        <p>
          Your data is used strictly to generate your report and communicate
          results. We do not sell or share your information.
        </p>

        <h2 className="text-2xl font-semibold text-white">Data Security</h2>
        <p>
          We use secure infrastructure and encrypted payment processing to
          protect your information.
        </p>

        <p className="text-sm text-neutral-500">
          Last updated: March 2026
        </p>
      </div>
    </main>
  );
}