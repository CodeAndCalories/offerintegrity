export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-neutral-200 px-6 py-20">
      <div className="max-w-3xl mx-auto space-y-10">
        <h1 className="text-4xl font-semibold text-white">Terms of Service</h1>

        <p>
          By using OfferIntegrity.io, you agree to the following terms.
        </p>

        <h2 className="text-2xl font-semibold text-white">Service Overview</h2>
        <p>
          OfferIntegrity provides validation reports based on the information
          submitted. Results are advisory and not financial guarantees.
        </p>

        <h2 className="text-2xl font-semibold text-white">Payments</h2>
        <p>
          All payments are processed securely through Stripe. Refunds are not
          guaranteed once a report has been generated.
        </p>

        <h2 className="text-2xl font-semibold text-white">Limitation of Liability</h2>
        <p>
          OfferIntegrity is not responsible for business outcomes resulting
          from implementation of report recommendations.
        </p>

        <p className="text-sm text-neutral-500">
          Last updated: March 2026
        </p>
      </div>
    </main>
  );
}