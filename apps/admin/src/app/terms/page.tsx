export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: July 8, 2026</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using the FamilyCare TV application, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Subscriptions and Billing</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            FamilyCare TV offers premium subscription tiers (Personal and Family). 
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.</li>
            <li>Payment will be charged to your Google Play or App Store account upon confirmation of purchase.</li>
            <li>You may manage or cancel your subscription at any time through your platform's subscription settings.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            You agree to use the Application exclusively for its intended purpose of personal and family health management. You must not:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Use the Application to store illegal data or harass others.</li>
            <li>Attempt to reverse-engineer the underlying AI, API, or backend systems.</li>
            <li>Use the platform in any way that violates applicable local, state, or national laws.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Limitation of Liability</h2>
          <p className="text-gray-700 leading-relaxed">
            FamilyCare TV and its developers shall not be held liable for any damages resulting from the use or inability to use the service, including but not missed medical appointments or failure to take medications. The platform is an organizational tool, and ultimate responsibility for health management rests with the user.
          </p>
        </section>
      </div>
    </div>
  );
}
